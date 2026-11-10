# PROTIND — estrutura funcional proposta para o Neon

## 1. Estado verificado em 10 de Novembro de 2026

- O projecto mantém as seis páginas existentes, menu partilhado e dados demonstrativos. As quatro consultas internas continuam desactivadas; escritas continuam bloqueadas. Não há início de sessão integrado na aplicação.
- Existem duas ligações acessíveis: **Lízio's Neon** e **Lízio's Neon (1)**. Ambas indicam o mesmo endpoint e a base **neondb**, com a conta **neondb_owner**; nenhuma está ligada ao projecto.
- A consulta de metadados pela ligação Lízio's Neon respondeu HTTP 200. Não foi ligada a aplicação, lido qualquer registo pessoal, alterada a base ou criada outra base.
- Foram encontradas nove tabelas em `neon_auth`: `account`, `invitation`, `jwks`, `member`, `organization`, `project_config`, `session`, `user`, `verification`.
- Não foram encontradas tabelas funcionais em `public` ou outros esquemas visíveis nesta base. Isto não verifica outros branches ou bases e não confirma que este seja o ambiente pretendido para produção.
- `neon_auth.user` já possui `id` UUID, chave primária, `name`, `email` único, `emailVerified`, `image`, `createdAt`, `updatedAt` e campos de gestão do serviço. Não duplicar contas nem alterar estas tabelas geridas.
- A existência destas tabelas não comprova que o início de sessão esteja configurado ou seguro na aplicação. O conector não permite gerir Neon Auth; o caminho de integração terá de ser validado separadamente.

## 2. Resultado proposto

Preparar, nesta mesma base, um esquema funcional `protind`, separado de `neon_auth`, para ordenamento industrial sustentável e protecção ambiental, com foco em Benguela e expansão a outras regiões de Angola.

Os nomes abaixo são **propostas**, não tabelas já criadas. A aprovação deste plano autoriza a preparação de um projecto de migração para revisão, **não a execução no Neon**, a ligação da interface, publicação ou activação de escritas. A execução terá confirmação própria depois da revisão do SQL e do ambiente.

## 3. Tabelas, campos e relações

### Convenções técnicas

- Salvo indicação contrária: `id uuid` como chave primária; `criado_em` e `actualizado_em timestamptz`.
- Referências são UUID; `?` indica campo opcional. Campos obrigatórios, valores de estado e limites serão explicitados na migração revista.
- Dados editáveis terão `criado_por?` e `actualizado_por?` ligados a `neon_auth.user.id`. Estes campos são preenchidos pelo servidor, nunca usados como prova de autorização.
- `numeric` para medições, áreas e orçamento; `text` para códigos e descrições; `date` para datas civis. Estados serão controlados, não texto arbitrário.
- Nenhuma eliminação automática em cadeia nos registos funcionais. Relações restritivas e arquivo lógico preservam dados e histórico.

### A. Utilizadores e perfis

| Tabela | Campos específicos | Relações |
|---|---|---|
| `neon_auth.user` — existente, preservada | Campos identificados acima; credenciais e sessões permanecem geridas pelo serviço | Origem de identidade; não criar tabela de palavras-passe |
| `perfis_utilizador` | `utilizador_id` PK/FK, `nome_exibicao`, `instituicao?`, `cargo?`, `telefone?`, `municipio_id?`, `preferencias jsonb`, datas | Um perfil por utilizador; telefone opcional e privado |
| `papeis_acesso` | `id`, `codigo` único, `nome`, `descricao`, `activo` | Catálogo: administrador, técnico e consulta; nomes não conferem autoridade |
| `atribuicoes_acesso` | `utilizador_id`, `papel_id`, `unidade_territorial_id?`, `atribuido_por`, `atribuido_em`, `revogado_em?` | Utilizadores N:N papéis; âmbito territorial opcional; impedir duplicação de atribuições activas |

As permissões PROTIND ficam separadas dos perfis e do campo `role` já existente no serviço de identidade. O servidor valida sessão e atribuições em cada operação. Nenhum utilizador recebe automaticamente o papel administrador.

### B. Território, zonas e instalações

| Tabela | Campos específicos | Relações |
|---|---|---|
| `unidades_territoriais` | `codigo` único, `nome`, `tipo` (província/município/comuna), `unidade_pai_id?`, `fonte`, `vigente_desde?`, `vigente_ate?`, `limite_geojson?`, `arquivado_em?` | Hierarquia territorial; validar pai/tipo e impedir ciclos |
| `zonas_territoriais` | `codigo` único, `nome`, `unidade_territorial_id`, `descricao?`, `area_ha?`, `limite_geojson?`, `latitude?`, `longitude?`, `fonte`, `estado`, `arquivado_em?` | Unidade 1:N zonas; localização distingue centro representativo de limite real |
| `classificacoes_zona` | `zona_id`, `tipo` (industrial/residencial/ambientalmente sensível), `fundamento?`, `fonte`, `validado_por?`, `validado_em?` | Zona 1:N classificações; permite sobreposição, sem forçar usos incompatíveis a uma única categoria |
| `detalhes_zona_industrial` | `zona_id` PK/FK, `situacao_ordenamento`, `infraestruturas?`, `documento_referencia?`, datas | Extensão 1:1 de zona classificada industrial |
| `detalhes_zona_residencial` | `zona_id` PK/FK, `populacao_estimada?`, `data_estimativa?`, `fonte_estimativa?`, datas | Extensão 1:1 de zona residencial; não guardar moradas individuais |
| `detalhes_area_sensivel` | `zona_id` PK/FK, `categoria_sensibilidade`, `nivel_sensibilidade`, `fundamento_proteccao?`, `restricoes?`, datas | Extensão 1:1; enquadra costa, cursos de água, zonas húmidas ou outros valores documentados |
| `instalacoes_industriais` | `codigo` único, `nome`, `entidade_operadora?`, `nif?`, `unidade_territorial_id`, `zona_industrial_id?`, `endereco?`, `latitude?`, `longitude?`, `estado_operacao`, `licenca_referencia?`, `inicio_actividade?`, `arquivado_em?` | Uma unidade e eventual zona industrial; permitir instalações fora de zona formalmente identificada |
| `actividades_industriais` | `codigo` único, `nome`, `sector`, `descricao?`, `fonte_classificacao?` | Catálogo de actividades sem presumir uma classificação legal específica |
| `instalacao_actividades` | `instalacao_id`, `actividade_id`, `principal boolean`, `inicio?`, `fim?`, `capacidade?`, `unidade_capacidade?` | Instalações N:N actividades; coerência de datas e uma actividade principal vigente |

Validar classificações exigidas pelas extensões e pela ligação da instalação a zona industrial. Relações espaciais, como proximidade a residências ou áreas sensíveis, não equivalem a uma licença nem a um limite legal.

### C. Enquetes públicas

| Tabela | Campos específicos | Relações |
|---|---|---|
| `enquetes` | `titulo`, `descricao?`, `versao`, `estado`, `inicio_em`, `fim_em?`, `unidade_territorial_id?`, `aviso_privacidade_versao` | Unidade 1:N enquetes; versão publicada fica imutável após respostas |
| `perguntas_enquete` | `enquete_id`, `codigo`, `texto`, `tipo`, `obrigatoria`, `ordem`, `regras_validacao jsonb?` | Enquete 1:N perguntas; tipos: texto, número, escolha única/múltipla |
| `opcoes_pergunta` | `pergunta_id`, `codigo`, `texto`, `ordem` | Pergunta 1:N opções |
| `submissoes_enquete` | `enquete_id`, `utilizador_id?`, `municipio_id?`, `estado`, `submetido_em?`, `aviso_privacidade_versao`, `concordancia_em?` | Utilizador opcional; proposta admite participação anónima, sujeita à confirmação da política de participação |
| `respostas_enquete` | `submissao_id`, `pergunta_id`, `valor_texto?`, `valor_numero?` | Uma resposta por pergunta/submissão; pergunta deve pertencer à mesma enquete |
| `resposta_opcoes` | `resposta_id`, `opcao_id` | Respostas N:N opções; opções da mesma pergunta, sem duplicação; escolha única limitada a uma opção |

Não recolher IP, identificação civil, telefone ou localização exacta por omissão. Não expor respostas individuais publicamente. Política de anonimato, consentimento, retenção e prevenção de abuso precisa de validação antes de abrir a recolha.

### D. Impactos, avaliações e indicadores

| Tabela | Campos específicos | Relações |
|---|---|---|
| `observacoes_ambientais` | `codigo` único, `unidade_territorial_id`, `zona_id?`, `instalacao_id?`, `tipo`, `descricao`, `observado_em`, `latitude?`, `longitude?`, `gravidade`, `estado`, `fonte`, `validado_por?`, `validado_em?` | Preserva o recurso de ocorrências já previsto; distingue relato de constatação validada |
| `impactos_ambientais` | `observacao_id?`, `instalacao_id?`, `zona_id?`, `categoria`, `descricao`, `severidade`, `duracao?`, `extensao?`, `evidencia_referencia?`, `estado_validacao` | Pelo menos uma referência de contexto; relações devem ser territorialmente coerentes |
| `avaliacoes_ambientais` | `titulo`, `unidade_territorial_id`, `zona_id?`, `instalacao_id?`, `periodo_inicio`, `periodo_fim`, `metodologia`, `responsavel_id`, `estado`, `conclusao?`, `aprovado_por?`, `aprovado_em?` | Unidade/zona/instalação 1:N avaliações; responsáveis autenticados |
| `indicadores_ambientais` | `codigo` único, `nome`, `dimensao`, `unidade_medida`, `metodo_medicao`, `descricao?` | Catálogo para ar, água, solo, ruído, resíduos ou cobertura vegetal |
| `criterios_indicador` | `indicador_id`, `versao`, `contexto`, `limite_inferior?`, `limite_superior?`, `fonte_normativa`, `vigente_desde`, `vigente_ate?` | Indicador 1:N critérios versionados; nenhum limite legal inventado |
| `medicoes_ambientais` | `avaliacao_id`, `indicador_id`, `criterio_id?`, `valor numeric`, `medido_em`, `ponto_referencia?`, `latitude?`, `longitude?`, `metodo`, `fonte`, `qualidade_dado`, `observacao?` | Avaliação 1:N medições; unidade deriva do indicador; critério usado deve ser compatível |

Não definir um índice único de qualidade, pesos ou fórmulas nesta fase. Exigem metodologia e aprovação, com registo das fontes e períodos.

### E. Administração, relatórios e continuidade das páginas

| Tabela | Campos específicos | Relações |
|---|---|---|
| `projectos_ambientais` | `codigo` único, `nome`, `descricao?`, `unidade_territorial_id`, `zona_id?`, `responsavel_id?`, `inicio?`, `fim_previsto?`, `orcamento_kz?`, `progresso_percentual`, `estado` | Conserva o recurso de projectos existente; progresso 0–100, orçamento não negativo |
| `analises_ia` | `titulo`, `unidade_territorial_id?`, `avaliacao_id?`, `projecto_id?`, `modelo`, `versao_modelo`, `fontes_referencia jsonb`, `resultado`, `recomendacao?`, `confianca_percentual?`, `estado_revisao`, `revisto_por?`, `revisto_em?` | Conserva o recurso de IA; recomendações não são decisões administrativas nem medições reais |
| `relatorios` | `titulo`, `tipo`, `unidade_territorial_id?`, `periodo_inicio?`, `periodo_fim?`, `filtros jsonb`, `versao`, `estado`, `gerado_por`, `gerado_em`, `aprovado_por?`, `aprovado_em?`, `ficheiro_referencia?`, `resumo_snapshot jsonb?` | Relatórios versionados; referências privadas a ficheiros, sem ligações públicas automáticas |
| `relatorio_avaliacoes` | `relatorio_id`, `avaliacao_id` | Relatórios N:N avaliações; sem duplicados |
| `auditoria_eventos` | `id`, `actor_id?`, `accao`, `recurso`, `registo_id`, `ocorrido_em`, `campos_alterados jsonb?`, `motivo?`, `pedido_id?` | Histórico apenas acrescentado pelo servidor; não guardar palavras-passe, tokens ou cópias integrais de respostas privadas |

## 4. Relações principais

```text
neon_auth.user ── 1:1 perfis_utilizador
              └─ 1:N atribuicoes_acesso N:1 papeis_acesso
unidades_territoriais ── hierarquia pai/filho
                     ├─ 1:N zonas_territoriais ── 1:N classificacoes_zona
                     └─ 1:N instalacoes_industriais ── N:N actividades_industriais
enquetes ── 1:N perguntas ── 1:N opcoes
        └─ 1:N submissoes ── 1:N respostas ── N:N opcoes
territorio / zonas / instalacoes ── observacoes / impactos / avaliacoes
avaliacoes ── 1:N medicoes N:1 indicadores ── 1:N criterios
relatorios ── N:N avaliacoes
projectos / avaliacoes ── analises_ia
operacoes autorizadas ── auditoria_eventos
```

## 5. Benguela e preservação

- Usar dados territoriais oficiais actualizados antes de importar províncias, municípios e limites. Os 18 nomes e coordenadas da demonstração não são fonte administrativa actual.
- Modelar proximidade entre indústria, habitação e áreas sensíveis, incluindo litoral e recursos hídricos, apenas com fontes verificadas. Não inventar instalações, classificações, populações ou restrições legais locais.
- Manter integralmente páginas, identidade, textos e dados demonstrativos. Não importar esses exemplos para o Neon nem misturar fontes silenciosamente.

## 6. Etapas posteriores, sujeitas a confirmação

1. Confirmar que `neondb` no endpoint identificado é a base/ambiente correctos e aprovar ou ajustar esta estrutura.
2. Preparar SQL de criação aditiva no esquema `protind`, com relações, validações, índices e permissões mínimas, para revisão; sem `DROP`, `TRUNCATE`, alterações a tabelas geridas ou substituição de dados.
3. Definir integração de identidade suportada e matriz de acessos; confirmar participação anónima nas enquetes e política de privacidade. Não criar outra base ou sistema duplicado de contas.
4. Confirmar separadamente a execução do SQL e a conta dedicada de acesso mínimo; a conta actual é proprietária e não deve ser usada como credencial normal da aplicação.
5. Verificar sessão e autorização no servidor antes de escritas; validar relações entre enquetes, território e medições. Só depois propor activação específica. Manter bloqueio actual até aí.
6. Testar migração num ambiente aprovado, integridade, recusas de acesso e leitura real. A interface só passará a dados reais por autorização própria, sem mudar o visual.

**Não executado:** criação de tabelas, migração, leitura de contas/respostas, configuração de autenticação, ligação do projecto, alterações visuais, publicação ou qualquer escrita no Neon.