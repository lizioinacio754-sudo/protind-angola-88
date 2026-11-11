# PROTIND — Explicação técnica do SQL do esquema `protind`

Ficheiro revisto: `docs/sql/01-protind-schema.review.sql` (1055 linhas).
Estado: **validado em PostgreSQL 17 local temporário (11-11-2026), não executado no Neon.**
A execução exige autorização expressa e confirmação inequívoca do ambiente.

## Resultado da validação local

- O ficheiro completo executa sem erros num PostgreSQL 17 limpo, com uma tabela
  simulada `neon_auth."user"` apenas para satisfazer as referências.
- Objectos criados: **29 tabelas, 168 índices (inclui chaves primárias e únicas),
  18 gatilhos, 14 funções, 115 chaves estrangeiras, 303 restrições CHECK**.
- Correcção aplicada durante a validação: a expressão `CASE` na função
  `validar_hierarquia` foi envolvida em parênteses — o analisador de PL/pgSQL
  terminava a condição do `IF` no `THEN` interno do `CASE` (erro de sintaxe).

### Regras de integridade testadas com casos válidos e inválidos

| Regra | Resultado |
|---|---|
| Hierarquia província → município → comuna | inserções válidas aceites |
| Província com unidade pai | recusada |
| Pai de tipo incompatível (comuna filha de província) | recusada |
| Eliminação física de registos | bloqueada em todas as tabelas funcionais |
| Segunda atribuição activa do mesmo papel ao mesmo utilizador | recusada (índice único parcial) |
| Perfil a referenciar província como município | recusado |
| Submissão sem data de submissão e concordância | recusada |
| Respostas em submissão já submetida | recusadas (só rascunhos aceitam respostas) |
| Segunda opção em pergunta de escolha única | recusada |
| Resposta ligada a pergunta de outra enquete | recusada (chave estrangeira composta) |
| Participação anónima (submissão sem utilizador) | permitida pela estrutura |

Nota: o ciclo territorial directo não é alcançável pelas regras de tipo
(imutáveis e com pai obrigatório de tipo superior); a verificação recursiva de
ciclos mantém-se como defesa adicional.

## Estrutura por etapas

### Etapa 1 — Transacção, pré-condições e esquema exclusivo
- Tudo corre numa única transacção (`BEGIN`/`COMMIT`): ou cria tudo ou nada.
- `lock_timeout` e `statement_timeout` limitados para não bloquear a base.
- Pré-condições: falha se o esquema `protind` já existir (nunca substitui
  objectos) e se `neon_auth.user.id` UUID não for encontrado.
- `CREATE SCHEMA protind` com `REVOKE ALL FROM PUBLIC` e privilégios por
  omissão revogados: **ninguém acede sem concessão explícita posterior**.

### Etapa 2 — Território e identidade
- `unidades_territoriais`: hierarquia província/município/comuna com
  auto-referência restritiva, vigência e limite GeoJSON validado
  (Polygon/MultiPolygon).
- `perfis_utilizador`: um perfil por utilizador de `neon_auth."user"`;
  telefone opcional e privado; sem duplicar contas nem credenciais.
- `papeis_acesso` + `atribuicoes_acesso`: catálogo de papéis
  (administrador, técnico, consulta) e atribuições com âmbito territorial
  opcional, revogação e índice único que impede atribuições activas
  duplicadas. **Nomes não conferem autoridade**: o servidor valida sessão e
  atribuições em cada operação. Nenhum utilizador recebe papel automático.

### Etapa 3 — Zonas, instalações e actividades
- `zonas_territoriais` com classificações sobreponíveis
  (`classificacoes_zona`: industrial, residencial, ambientalmente sensível).
- Extensões 1:1 (`detalhes_zona_industrial`, `detalhes_zona_residencial`,
  `detalhes_area_sensivel`) validadas por gatilhos: a zona tem de ter a
  classificação correspondente.
- `instalacoes_industriais` + `actividades_industriais` (N:N via
  `instalacao_actividades`): uma actividade principal vigente por instalação
  (índice único parcial) e coerência de datas.

### Etapa 4 — Enquetes públicas versionadas
- `enquetes` → `perguntas_enquete` → `opcoes_pergunta`; versão publicada fica
  imutável após respostas (gatilho).
- `submissoes_enquete` → `respostas_enquete` → `resposta_opcoes` com chaves
  estrangeiras compostas que garantem que pergunta e opções pertencem à mesma
  enquete; escolha única limitada a uma opção; respostas só em rascunho.
- Participação anónima admitida pela estrutura (utilizador opcional); a
  abertura da recolha depende de política de privacidade validada.
- Sem IP, identificação civil, telefone ou localização exacta por omissão.

### Etapa 5 — Observações, impactos, avaliações e medições
- `observacoes_ambientais` distingue relato de constatação validada
  (`estado`, `validado_por`).
- `impactos_ambientais` exige pelo menos uma referência de contexto.
- `avaliacoes_ambientais` com responsável autenticado, período e aprovação.
- `indicadores_ambientais` + `criterios_indicador` versionados (nenhum limite
  legal inventado) + `medicoes_ambientais` com método, fonte e qualidade.
- Gatilho `validar_contexto` garante coerência territorial entre unidade,
  zona e instalação referenciadas.

### Etapa 6 — Continuidade funcional, relatórios e auditoria
- `projectos_ambientais` (progresso 0–100, orçamento não negativo),
  `analises_ia` (recomendações marcadas como sugestões sujeitas a validação
  humana, nunca decisões nem medições), `relatorios` versionados com
  `relatorio_avaliacoes` N:N.
- `auditoria_eventos`: histórico apenas acrescentado pelo servidor; gatilhos
  bloqueiam actualização e eliminação; não guarda palavras-passe, tokens nem
  cópias integrais de respostas privadas.

### Etapa 7 — Índices
- Índices em todas as chaves estrangeiras e campos de auditoria
  (`criado_por`, `actualizado_por`) para suportar consultas e junções sem
  varrimentos completos.

### Etapa 8 — Funções e gatilhos de integridade
- Todas as funções são `SECURITY INVOKER` com `search_path` fixo
  (`pg_catalog, protind`): nenhuma assume identidade por parâmetros nem
  escala privilégios.
- `actualizar_data`: carimbo de actualização automático.
- `recusar_eliminacao`: eliminação física bloqueada; arquivo lógico
  (`arquivado_em`) preserva histórico.
- `validar_hierarquia`: tipo territorial imutável, pai de tipo compatível,
  verificação recursiva de ciclos, serialização por `pg_advisory_xact_lock`.
- `validar_municipio`, `validar_contexto`, validações de enquete e de
  classificação de zona conforme descrito acima.

## Permissões e segurança

- O esquema é criado **sem qualquer concessão**: após a execução, só o
  proprietário (a conta que executar) acede. A conta actual `neondb_owner` é
  proprietária e **não deve ser usada como credencial normal da aplicação**.
- A ligação da aplicação exige uma conta dedicada de acesso mínimo, criada
  pelo responsável no Neon (fora deste ambiente), com concessões `GRANT`
  específicas a preparar num ficheiro SQL separado após a execução do
  esquema.
- Nenhuma tabela gerida pelo `neon_auth` é alterada; as referências são
  apenas de leitura de identidade (`ON DELETE RESTRICT`).

## O que falta antes da execução

1. Confirmação do responsável de que `neondb` no endpoint identificado é o
   ambiente correcto (o conector não está associado ao projecto).
2. Autorização expressa para executar este ficheiro, uma única vez, na base
   confirmada.
3. Criação da conta dedicada de acesso mínimo e do SQL de concessões.
4. Definição da integração de identidade suportada (Neon Auth) e da matriz
   de acessos antes de qualquer escrita pela aplicação.
