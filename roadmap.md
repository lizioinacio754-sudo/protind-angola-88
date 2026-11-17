# PROTIND — preparação do backend

## Auditoria e continuidade — 17-11-2026
- [x] Auditar páginas, interacções, testes, ligação Neon, metadados e protecção local; relatório em docs/auditoria-2026-11-17.md: 87 testes passaram, seis páginas e pesquisa/formulário/menu verificados nos dois tamanhos; esquema protind ausente.
- [x] Preparar sequência e riscos das próximas etapas, sem executar alterações na base, activar escritas, criar administradores ou publicar sem nova aprovação.
- [ ] Validar cadastro nacional contra a referência fornecida de 21 províncias e 265 municípios; depende de fonte oficial e dados reais autorizados, sem substituir a demonstração.

## Autorização final — 16-11-2026
- [x] Revalidar neondb e associar a ligação aprovada ao projecto: ligação Lízio's Neon, PostgreSQL 18.7, nove tabelas neon_auth, identidade UUID, protind ainda ausente.
- [ ] Confirmar cópia de segurança ou recuperação no Neon antes de executar a estrutura SQL; depende de acesso às definições de recuperação do Neon.
- [ ] Executar uma única vez a estrutura validada, preservando neon_auth e sem importar demonstrações.
- [ ] Configurar identidade existente e acesso mínimo; depende da configuração Neon Auth e conta dedicada, não acessíveis pelo conector SQL.
- [ ] Integrar módulos reais, participação, administração e relatórios sem misturar dados demonstrativos.
- [ ] Testar ligação, três níveis de acesso, operações, segurança e apresentação em computador/telemóvel.
- [ ] Publicar só após testes operacionais e nova aprovação expressa exigida em 17-11-2026; produzir relatório com endereço e limitações.
- [x] Verificar estado preservado: 87 testes passaram; seis páginas HTTP 200 em computador e telemóvel, sem erros observados ou transbordamento horizontal. Relatório desta execução em docs/final-authorization-status.md.

- [x] Propor estrutura funcional para ordenamento industrial sustentável, enquetes e avaliação ambiental, com foco em Benguela; aprovada como base, sujeita a revisão técnica.
- [x] Preparar e validar o SQL completo com explicação por etapas: 29 tabelas, 168 índices, 18 gatilhos, 14 funções, 115 FKs e 303 CHECKs validados em PostgreSQL 17 local temporário; 11 regras de integridade testadas com casos válidos e inválidos; corrigido CASE sem parênteses em validar_hierarquia; não executado no Neon nem alterada a interface.
- [x] Reconfirmar associação do conector ao projecto e identidade técnica de neondb sob autorização final; recuperação ainda por confirmar.
- [x] Verificar ligações Neon disponíveis e identificar tabelas existentes por consulta de metadados, sem ligar a aplicação nem alterar dados: duas ligações apontam ao mesmo endpoint/base; nove tabelas em neon_auth, nenhuma tabela funcional visível nesta base.

- [x] Analisar a estrutura actual e as fronteiras de segurança.
- [x] Preparar plano para consultas territoriais, observações, projectos e análises de IA.
- [x] Esclarecer DATABASE_URL: utilizador aceitou o conector seguro.
- [x] Definir validação e bloqueio de escritas enquanto não existir autenticação/autorização.
- [x] Preparar as quatro consultas internas, validação e acesso desactivado ao Neon.
- [x] Retomar a verificação: confirmar o código preparado, executar o teste existente e abrir as seis páginas.
- [x] Adicionar e executar testes das quatro consultas e de segurança: 59 testes específicos e 1 de navegação passaram; sem ligação ao Neon, escritas ou substituição dos dados demonstrativos.
- [x] Verificar a cadeia CSRF real: 20 testes de pedidos GET/POST passaram.
- [ ] Verificar transporte RPC e ficheiros na aplicação publicada — depende dos testes operacionais e de nova aprovação para publicar.
- [x] Confirmar exclusões `.env*` e `.dev.vars*` no estado actual; ficheiros de ambiente testados excluídos. Regras adicionais de credenciais ainda dependem de edição autorizada do .gitignore protegido.
- [x] Retomar protecção local: 87 testes passaram; pesquisa limitada sem credenciais reais identificadas no código e em 26 commits locais; exclusões em falta documentadas, sem apagar ficheiros ou alterar visual/dados.
- [ ] Verificar segredos no GitHub — acesso remoto não verificado; pesquisa local não certifica ramos/histórico remotos.
- [x] Ligar o conector Neon e revalidar metadados com autorização final; nenhuma tabela protind existente.
- [ ] Implementar e verificar a primeira leitura real — aguarda descoberta da estrutura e definição de acesso público/privado.
- [ ] Definir início de sessão e permissões — autorizado; aguarda configuração Neon Auth, conta mínima e administrador inicial; escritas permanecem bloqueadas.
- [x] Preparar catálogo inactivo de administrador, técnico e utilizador de consulta; 7 testes passaram, sem atribuir permissões.
- [x] Retomar análise: scanner anterior sem achados mas marcado desactualizado; 87 testes passaram e seis páginas demonstrativas verificadas sem alterações de visual/dados.