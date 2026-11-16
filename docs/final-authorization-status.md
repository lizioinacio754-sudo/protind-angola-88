# PROTIND — relatório da autorização final

Data: 16 de Novembro de 2026.

## Executado e confirmado

- Autorização recebida para execução da estrutura validada em neondb, integração, autenticação, módulos e publicação condicionada aos testes.
- Ligação **Lízio's Neon** associada ao projecto pelo conector gerido. Credencial guardada pelo serviço, sem inclusão no código. A associação não activa as consultas territoriais.
- Consulta exclusivamente de metadados respondeu HTTP 200: base **neondb**, PostgreSQL **18.7**, conta **neondb_owner** com **BYPASSRLS**, nove tabelas em **neon_auth**, identidade UUID e esquema **protind ainda ausente**.
- A estrutura anterior foi validada em PostgreSQL 17 local; a compatibilidade da execução completa no PostgreSQL 18 real não foi testada nesta execução.
- **87 testes passaram**: 32 validação, 27 consultas/segurança, 20 CSRF, sete preparação de acessos e um navegação. Confirmam consultas desactivadas e escritas bloqueadas; não provam sessões reais nem autorização operacional.
- As seis páginas abriram com HTTP 200 em 1280×1800 e 390×844, sem erros de execução observados nem transbordamento horizontal. Imagens da página IA foram inspeccionadas nos dois tamanhos. Design e dados demonstrativos preservados.
- Verificação automática registou **build OK**.
- `.env`, `.env.production`, `.env.local`, `.dev.vars` e `.dev.vars.production` estão excluídos. Não foram encontrados nomes de ficheiros de ambiente/chaves/credenciais versionados na pesquisa limitada. Valores secretos não foram lidos.
- Tentativa de adicionar exclusões de certificados e ficheiros comuns de credenciais ao `.gitignore` recusada pela protecção da plataforma; não foi contornada.
- Análise básica não reportou problemas, mas verificações do serviço de base integrado não se aplicam ao Neon. Análise de dependências actual sem achados; análises aprofundadas anteriores desactualizadas. Isto não constitui certificação de segurança do Neon ou do histórico GitHub.

## Operações interrompidas por requisitos externos

### 1. Recuperação antes da alteração

Não foi possível comprovar a janela de recuperação ou uma cópia de segurança do Neon. O conector SQL não permite gerir branches, backups ou configurações do projecto Neon. Uma transacção atómica evita aplicação parcial, mas não substitui recuperação depois do commit.

**Acção necessária:** no painel Neon, confirmar recuperação disponível para esta base/branch ou criar um branch de segurança antes de executar o SQL. Fornecer confirmação da existência e identificação da recuperação, sem credenciais. Nenhum dado de contas ou sessões foi exportado para produzir uma cópia insegura.

### 2. Conta operacional de acesso mínimo

A ligação disponível usa `neondb_owner`, com bypass de RLS. Não serve como conta normal da aplicação. O esquema proposto não concede acesso operacional e não contém políticas permissivas.

**Acção necessária:** configurar no Neon uma conta dedicada com credencial escolhida no próprio serviço, nunca em chat, e associar a ligação dessa conta. Preparar concessões específicas após definição da matriz de acessos; não dar privilégios administrativos globais ao runtime.

### 3. Identidade e administrador inicial

As tabelas neon_auth existem, mas o conector não disponibiliza configuração Neon Auth nem prova de que o serviço de início de sessão esteja activo. Não criar um sistema paralelo de palavras-passe nem escolher um administrador arbitrariamente.

**Acção necessária:** disponibilizar a configuração pública suportada do Neon Auth (endereço do serviço e origens autorizadas, sem segredos) e indicar a conta que deve receber a primeira atribuição de administrador por procedimento controlado. Perfis pessoais já fazem parte da estrutura aprovada; papéis permanecem separados.

## Não executado

- SQL de criação no Neon, concessões, alterações a neon_auth ou a dados existentes.
- Autenticação, atribuições activas ou operações reais pela interface.
- Importação dos exemplos como dados reais, reconstrução de páginas ou substituição de conteúdos.
- Publicação: a autorização condiciona-a aos testes operacionais, ainda impossíveis pelos requisitos acima.

## Próxima sequência

Confirmar recuperação → executar estrutura aditiva uma vez → configurar identidade e conta mínima → implementar acessos e módulos → testar recusas e operações autorizadas com leitura de retorno real → análise de segurança actual → publicação pública.

Não há endereço público publicado nesta execução. **angola-verde-viva.lovable.app** é apenas o endereço previsto, não prova de publicação ou disponibilidade.