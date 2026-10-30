# PROTIND — integração futura com Neon

## Preparado nesta fase

O visual e os dados demonstrativos continuam inalterados. Existem quatro funções de consulta internas em `src/lib/territory.functions.ts`:

| Função | Recurso funcional |
| --- | --- |
| `queryTerritorialUnits` | Unidades territoriais |
| `queryEnvironmentalObservations` | Observações ambientais |
| `queryEnvironmentalProjects` | Projectos ambientais |
| `queryAiAnalyses` | Análises de IA |

São chamadas pelo mecanismo RPC do TanStack Start, não por um URL HTTP manual. Cada chamada recebe `{ data: { ...filtros } }`. Usar `useServerFn` nas futuras acções da interface.

Entradas: `id`, `search`, `cursor` e `limit`. Strings têm limites; `limit` é um inteiro de 1 a 100, com valor por omissão 25. Campos desconhecidos são rejeitados. Os contratos não pressupõem tabelas ou relações reais.

Todas as consultas devolvem `ok: false`, `code: INTEGRATION_DISABLED`, `data: []` e `nextCursor: null`. Não há SQL, pedidos de rede, leitura de segredos ou acesso ao Neon. Nenhuma função de escrita está exposta; o controlo de escrita bloqueia incondicionalmente qualquer tentativa. Não há autenticação implementada nesta fase.

## Credenciais e ligação futura

Foi aceite o conector seguro em vez de `DATABASE_URL`. Não definir essa variável nem instalar um cliente PostgreSQL directo.

Após autorização separada, o cartão do conector Neon guarda a ligação PostgreSQL fora do código. `LOVABLE_API_KEY` e `NEON_API_KEY` ficam disponíveis exclusivamente no servidor; a segunda é a chave do conector, não uma chave de gestão do Neon. Nunca usar prefixo `VITE_` nem ler valores à importação: ler apenas na fronteira de execução no servidor.

O servidor enviará `POST` para `https://connector-gateway.lovable.dev/neon/sql`, com `Authorization: Bearer ${LOVABLE_API_KEY}` e `X-Connection-Api-Key: ${NEON_API_KEY}`. O conector acrescenta a ligação guardada. Valores SQL usam `$1`, `$2` e `params`; um pedido executa uma instrução ou um lote `queries` numa transacção. Não aceitar SQL ou nomes arbitrários enviados pelo navegador.

Não foi criado um `.env` com credenciais. Os segredos futuros são guardados pelo conector, não num ficheiro do projecto. `.gitignore` é protegido neste ambiente: não foi possível acrescentar regras para `.env*` e `.dev.vars*`. Antes de usar desenvolvimento local, o responsável deve acrescentar essas exclusões no repositório, sem colocar segredos em ficheiros versionados. A regra existente `.dev.vars` foi preservada. Ignorar ficheiros não torna seguros segredos enviados ao frontend. Publicar será necessário para disponibilizar a configuração futura na aplicação publicada.

## Passos necessários

1. Autorizar separadamente a ligação e consultas de leitura; confirmar a base e o ambiente existentes correctos.
2. Preferir uma conta dedicada de leitura. Qualquer criação de conta ou mudança de permissões necessita de aprovação separada e configuração pelo responsável no Neon.
3. Descobrir os nomes reais das tabelas, colunas, relações e tipos com uma pequena amostra autorizada. Não executar migrações nem importar os dados demonstrativos.
4. Classificar dados públicos/privados e definir início de sessão e permissões. Verificar identidade e autorização no servidor antes de leituras privadas; não confiar em papéis enviados pelo navegador.
5. Implementar consultas parametrizadas, ordenação por lista fechada, paginação, transacções apenas de leitura e tratamento de erros sem divulgar informações privadas ou credenciais.
6. Testar uma leitura real autorizada no ecrã sem alterar o visual. Verificar que os ficheiros enviados ao navegador não contêm segredos nem código de acesso ao Neon.
7. Só com autorização própria, autenticação e permissões verificadas considerar escritas; nenhuma escrita está autorizada nesta preparação.

A protecção CSRF existente é preservada, mas não substitui autenticação/autorização. Não adicionar endpoints públicos de SQL nem inicialização automática da base.