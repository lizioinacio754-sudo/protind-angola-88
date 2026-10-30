# PROTIND — preparação segura do backend Neon

## Estrutura actual

- A aplicação utiliza React e TanStack Start, com seis páginas: painel, mapa, províncias, ocorrências, projectos e análises de IA.
- O menu e cabeçalho são partilhados. O visual existente será preservado.
- As páginas usam dados fictícios de `src/lib/demo-data.ts`; o painel também contém indicadores e séries demonstrativas definidos na própria página.
- Já existe infraestrutura de servidor e protecção contra pedidos de escrita vindos de outros sites, mas não há API de dados, autenticação ou autorização implementadas. Essa protecção não substitui o início de sessão.
- A análise foi apenas ao código: não foram consultadas tabelas, credenciais ou dados do Neon.

## Decisões confirmadas

- Usar o conector seguro do Neon, aceite em substituição de `DATABASE_URL`. A ligação PostgreSQL ficará guardada no conector, não no frontend nem no código da aplicação.
- Não criar outra base, alterar o esquema, apagar, substituir ou modificar registos existentes.
- Definir o início de sessão mais tarde. Até existir autenticação e autorização efectivas, todas as operações de escrita ficam bloqueadas, mesmo com o conector configurado.
- Esta fase apresenta o plano; não liga nem consulta o Neon.

## Implementação proposta após aprovação

### 1. Preparar a API sem activar a ligação

- Criar contratos para consultar unidades territoriais, observações ambientais, projectos ambientais e análises de IA.
- Separar a API interna, a validação e o acesso exclusivamente no servidor, sem modificar o design ou substituir os dados demonstrativos nesta etapa.
- Não aceitar SQL, nomes arbitrários de tabelas ou credenciais enviados pelo navegador.
- Enquanto a ligação não estiver autorizada e configurada, devolver um estado explícito de integração indisponível, sem efectuar pedidos ao Neon. A presença de chaves não activa o acesso automaticamente.
- Não criar métodos de escrita operacionais nem expor dados reais através de um serviço público antes de definir quem pode consultá-los.

### 2. Ligar o Neon numa etapa expressamente autorizada

- Abrir o cartão de ligação para guardar a ligação existente de forma segura; não enviar palavras-passe pela conversa.
- Confirmar a base e o ambiente correctos, sem criar novas bases ou branches.
- Recomendar uma conta dedicada com acesso apenas de leitura às tabelas necessárias; se for necessário criar essa conta ou mudar permissões, pedir aprovação separada e deixar a configuração ao responsável no Neon.
- Consultar apenas a estrutura existente e uma pequena amostra autorizada, para identificar os nomes reais das tabelas, colunas e relações. Os quatro grupos da API são nomes funcionais, não suposições sobre tabelas existentes.
- Não executar migrações, inserções demonstrativas ou outras alterações.

### 3. Implementar consultas controladas

- Mapear cada grupo da API às tabelas efectivamente encontradas, devolvendo apenas os campos necessários.
- Validar filtros, identificadores, ordenação e paginação no servidor.
- Usar consultas parametrizadas, limites de resultados e listas fechadas para nomes de colunas e ordenação.
- Usar transacções marcadas como apenas leitura e tratamento de erros sem divulgar credenciais ou detalhes privados ao navegador.
- Começar por uma consulta autorizada; integrar as restantes páginas gradualmente sem mudar o visual. Distinguir dados reais de demonstrativos, sem misturá-los silenciosamente.

### 4. Definir segurança de acesso antes de escritas

- Escolher posteriormente o serviço de início de sessão e as permissões de cada utilizador, sem criar uma base adicional nesta preparação.
- Verificar a identidade e a permissão no próprio servidor, em cada operação: esconder um botão não constitui autorização.
- Dados privados também exigem autorização para leitura; apenas dados explicitamente classificados como públicos podem ser consultados sem sessão.
- Qualquer futura escrita necessita de plano e aprovação próprios; o início de sessão, por si só, não autoriza modificar os dados existentes.

### 5. Verificação

- Adicionar testes de validação, ligação desactivada sem chamadas de rede e recusa de operações de escrita.
- Após definir o acesso, testar rejeição de utilizadores sem sessão ou sem permissão, incluindo chamadas directas à API.
- Verificar que os ficheiros enviados ao navegador não contêm valores secretos nem código de acesso ao Neon.
- Testar uma leitura real autorizada, confirmar os resultados no ecrã e verificar que a aplicação continua visualmente igual.
- Não afirmar que a integração está concluída enquanto faltar a ligação, o mapeamento da estrutura real ou a verificação de acesso.

## Detalhes técnicos

```text
Navegador → API interna do PROTIND → conector seguro → Neon PostgreSQL existente
             validação e acesso      ligação guardada
             apenas no servidor      fora da aplicação
```

- `createServerFn` em módulos `*.functions.ts` para a API interna; auxiliares de acesso em `*.server.ts`. Não criar uma API pública de SQL.
- `LOVABLE_API_KEY` e `NEON_API_KEY` são variáveis exclusivamente do servidor, lidas no momento do pedido, nunca com prefixo `VITE_`. `NEON_API_KEY` é a chave de ligação do conector, não a palavra-passe do PostgreSQL.
- O servidor envia HTTP `POST` para `/neon/sql`, com SQL parametrizado (`$1`, `$2`, `params`); o conector acrescenta a ligação guardada. Cada pedido executa uma instrução ou um lote `queries` numa transacção.
- Não utilizar ligação directa, `@neondatabase/serverless` ou `DATABASE_URL` nesta abordagem aprovada.
- Preservar a protecção CSRF existente. A autenticação/autorização será uma barreira adicional, não uma substituição.
- Excluir ficheiros locais de segredos do controlo de versões, sem criar um `.env` com credenciais. Documentar apenas nomes e instruções de configuração.

## Próximos passos necessários

1. Aprovar este plano para preparar a camada desactivada e os testes.
2. Autorizar separadamente a ligação e as consultas de leitura à estrutura do Neon.
3. Confirmar os dados que podem ser públicos e os que exigem início de sessão.
4. Definir o início de sessão e as permissões antes de acesso privado ou qualquer escrita.
5. Testar a primeira consulta real e só depois autorizar a sua apresentação na interface.