# PROTIND — preparação do backend

- [x] Propor estrutura funcional para ordenamento industrial sustentável, enquetes e avaliação ambiental, com foco em Benguela; aprovada como base, sujeita a revisão técnica.
- [ ] Preparar SQL completo e explicação por etapas, com integridade, índices e permissões mínimas; não executar no Neon nem alterar a interface.
- [ ] Reconfirmar associação do conector ao projecto e identidade técnica da base; confirmação do ambiente correcto depende do responsável.
- [x] Verificar ligações Neon disponíveis e identificar tabelas existentes por consulta de metadados, sem ligar a aplicação nem alterar dados: duas ligações apontam ao mesmo endpoint/base; nove tabelas em neon_auth, nenhuma tabela funcional visível nesta base.

- [x] Analisar a estrutura actual e as fronteiras de segurança.
- [x] Preparar plano para consultas territoriais, observações, projectos e análises de IA.
- [x] Esclarecer DATABASE_URL: utilizador aceitou o conector seguro.
- [x] Definir validação e bloqueio de escritas enquanto não existir autenticação/autorização.
- [x] Preparar as quatro consultas internas, validação e acesso desactivado ao Neon.
- [x] Retomar a verificação: confirmar o código preparado, executar o teste existente e abrir as seis páginas.
- [x] Adicionar e executar testes das quatro consultas e de segurança: 59 testes específicos e 1 de navegação passaram; sem ligação ao Neon, escritas ou substituição dos dados demonstrativos.
- [x] Verificar a cadeia CSRF real: 20 testes de pedidos GET/POST passaram.
- [ ] Verificar transporte RPC e ficheiros na aplicação publicada — não existe publicação e o utilizador proibiu publicar.
- [ ] Completar exclusões `.env*` e `.dev.vars*` — `.gitignore` protegido contra edição neste ambiente; responsável deve actualizar fora daqui.
- [x] Retomar protecção local: 87 testes passaram; pesquisa limitada sem credenciais reais identificadas no código e em 26 commits locais; exclusões em falta documentadas, sem apagar ficheiros ou alterar visual/dados.
- [ ] Verificar segredos no GitHub — acesso remoto não verificado; pesquisa local não certifica ramos/histórico remotos.
- [ ] Ligar o conector Neon e descobrir a estrutura existente — aguarda autorização separada para ligação e leitura.
- [ ] Implementar e verificar a primeira leitura real — aguarda descoberta da estrutura e definição de acesso público/privado.
- [ ] Definir início de sessão e permissões — adiado pelo utilizador; escritas permanecem bloqueadas.
- [x] Preparar catálogo inactivo de administrador, técnico e utilizador de consulta; 7 testes passaram, sem atribuir permissões.
- [x] Retomar análise: scanner anterior sem achados mas marcado desactualizado; 87 testes passaram e seis páginas demonstrativas verificadas sem alterações de visual/dados.