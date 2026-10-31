# PROTIND — preparação do backend

- [x] Analisar a estrutura actual e as fronteiras de segurança.
- [x] Preparar plano para consultas territoriais, observações, projectos e análises de IA.
- [x] Esclarecer DATABASE_URL: utilizador aceitou o conector seguro.
- [x] Definir validação e bloqueio de escritas enquanto não existir autenticação/autorização.
- [x] Preparar as quatro consultas internas, validação e acesso desactivado ao Neon.
- [x] Retomar a verificação: confirmar o código preparado, executar o teste existente e abrir as seis páginas.
- [x] Adicionar e executar testes das quatro consultas e de segurança: 59 testes específicos e 1 de navegação passaram; sem ligação ao Neon, escritas ou substituição dos dados demonstrativos.
- [ ] Verificar transporte RPC, protecção CSRF e ausência de segredos nos ficheiros publicados — testes unitários não comprovam estas fronteiras.
- [ ] Ligar o conector Neon e descobrir a estrutura existente — aguarda autorização separada para ligação e leitura.
- [ ] Implementar e verificar a primeira leitura real — aguarda descoberta da estrutura e definição de acesso público/privado.
- [ ] Definir início de sessão e permissões — adiado pelo utilizador; escritas permanecem bloqueadas.
- [ ] Fase actual: verificar comunicação, exclusões de credenciais e preparar administrador, técnico e utilizador de consulta sem activar acessos ou alterar o visual.