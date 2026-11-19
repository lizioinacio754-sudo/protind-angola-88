# PROTIND — preparação da transformação operacional

Documento de referência recebido: 17/11/2026. Esta entrega continua a auditoria existente, sem a repetir e sem alterar a interface ou a base.

## Implementado e testado nesta etapa

- Contratos Zod de criação de ocorrências: descrição obrigatória, oito categorias pedidas, referências UUID de província e município, comuna opcional, data de calendário válida e localização opcional com coordenadas dentro dos limites globais.
- Catálogo dos cinco estados pedidos, incluindo `em_acompanhamento`; não é um fluxo autorizado de mudança de estado.
- Contratos de criação de projectos: nome, descrição, objectivos, área de intervenção, referências territoriais, início e prazo coerentes.
- Entradas estritas: o chamador não pode enviar responsável, estado, papel, alegação de autenticação ou datas de auditoria. A identidade deverá vir da sessão verificada no servidor.
- **26 testes novos passaram; os 87 anteriores também passaram: 113 testes no total, em seis ficheiros.** Isto comprova validação e bloqueios cobertos, não persistência ou autorização real.
- Presença das variáveis do conector verificada sem ler valores. Chaves presentes não activam acessos.

Os contratos não são importados pelas páginas nem por RPCs de escrita. Não há chamadas de rede, gravação ou sucesso operacional simulado. Uma referência UUID válida não comprova existência, relação territorial, origem oficial ou permissão: essas verificações continuam obrigatórias no futuro servidor.

## Ficheiros alterados

- `src/lib/operational-input.contracts.ts`: novo módulo de validação sem transporte.
- `src/test/operational-input.test.ts`: testes das regras acima.
- `AGENTS.md`: fronteira entre validação, autorização e persistência documentada.
- `roadmap.md`: etapa e bloqueios registados.
- `docs/preparacao-operacional.md`: esta entrega e instruções seguintes.

Não foram alterados os seis ficheiros de páginas, navegação, componentes, estilos, exemplos ou testes anteriores. Por não existir alteração visível, não se repetiu a auditoria de navegador já entregue. Formulários reais, uploads, consultas territoriais e gravação com leitura posterior ainda não estão implementados.

## Revisão do SQL existente — divergências a resolver antes da execução

O SQL preparado permanece intocado e não executado.

1. A criação actual recusa um esquema `protind` já existente: é segura contra substituição, mas não é idempotente no sentido de reaplicação bem-sucedida. Preparar uma migração versionada com registo de aplicação e verificação da estrutura, em vez de usar `IF NOT EXISTS` para esconder divergências.
2. O estado de ocorrência actual inclui `em_campo`; o documento pede `em_acompanhamento`. Rever restrição e mapeamento antes da migração, sem renomear dados existentes automaticamente.
3. Projectos têm descrição opcional no SQL e não têm campos próprios de objectivos, área de intervenção e resultados. O contrato novo é preparação funcional; não está ligado a um INSERT incompatível.
4. Unidades territoriais têm código obrigatório e fonte, mas o documento admite código administrativo apenas quando disponível e pede data de referência e estado de validação explícitos. Rever separação entre identificador interno e código oficial opcional.
5. A hierarquia actual é província/município/comuna. Angola poderá ser contexto nacional, sem inventar uma unidade-pai incompatível com o gatilho actual; qualquer novo tipo exige revisão explícita.
6. Tabela de auditoria imutável não equivale a histórico automático. Operações autorizadas terão de acrescentar eventos e dados de alteração adequados na mesma transacção, sem segredos.

Estas são **propostas de revisão**, não alterações SQL executadas ou autorizadas. Antes de executar a migração, apresentar o SQL revisto, riscos e obter aprovação específica.

## Intervenção necessária no painel Neon — aguardar confirmação

### Recuperação

1. Abrir o projecto correcto no painel Neon e confirmar o branch/endpoint da base `neondb` usada pela ligação associada.
2. Consultar as opções de recuperação disponíveis nesse projecto e plano. Registar janela de retenção e datas recuperáveis; não assumir que existem por defeito.
3. Confirmar ou criar um branch de segurança usando as opções disponíveis no painel, verificando custos antes de activar opções pagas.
4. Num ambiente isolado aprovado, exercitar o procedimento de reposição e confirmar por leitura que um registo de teste volta ao estado esperado. Não fazer este teste sobre registos de produção nem exportar sessões ou palavras-passe para chat.
5. Enviar apenas identificação do branch de segurança, data do teste e resultado. **Não enviar ligação PostgreSQL, palavras-passe ou tokens.**

O conector SQL não gere branches, retenção ou recuperação. Enquanto não houver prova do teste, a recuperação continua não validada e a alteração da base fica interrompida.

### Conta operacional mínima

1. Separar a conta usada para migrações da usada pela aplicação.
2. A conta operacional não pode ter `BYPASSRLS` ou privilégios administrativos. Contas criadas no painel Neon podem herdar privilégios elevados; não assumir que uma conta nova é mínima só por ter outro nome.
3. Após revisão da matriz de acesso, preparar SQL específico de conta e concessões para o responsável executar no editor Neon, com palavra-passe escolhida lá. Não conceder acesso global nem acesso normal a sessões/credenciais de `neon_auth`.
4. Associar uma ligação gerida dessa conta quando estiver pronta; a actual `neondb_owner` não será usada nas operações normais.

Não foram criadas contas, concedidos privilégios ou pedidos segredos nesta etapa.

## Próximas etapas e dependências externas

| Etapa | O que falta |
|---|---|
| Identidade | Configuração pública suportada do Neon Auth, origens autorizadas e identificação do administrador inicial; não criar sistema paralelo nem conta arbitrária. Perfis pessoais já constam da proposta e papéis permanecem separados. |
| Acessos | Matriz proposta: administrador supervisiona e gere acessos; técnico regista e actualiza apenas no âmbito autorizado; consultor só lê dados permitidos. O código interno actual `consulta` pode representar o rótulo Consultor, sem criar quarto papel. Validar e aplicar no servidor e base só após identidade e aprovação. |
| Território | Fonte oficial com nomes, relações, referência e validação; prioridade Benguela, referência nacional 21/265. Não inventar municípios, comunas ou limites. |
| Operações | Activar leituras e depois escritas específicas com autorização, transacções, histórico e leitura de retorno; gravação não está concluída enquanto a leitura real não confirmar o resultado. |
| Projectos/mapa/comunas/relatórios | Dependem de esquema revisto, fonte oficial, dados reais autorizados e identidade; os exemplos permanecem demonstrativos. |
| IA | Fontes, datas, versão, distinção observado/estimativa/previsão/recomendação e revisão humana; nenhum serviço pago activado. |
| Publicação | Não automática: recuperação real, acessos, dados, operações e testes verificados, seguidos de aprovação expressa. |

Nenhuma etapa externa está concluída apenas por ter um contrato de entrada ou uma página demonstrativa. A próxima intervenção indispensável é confirmar a recuperação no painel Neon; até lá, leituras reais e escritas permanecem desactivadas.