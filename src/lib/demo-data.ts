// DADOS DEMONSTRATIVOS — valores fictícios, sem ligação a base de dados.
export const provincias = [
  { nome: "Luanda", capital: "Luanda", municipios: 16, area: 18826, cobertura: 12, x: 120, y: 175 },
  { nome: "Bengo", capital: "Caxito", municipios: 6, area: 31371, cobertura: 41, x: 140, y: 150 },
  { nome: "Cabinda", capital: "Cabinda", municipios: 4, area: 7270, cobertura: 78, x: 95, y: 40 },
  { nome: "Zaire", capital: "Mbanza Kongo", municipios: 6, area: 40130, cobertura: 52, x: 135, y: 95 },
  { nome: "Uíge", capital: "Uíge", municipios: 16, area: 58698, cobertura: 63, x: 190, y: 110 },
  { nome: "Cuanza Norte", capital: "Ndalatando", municipios: 10, area: 24110, cobertura: 58, x: 185, y: 170 },
  { nome: "Malanje", capital: "Malanje", municipios: 14, area: 97602, cobertura: 47, x: 250, y: 170 },
  { nome: "Lunda Norte", capital: "Dundo", municipios: 10, area: 103760, cobertura: 55, x: 330, y: 140 },
  { nome: "Lunda Sul", capital: "Saurimo", municipios: 4, area: 77637, cobertura: 49, x: 350, y: 215 },
  { nome: "Cuanza Sul", capital: "Sumbe", municipios: 12, area: 55660, cobertura: 44, x: 155, y: 225 },
  { nome: "Huambo", capital: "Huambo", municipios: 11, area: 34270, cobertura: 33, x: 200, y: 275 },
  { nome: "Bié", capital: "Cuíto", municipios: 9, area: 70314, cobertura: 51, x: 265, y: 270 },
  { nome: "Moxico", capital: "Luena", municipios: 9, area: 223023, cobertura: 69, x: 360, y: 300 },
  { nome: "Benguela", capital: "Benguela", municipios: 10, area: 31788, cobertura: 29, x: 130, y: 285 },
  { nome: "Huíla", capital: "Lubango", municipios: 14, area: 79023, cobertura: 38, x: 170, y: 350 },
  { nome: "Namibe", capital: "Moçâmedes", municipios: 5, area: 57091, cobertura: 9, x: 105, y: 375 },
  { nome: "Cunene", capital: "Ondjiva", municipios: 6, area: 87342, cobertura: 22, x: 185, y: 425 },
  { nome: "Cuando Cubango", capital: "Menongue", municipios: 9, area: 199049, cobertura: 61, x: 290, y: 395 },
];

export const ocorrencias = [
  { id: "OC-0142", tipo: "Desflorestação", provincia: "Moxico", data: "2026-10-27", gravidade: "Alta", estado: "Em análise" },
  { id: "OC-0141", tipo: "Queimada", provincia: "Huambo", data: "2026-10-26", gravidade: "Média", estado: "Em campo" },
  { id: "OC-0140", tipo: "Poluição hídrica", provincia: "Luanda", data: "2026-10-25", gravidade: "Alta", estado: "Resolvida" },
  { id: "OC-0139", tipo: "Erosão costeira", provincia: "Benguela", data: "2026-10-24", gravidade: "Média", estado: "Em análise" },
  { id: "OC-0138", tipo: "Caça furtiva", provincia: "Cuando Cubango", data: "2026-10-22", gravidade: "Alta", estado: "Em campo" },
  { id: "OC-0137", tipo: "Mineração ilegal", provincia: "Lunda Norte", data: "2026-10-21", gravidade: "Alta", estado: "Registada" },
  { id: "OC-0136", tipo: "Ravinas", provincia: "Uíge", data: "2026-10-19", gravidade: "Baixa", estado: "Resolvida" },
];

export const projetos = [
  { nome: "Reflorestação do Planalto Central", provincia: "Huambo", progresso: 64, orcamento: "820 M Kz", estado: "Em curso" },
  { nome: "Proteção do Mangal do Mussulo", provincia: "Luanda", progresso: 38, orcamento: "310 M Kz", estado: "Em curso" },
  { nome: "Corredor da Fauna do Okavango", provincia: "Cuando Cubango", progresso: 82, orcamento: "1,4 B Kz", estado: "Em curso" },
  { nome: "Recuperação de Ravinas", provincia: "Uíge", progresso: 15, orcamento: "190 M Kz", estado: "Planeado" },
  { nome: "Dunas do Deserto do Namibe", provincia: "Namibe", progresso: 100, orcamento: "240 M Kz", estado: "Concluído" },
];

export const recomendacoes = [
  { titulo: "Risco elevado de queimadas no Bié e Huambo", texto: "Modelo prevê aumento de 23% de focos de incêndio nas próximas 3 semanas. Recomenda-se reforço de brigadas e campanhas comunitárias.", confianca: 87, prioridade: "Alta" },
  { titulo: "Perda de cobertura florestal no Moxico", texto: "Imagens de satélite indicam perda de ~1.200 ha no último trimestre ao longo do rio Zambeze. Sugere-se fiscalização prioritária.", confianca: 79, prioridade: "Alta" },
  { titulo: "Expansão urbana em zonas húmidas de Luanda", texto: "Ocupação crescente em áreas de drenagem natural. Recomenda-se revisão do plano de ordenamento municipal de Viana e Cacuaco.", confianca: 72, prioridade: "Média" },
  { titulo: "Oportunidade de reflorestação em Malanje", texto: "Solos e pluviosidade favoráveis identificados em 4 municípios para espécies nativas.", confianca: 68, prioridade: "Baixa" },
];
