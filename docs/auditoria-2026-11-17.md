# PROTIND — auditoria geral e preparação da continuidade

Data: 17 de Novembro de 2026. Base: estado actual e documento enviado nesta data.

## Resumo executivo

O PROTIND tem uma interface demonstrativa utilizável, não uma plataforma operacional. A ligação **Lízio's Neon** está associada ao projecto e respondeu HTTP 200; a aplicação não a usa para apresentar ou guardar dados. A base continua sem o esquema funcional `protind`. Nenhuma alteração na base, criação de conta, activação de escrita ou publicação foi executada nesta auditoria.

## 1. O que já existia e foi verificado novamente

| Área | Evidência e limite |
|---|---|
| Seis páginas | Painel, mapa, províncias, ocorrências, projectos e IA abriram com HTTP 200 em 1280×1800 e 390×844; sem erros de execução capturados ou transbordamento horizontal da página. |
| Navegação | Ligação para projectos exercitada nos dois tamanhos; menu móvel aberto e navegação concluída. |
| Pesquisa | Pesquisa por Benguela devolveu uma linha nos dois tamanhos. |
| Formulário de ocorrência | Submetido com descrição de verificação; mostrou explicitamente que nada foi guardado, nos dois tamanhos. Não prova persistência nem validação operacional. |
| Consultas internas | Quatro RPCs com validação e resposta `INTEGRATION_DISABLED`; sem transporte Neon. |
| Escritas e perfis | Bloqueio incondicional preservado; três nomes de perfis inactivos, sem autorização efectiva. |
| SQL proposto | 29 tabelas preparadas em ficheiro, não criadas na base. Validação anterior em PostgreSQL 17 temporário documentada; não repetida nem comprovada em PostgreSQL 18 real hoje. |

## 2. Estado efectivo do Neon

- Ligação associada: **Lízio's Neon**, pelo conector gerido.
- Metadados de hoje: **neondb**, **PostgreSQL 18.7**, conta **neondb_owner**, `BYPASSRLS = true`.
- Nove tabelas visíveis: `neon_auth.account`, `invitation`, `jwks`, `member`, `organization`, `project_config`, `session`, `user`, `verification`.
- Nenhuma tabela funcional `protind` listada; zero relações estrangeiras nesse esquema. Não foram lidas contas, sessões ou respostas pessoais.
- Isto identifica a base acessível, não outros branches nem a configuração de recuperação ou do serviço Neon Auth.
- A conta ligada é privilegiada e não deve ser usada pela aplicação em operações normais. RLS não protege contra uma conta com bypass.

### Recuperação e acesso mínimo — preparação, não execução

1. O responsável confirma no painel Neon o projecto, branch, endpoint, janela de recuperação e retenção. Registar a identificação e a data, sem credenciais.
2. Antes de qualquer alteração, criar ou confirmar um branch de segurança e testar o procedimento de recuperação num ambiente isolado aprovado; uma transacção não substitui backup.
3. Definir responsáveis pela recuperação, perda de dados tolerável e tempo de reposição; esses valores ainda não foram fornecidos.
4. Rever o SQL aditivo, limites de execução, compatibilidade com PostgreSQL 18 e impacto das referências restritivas à identidade; apresentar operações e riscos para nova aprovação.
5. Criar no Neon uma conta dedicada com palavra-passe escolhida no serviço, sem `BYPASSRLS` nem privilégios administrativos; usar uma ligação própria. Separar conta de migração e conta operacional.
6. Após autenticação e matriz de acesso aprovadas, preparar concessões apenas nas tabelas e operações necessárias; não conceder acesso geral a sessões ou credenciais de `neon_auth`.

O conector não permite gerir backups, branches ou configuração Neon Auth. A existência de backups e a capacidade de recuperação permanecem **não comprovadas**.

## 3. Integridade territorial

- Referência fornecida: **21 províncias e 265 municípios**, sujeita à validação com fontes oficiais.
- A demonstração actual contém **18 províncias** e contagens fictícias; a página anuncia **326 municípios**. Não existe cadastro individual de municípios ou comunas. Não se deve afirmar que a estrutura nacional real já foi introduzida ou validada.
- Os exemplos foram preservados: não acrescentados, corrigidos ou importados como dados reais nesta auditoria.
- O SQL preparado admite província → município → comuna, UUID, código único, fonte, vigência, arquivo e referências restritivas. O cadastro real, limites geográficos, duplicações e expansão não podem ser verificados sem dados oficiais.
- A vigência e o arquivo não constituem, por si sós, histórico completo de cada alteração. Antes de actualizar dados reais, definir versões e registo transaccional de alterações; a tabela de auditoria proposta não é preenchida automaticamente pelo código actual.

## 4. Segurança e resultados dos testes

Execução de hoje: `bunx vitest run`.

| Grupo | Passaram |
|---|---:|
| Validação territorial | 32 |
| Consultas e bloqueios | 27 |
| CSRF | 20 |
| Preparação de perfis | 7 |
| Navegação unitária | 1 |
| **Total** | **87** |

Estes testes comprovam os comportamentos desactivados e validação cobertos, não sessões reais, acesso mínimo, transporte publicado, recuperação ou operações autorizadas na base. O registo automático disponível indica **build OK em 17-11-2026 04:56:39 UTC**.

- `.env`, `.env.production`, `.env.local`, `.dev.vars`, `.dev.vars.production` e uma variante `.env.production` em subdirectório foram confirmados como excluídos pelo Git.
- `credentials.json`, `*.pem` e `*.key` ainda não são excluídos pelas regras actuais. Não foram criados ficheiros secretos para testar, nem alterado o `.gitignore` protegido.
- Pesquisa limitada nos ficheiros versionados não encontrou padrões de ligação PostgreSQL, chaves privadas ou os padrões de chave pesquisados; não encontrou nomes de ficheiros de credenciais versionados. Não foram lidos valores de ambiente. Isto não certifica todos os formatos, histórico remoto, artefactos publicados ou GitHub.
- Resultados dos scanners de 16-11: sem achados, mas todos marcados **desactualizados** pelo serviço. Não foi executada nova análise aprofundada. O scanner da base integrada não certifica o Neon externo.

### Problemas e lacunas observados

1. Conta Neon privilegiada, recuperação não comprovada, identidade e permissões operacionais ausentes: bloqueiam integração real e publicação operacional.
2. Cadastro demonstrativo divergente da referência nacional; sem fonte oficial nem municípios individuais.
3. Botões «Novo município» e «Novo projecto» não têm operação implementada.
4. Formulário de ocorrência não exige descrição e não tem validação de negócio ou persistência; demonstração não deve ser considerada registo concluído.
5. Mapa esquemático, não cartografia administrativa validada; selecção por clique presente, mas pontos não têm controlo de teclado acessível.
6. Relatórios, administração, comunas, enquetes, histórico real e análise ambiental por IA ainda não têm fluxos operacionais.
7. A página IA identifica exemplos, mas textos ilustrativos usam linguagem de previsão e confiança fictícia; na futura integração exigir fontes, datas, distinção de observação/estimativa/recomendação e revisão humana.
8. Metadados próprios de título e descrição existem nas seis páginas; `og:type` e `twitter:card` são definidos no documento comum. Não há imagem de capa absoluta significativa a incluir. Nenhuma página foi alterada.

## 5. Preparação das próximas funcionalidades

| Etapa | Operações propostas | Dependências e riscos |
|---|---|---|
| Identidade | Validar configuração pública Neon Auth, origens autorizadas, verificação de sessão no servidor, expiração e saída | Configuração pública suportada e conta inicial indicada pelo responsável; não inventar administrador ou sistema de palavras-passe paralelo. |
| Acessos | Rever matriz administrador/técnico/consulta, separar atribuições de perfis e testar recusas | Matriz aprovada, conta mínima e nova aprovação para concessões e atribuição inicial. |
| Território | Reconciliar fonte oficial com referência 21/265, preparar importação auditável e idempotente | Fonte oficial e autorização de importação; não importar a demonstração. |
| Módulos | Ligar explicitamente consultas e depois operações de ocorrências, projectos, zonas e avaliações | Esquema executado com aprovação, sessões e autorizações verificadas; nenhuma escrita por simples presença de chaves. |
| Administração e relatórios | Operações restritas, histórico transaccional, estatísticas e exportação com acesso controlado | Política de dados públicos/privados, retenção e auditoria aprovadas. |
| IA | Análise de dados autorizados, fontes e versão do modelo, recomendações com revisão humana | Dados reais validados e política de privacidade; sem previsões apresentadas como factos ou decisões administrativas automáticas. |
| Publicação | Segurança actual, testes reais de leitura de retorno, acessos, recuperação e desempenho | Nova aprovação expressa; não publicar enquanto houver lacunas críticas. |

Os contratos desactivados e a estrutura SQL existentes já são a preparação técnica disponível. Nesta auditoria não foi criado código duplicado nem conectados novos serviços.

## 6. O que foi feito nesta execução

- Reconfirmados conector e metadados da base, executados 87 testes, verificadas seis páginas e três interacções nos dois tamanhos.
- Confirmadas exclusões locais e limites da pesquisa de segredos; corrigida no presente relatório a interpretação excessiva de que scanners sem achados certificariam a base Neon.
- Preparados este relatório, sequência de recuperação/acessos e lista de dependências; roteiro actualizado.
- Nenhuma correcção de código funcional, alteração de interface, escrita na base, conta, nova base ou publicação.

## 7. Condições ainda necessárias

São necessários: confirmação de recuperação no Neon; conta de acesso mínimo; configuração pública de Neon Auth e identificação do administrador inicial; fonte territorial oficial; matriz de permissões e privacidade; aprovação específica das próximas alterações. Só depois será possível testar operações reais e preparar publicação. O endereço previsto `angola-verde-viva.lovable.app` não foi validado como aplicação publicada nesta auditoria.

## 8. Conferência das dez etapas e manutenção

Esta auditoria não encerra as dez etapas de implementação do documento enviado. Estado de cada etapa:

| Etapa pedida | Estado |
|---|---|
| 1 — Auditoria geral | Estrutura funcional, seis páginas, interacções seleccionadas, metadados e 87 testes conferidos; não equivale a revisão exaustiva de todas as dependências ou de todo o histórico remoto. |
| 2 — Protecção da base | Identidade e privilégio da ligação confirmados; estratégia preparada; recuperação, conta mínima e concessões ainda dependem do responsável e de aprovação. |
| 3 — Território | Divergência identificada; hierarquia proposta revista; cadastro real 21/265 e comunas não validados nem importados. |
| 4 — Autenticação | Preparação desactivada preservada; serviço, sessões, administrador e permissões reais não implementados nem testados. |
| 5 — Funcionalidades | Pesquisa e submissão demonstrativa verificadas; desflorestação é um tipo ilustrativo de ocorrência, não acompanhamento real; zonas de risco, administração, relatórios e histórico operacional pendentes. |
| 6 — IA | Exemplos preservados e requisitos de fontes/revisão definidos; nenhuma análise ou modelo real integrado ou testado. |
| 7 — Interface | Seis páginas verificadas em computador e telemóvel; pesquisa, formulário e menu exercitados; faltas de validação e acessibilidade documentadas. Não há selector de tema ou segundo tema operacional configurado na aplicação. |
| 8 — Testes | 87 testes passaram e verificações de navegador descritas; autenticação, permissões, consultas reais, operações administrativas e integridade de dados reais continuam não verificáveis no estado actual. |
| 9 — Publicação | Bloqueada pelos requisitos acima e por nova aprovação; desempenho de produção, carga e recuperação não foram medidos. |
| 10 — Relatório | Entregue com evidências, limitações, pendências e condições de continuação, sem declarar concluídas etapas bloqueadas. |

### Plano de manutenção proposto, ainda sem responsável ou calendário aprovado

- Designar responsáveis por acessos, dados territoriais, incidentes e recuperação.
- Rever alterações de dependências e segurança antes de cada publicação; repetir análise após a integração real, não usar resultados desactualizados como certificação.
- Confirmar periodicamente a recuperação e exercitar reposição num ambiente isolado aprovado; frequência depende de acordo com o responsável.
- Monitorizar falhas de início de sessão, operações autorizadas, erros de consultas e qualidade dos dados sem registar tokens, palavras-passe ou respostas privadas integrais.
- Rever fontes territoriais, vigência e qualidade ambiental; manter alterações rastreáveis e separar demonstração de dados oficiais.
- Medir desempenho e carga com dados e ambiente aprovados; definir metas antes de declarar aptidão para produção.

Nenhuma destas propostas autoriza execução na base, novas contas, activação de escritas ou publicação.