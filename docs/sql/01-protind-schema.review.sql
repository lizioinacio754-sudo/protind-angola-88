-- PROTIND | 10-11-2026 | PROPOSTA PARA REVISÃO — NÃO EXECUTADA NO NEON
-- Execução exige autorização expressa e confirmação do ambiente.
-- Não ligar este ficheiro ao arranque, a loaders ou a funções da aplicação.
-- Etapa 1: transacção, pré-condições e esquema exclusivo.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
DO $$
BEGIN
  IF to_regnamespace('protind') IS NOT NULL THEN
    RAISE EXCEPTION 'O esquema protind já existe: parar e rever, sem substituir objectos';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'neon_auth' AND table_name = 'user'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    RAISE EXCEPTION 'Identidade neon_auth.user.id UUID não encontrada';
  END IF;
END $$;
CREATE SCHEMA protind;
REVOKE ALL ON SCHEMA protind FROM PUBLIC;
-- Apenas afecta futuros objectos deste proprietário no novo esquema.
ALTER DEFAULT PRIVILEGES IN SCHEMA protind REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA protind REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA protind REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Etapa 2: território e identidade; sem modificar neon_auth.

CREATE TABLE protind.unidades_territoriais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE CHECK (length(btrim(codigo)) BETWEEN 1 AND 80), nome text NOT NULL CHECK (length(btrim(nome)) BETWEEN 1 AND 200), tipo text NOT NULL CHECK (tipo IN ('provincia','municipio','comuna')), unidade_pai_id uuid REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, fonte text NOT NULL CHECK (btrim(fonte) <> ''), vigente_desde date, vigente_ate date, limite_geojson jsonb CHECK (limite_geojson IS NULL OR (jsonb_typeof(limite_geojson) = 'object' AND limite_geojson->>'type' IN ('Polygon','MultiPolygon'))), arquivado_em timestamptz, CHECK (unidade_pai_id IS DISTINCT FROM id), CHECK (vigente_ate IS NULL OR (vigente_desde IS NOT NULL AND vigente_ate >= vigente_desde)),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.perfis_utilizador (
  utilizador_id uuid PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, nome_exibicao text NOT NULL CHECK (length(btrim(nome_exibicao)) BETWEEN 1 AND 200), instituicao text, cargo text, telefone text, municipio_id uuid REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, preferencias jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(preferencias) = 'object'),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.papeis_acesso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE CHECK (codigo IN ('administrador','tecnico','consulta')), nome text NOT NULL, descricao text NOT NULL, activo boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.atribuicoes_acesso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizador_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, papel_id uuid NOT NULL REFERENCES protind.papeis_acesso(id) ON DELETE RESTRICT, unidade_territorial_id uuid REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, atribuido_por uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, atribuido_em timestamptz NOT NULL DEFAULT now(), revogado_em timestamptz, CHECK (revogado_em IS NULL OR revogado_em >= atribuido_em),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX atribuicoes_activas_uq ON protind.atribuicoes_acesso (utilizador_id, papel_id, unidade_territorial_id) NULLS NOT DISTINCT WHERE revogado_em IS NULL;

-- Etapa 3: zonas, instalações e actividades.

CREATE TABLE protind.zonas_territoriais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE, nome text NOT NULL CHECK (btrim(nome) <> ''), unidade_territorial_id uuid NOT NULL REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, descricao text, area_ha numeric CHECK (area_ha >= 0), limite_geojson jsonb CHECK (limite_geojson IS NULL OR (jsonb_typeof(limite_geojson) = 'object' AND limite_geojson->>'type' IN ('Polygon','MultiPolygon'))), latitude numeric CHECK (latitude BETWEEN -90 AND 90), longitude numeric CHECK (longitude BETWEEN -180 AND 180), CHECK ((latitude IS NULL) = (longitude IS NULL)), fonte text NOT NULL CHECK (btrim(fonte) <> ''), estado text NOT NULL DEFAULT 'por_validar' CHECK (estado IN ('por_validar','validada','arquivada')), arquivado_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.classificacoes_zona (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zona_id uuid NOT NULL REFERENCES protind.zonas_territoriais(id) ON DELETE RESTRICT, tipo text NOT NULL CHECK (tipo IN ('industrial','residencial','ambientalmente_sensivel')), fundamento text, fonte text NOT NULL, validado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, validado_em timestamptz, UNIQUE (zona_id,tipo), CHECK ((validado_por IS NULL) = (validado_em IS NULL)),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.detalhes_zona_industrial (
  zona_id uuid PRIMARY KEY REFERENCES protind.zonas_territoriais(id) ON DELETE RESTRICT, tipo text NOT NULL DEFAULT 'industrial' CHECK (tipo = 'industrial'), situacao_ordenamento text NOT NULL CHECK (situacao_ordenamento IN ('por_verificar','prevista','formalizada','nao_formalizada')), infraestruturas text, documento_referencia text, FOREIGN KEY (zona_id,tipo) REFERENCES protind.classificacoes_zona(zona_id,tipo) ON DELETE RESTRICT,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.detalhes_zona_residencial (
  zona_id uuid PRIMARY KEY REFERENCES protind.zonas_territoriais(id) ON DELETE RESTRICT, tipo text NOT NULL DEFAULT 'residencial' CHECK (tipo = 'residencial'), populacao_estimada bigint CHECK (populacao_estimada >= 0), data_estimativa date, fonte_estimativa text, CHECK (populacao_estimada IS NULL OR (data_estimativa IS NOT NULL AND fonte_estimativa IS NOT NULL)), FOREIGN KEY (zona_id,tipo) REFERENCES protind.classificacoes_zona(zona_id,tipo) ON DELETE RESTRICT,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.detalhes_area_sensivel (
  zona_id uuid PRIMARY KEY REFERENCES protind.zonas_territoriais(id) ON DELETE RESTRICT, tipo text NOT NULL DEFAULT 'ambientalmente_sensivel' CHECK (tipo = 'ambientalmente_sensivel'), categoria_sensibilidade text NOT NULL, nivel_sensibilidade text NOT NULL CHECK (nivel_sensibilidade IN ('por_avaliar','baixo','medio','alto')), fundamento_proteccao text, restricoes text, FOREIGN KEY (zona_id,tipo) REFERENCES protind.classificacoes_zona(zona_id,tipo) ON DELETE RESTRICT,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.instalacoes_industriais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE, nome text NOT NULL CHECK (btrim(nome) <> ''), entidade_operadora text, nif text, unidade_territorial_id uuid NOT NULL REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, zona_industrial_id uuid REFERENCES protind.detalhes_zona_industrial(zona_id) ON DELETE RESTRICT, endereco text, latitude numeric CHECK (latitude BETWEEN -90 AND 90), longitude numeric CHECK (longitude BETWEEN -180 AND 180), CHECK ((latitude IS NULL) = (longitude IS NULL)), estado_operacao text NOT NULL CHECK (estado_operacao IN ('por_verificar','planeada','activa','suspensa','encerrada')), licenca_referencia text, inicio_actividade date, arquivado_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.actividades_industriais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE, nome text NOT NULL CHECK (btrim(nome) <> ''), sector text NOT NULL, descricao text, fonte_classificacao text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.instalacao_actividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instalacao_id uuid NOT NULL REFERENCES protind.instalacoes_industriais(id) ON DELETE RESTRICT, actividade_id uuid NOT NULL REFERENCES protind.actividades_industriais(id) ON DELETE RESTRICT, principal boolean NOT NULL DEFAULT false, inicio date, fim date, capacidade numeric CHECK (capacidade >= 0), unidade_capacidade text, CHECK (fim IS NULL OR (inicio IS NOT NULL AND fim >= inicio)), CHECK (capacidade IS NULL OR btrim(unidade_capacidade) <> ''),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX actividade_vigente_uq ON protind.instalacao_actividades(instalacao_id,actividade_id) WHERE fim IS NULL;
CREATE UNIQUE INDEX actividade_principal_uq ON protind.instalacao_actividades(instalacao_id) WHERE principal AND fim IS NULL;

-- Etapa 4: enquetes versionadas e respostas, sem dados pessoais de exemplo.

CREATE TABLE protind.enquetes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL CHECK (btrim(titulo) <> ''), descricao text, versao integer NOT NULL CHECK (versao > 0), estado text NOT NULL DEFAULT 'rascunho' CHECK (estado IN ('rascunho','publicada','encerrada','arquivada')), inicio_em timestamptz NOT NULL, fim_em timestamptz, unidade_territorial_id uuid REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, aviso_privacidade_versao text NOT NULL, CHECK (fim_em IS NULL OR fim_em > inicio_em),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.perguntas_enquete (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquete_id uuid NOT NULL REFERENCES protind.enquetes(id) ON DELETE RESTRICT, codigo text NOT NULL, texto text NOT NULL CHECK (btrim(texto) <> ''), tipo text NOT NULL CHECK (tipo IN ('texto','numero','escolha_unica','escolha_multipla')), obrigatoria boolean NOT NULL DEFAULT false, ordem integer NOT NULL CHECK (ordem >= 0), regras_validacao jsonb CHECK (regras_validacao IS NULL OR jsonb_typeof(regras_validacao) = 'object'), UNIQUE(enquete_id,codigo), UNIQUE(enquete_id,ordem), UNIQUE(id,enquete_id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.opcoes_pergunta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id uuid NOT NULL REFERENCES protind.perguntas_enquete(id) ON DELETE RESTRICT, codigo text NOT NULL, texto text NOT NULL CHECK (btrim(texto) <> ''), ordem integer NOT NULL CHECK (ordem >= 0), UNIQUE(pergunta_id,codigo), UNIQUE(pergunta_id,ordem), UNIQUE(id,pergunta_id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.submissoes_enquete (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquete_id uuid NOT NULL REFERENCES protind.enquetes(id) ON DELETE RESTRICT, utilizador_id uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, municipio_id uuid REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, estado text NOT NULL DEFAULT 'rascunho' CHECK (estado IN ('rascunho','submetida','invalidada')), submetido_em timestamptz, aviso_privacidade_versao text NOT NULL, concordancia_em timestamptz, UNIQUE(id,enquete_id), CHECK (estado <> 'submetida' OR (submetido_em IS NOT NULL AND concordancia_em IS NOT NULL)),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.respostas_enquete (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submissao_id uuid NOT NULL, enquete_id uuid NOT NULL, pergunta_id uuid NOT NULL, valor_texto text CHECK (length(valor_texto) <= 10000), valor_numero numeric, UNIQUE(submissao_id,pergunta_id), UNIQUE(id,pergunta_id), FOREIGN KEY(submissao_id,enquete_id) REFERENCES protind.submissoes_enquete(id,enquete_id) ON DELETE RESTRICT, FOREIGN KEY(pergunta_id,enquete_id) REFERENCES protind.perguntas_enquete(id,enquete_id) ON DELETE RESTRICT, CHECK (num_nonnulls(valor_texto,valor_numero) <= 1),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.resposta_opcoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resposta_id uuid NOT NULL, pergunta_id uuid NOT NULL, opcao_id uuid NOT NULL, UNIQUE(resposta_id,opcao_id), FOREIGN KEY(resposta_id,pergunta_id) REFERENCES protind.respostas_enquete(id,pergunta_id) ON DELETE RESTRICT, FOREIGN KEY(opcao_id,pergunta_id) REFERENCES protind.opcoes_pergunta(id,pergunta_id) ON DELETE RESTRICT,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

-- Etapa 5: observações, impactos, avaliações e medições.

CREATE TABLE protind.observacoes_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE, unidade_territorial_id uuid NOT NULL REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, zona_id uuid REFERENCES protind.zonas_territoriais(id) ON DELETE RESTRICT, instalacao_id uuid REFERENCES protind.instalacoes_industriais(id) ON DELETE RESTRICT, tipo text NOT NULL, descricao text NOT NULL CHECK (btrim(descricao) <> ''), observado_em timestamptz NOT NULL, latitude numeric CHECK (latitude BETWEEN -90 AND 90), longitude numeric CHECK (longitude BETWEEN -180 AND 180), CHECK ((latitude IS NULL) = (longitude IS NULL)), gravidade text NOT NULL CHECK (gravidade IN ('por_avaliar','baixa','media','alta')), estado text NOT NULL DEFAULT 'registada' CHECK (estado IN ('registada','em_analise','em_campo','resolvida','arquivada')), fonte text NOT NULL, validado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, validado_em timestamptz, CHECK ((validado_por IS NULL) = (validado_em IS NULL)),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.impactos_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observacao_id uuid REFERENCES protind.observacoes_ambientais(id) ON DELETE RESTRICT, instalacao_id uuid REFERENCES protind.instalacoes_industriais(id) ON DELETE RESTRICT, zona_id uuid REFERENCES protind.zonas_territoriais(id) ON DELETE RESTRICT, categoria text NOT NULL, descricao text NOT NULL, severidade text NOT NULL CHECK (severidade IN ('por_avaliar','baixa','media','alta')), duracao text, extensao text, evidencia_referencia text, estado_validacao text NOT NULL DEFAULT 'por_validar' CHECK (estado_validacao IN ('por_validar','validado','rejeitado')), CHECK(num_nonnulls(observacao_id,instalacao_id,zona_id) >= 1),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.avaliacoes_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL, unidade_territorial_id uuid NOT NULL REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, zona_id uuid REFERENCES protind.zonas_territoriais(id) ON DELETE RESTRICT, instalacao_id uuid REFERENCES protind.instalacoes_industriais(id) ON DELETE RESTRICT, periodo_inicio date NOT NULL, periodo_fim date NOT NULL, metodologia text NOT NULL CHECK (btrim(metodologia) <> ''), responsavel_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, estado text NOT NULL DEFAULT 'rascunho' CHECK (estado IN ('rascunho','em_revisao','aprovada','arquivada')), conclusao text, aprovado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, aprovado_em timestamptz, CHECK(periodo_fim >= periodo_inicio), CHECK ((aprovado_por IS NULL) = (aprovado_em IS NULL)), CHECK (estado <> 'aprovada' OR aprovado_por IS NOT NULL),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.indicadores_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE, nome text NOT NULL, dimensao text NOT NULL CHECK (dimensao IN ('ar','agua','solo','ruido','residuos','vegetacao','outro')), unidade_medida text NOT NULL CHECK (btrim(unidade_medida) <> ''), metodo_medicao text NOT NULL, descricao text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.criterios_indicador (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id uuid NOT NULL REFERENCES protind.indicadores_ambientais(id) ON DELETE RESTRICT, versao integer NOT NULL CHECK (versao > 0), contexto text NOT NULL, limite_inferior numeric, limite_superior numeric, fonte_normativa text NOT NULL CHECK (btrim(fonte_normativa) <> ''), vigente_desde date NOT NULL, vigente_ate date, UNIQUE(indicador_id,versao,contexto), UNIQUE(id,indicador_id), CHECK(num_nonnulls(limite_inferior,limite_superior) >= 1), CHECK(limite_inferior IS NULL OR limite_superior IS NULL OR limite_superior >= limite_inferior), CHECK(vigente_ate IS NULL OR vigente_ate >= vigente_desde),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.medicoes_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid NOT NULL REFERENCES protind.avaliacoes_ambientais(id) ON DELETE RESTRICT, indicador_id uuid NOT NULL REFERENCES protind.indicadores_ambientais(id) ON DELETE RESTRICT, criterio_id uuid, valor numeric NOT NULL CHECK (valor::text NOT IN ('NaN','Infinity','-Infinity')), medido_em timestamptz NOT NULL, ponto_referencia text, latitude numeric CHECK (latitude BETWEEN -90 AND 90), longitude numeric CHECK (longitude BETWEEN -180 AND 180), CHECK ((latitude IS NULL) = (longitude IS NULL)), metodo text NOT NULL, fonte text NOT NULL, qualidade_dado text NOT NULL CHECK (qualidade_dado IN ('por_validar','validado','rejeitado')), observacao text, FOREIGN KEY(criterio_id,indicador_id) REFERENCES protind.criterios_indicador(id,indicador_id) ON DELETE RESTRICT,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

-- Etapa 6: continuidade funcional, relatórios e auditoria.

CREATE TABLE protind.projectos_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE, nome text NOT NULL, descricao text, unidade_territorial_id uuid NOT NULL REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, zona_id uuid REFERENCES protind.zonas_territoriais(id) ON DELETE RESTRICT, responsavel_id uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, inicio date, fim_previsto date, orcamento_kz numeric CHECK (orcamento_kz >= 0), progresso_percentual numeric NOT NULL DEFAULT 0 CHECK (progresso_percentual BETWEEN 0 AND 100), estado text NOT NULL DEFAULT 'planeado' CHECK (estado IN ('planeado','em_curso','suspenso','concluido','arquivado')), CHECK (fim_previsto IS NULL OR (inicio IS NOT NULL AND fim_previsto >= inicio)),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.analises_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL, unidade_territorial_id uuid REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, avaliacao_id uuid REFERENCES protind.avaliacoes_ambientais(id) ON DELETE RESTRICT, projecto_id uuid REFERENCES protind.projectos_ambientais(id) ON DELETE RESTRICT, modelo text NOT NULL, versao_modelo text NOT NULL, fontes_referencia jsonb NOT NULL CHECK (jsonb_typeof(fontes_referencia) = 'array'), resultado text NOT NULL, recomendacao text, confianca_percentual numeric CHECK (confianca_percentual BETWEEN 0 AND 100), estado_revisao text NOT NULL DEFAULT 'por_rever' CHECK (estado_revisao IN ('por_rever','validada','rejeitada')), revisto_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, revisto_em timestamptz, CHECK ((revisto_por IS NULL) = (revisto_em IS NULL)), CHECK (estado_revisao = 'por_rever' OR revisto_por IS NOT NULL),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.relatorios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL, tipo text NOT NULL, unidade_territorial_id uuid REFERENCES protind.unidades_territoriais(id) ON DELETE RESTRICT, periodo_inicio date, periodo_fim date, filtros jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(filtros) = 'object'), versao integer NOT NULL CHECK (versao > 0), estado text NOT NULL DEFAULT 'rascunho' CHECK (estado IN ('rascunho','em_revisao','aprovado','arquivado')), gerado_por uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, gerado_em timestamptz NOT NULL DEFAULT now(), aprovado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, aprovado_em timestamptz, ficheiro_referencia text, resumo_snapshot jsonb CHECK (resumo_snapshot IS NULL OR jsonb_typeof(resumo_snapshot) = 'object'), CHECK (periodo_fim IS NULL OR (periodo_inicio IS NOT NULL AND periodo_fim >= periodo_inicio)), CHECK ((aprovado_por IS NULL) = (aprovado_em IS NULL)), CHECK (estado <> 'aprovado' OR aprovado_por IS NOT NULL),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.relatorio_avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relatorio_id uuid NOT NULL REFERENCES protind.relatorios(id) ON DELETE RESTRICT, avaliacao_id uuid NOT NULL REFERENCES protind.avaliacoes_ambientais(id) ON DELETE RESTRICT, UNIQUE(relatorio_id,avaliacao_id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  actualizado_por uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT
);

CREATE TABLE protind.auditoria_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, accao text NOT NULL CHECK (btrim(accao) <> ''), recurso text NOT NULL, registo_id uuid NOT NULL, ocorrido_em timestamptz NOT NULL DEFAULT now(), campos_alterados jsonb CHECK (campos_alterados IS NULL OR jsonb_typeof(campos_alterados) = 'array'), motivo text, pedido_id uuid
);

-- Etapa 7: índices de acesso e de suporte às referências.

CREATE INDEX unidades_territoriais_unidade_pai_id_idx ON protind.unidades_territoriais(unidade_pai_id);

CREATE INDEX unidades_territoriais_criado_por_idx ON protind.unidades_territoriais(criado_por);

CREATE INDEX unidades_territoriais_actualizado_por_idx ON protind.unidades_territoriais(actualizado_por);

CREATE INDEX perfis_utilizador_municipio_id_idx ON protind.perfis_utilizador(municipio_id);

CREATE INDEX perfis_utilizador_criado_por_idx ON protind.perfis_utilizador(criado_por);

CREATE INDEX perfis_utilizador_actualizado_por_idx ON protind.perfis_utilizador(actualizado_por);

CREATE INDEX perfis_utilizador_utilizador_id_idx ON protind.perfis_utilizador(utilizador_id);

CREATE INDEX papeis_acesso_criado_por_idx ON protind.papeis_acesso(criado_por);

CREATE INDEX papeis_acesso_actualizado_por_idx ON protind.papeis_acesso(actualizado_por);

CREATE INDEX atribuicoes_acesso_utilizador_id_idx ON protind.atribuicoes_acesso(utilizador_id);

CREATE INDEX atribuicoes_acesso_papel_id_idx ON protind.atribuicoes_acesso(papel_id);

CREATE INDEX atribuicoes_acesso_unidade_territorial_id_idx ON protind.atribuicoes_acesso(unidade_territorial_id);

CREATE INDEX atribuicoes_acesso_atribuido_por_idx ON protind.atribuicoes_acesso(atribuido_por);

CREATE INDEX atribuicoes_acesso_criado_por_idx ON protind.atribuicoes_acesso(criado_por);

CREATE INDEX atribuicoes_acesso_actualizado_por_idx ON protind.atribuicoes_acesso(actualizado_por);

CREATE INDEX zonas_territoriais_unidade_territorial_id_idx ON protind.zonas_territoriais(unidade_territorial_id);

CREATE INDEX zonas_territoriais_criado_por_idx ON protind.zonas_territoriais(criado_por);

CREATE INDEX zonas_territoriais_actualizado_por_idx ON protind.zonas_territoriais(actualizado_por);

CREATE INDEX classificacoes_zona_zona_id_idx ON protind.classificacoes_zona(zona_id);

CREATE INDEX classificacoes_zona_validado_por_idx ON protind.classificacoes_zona(validado_por);

CREATE INDEX classificacoes_zona_criado_por_idx ON protind.classificacoes_zona(criado_por);

CREATE INDEX classificacoes_zona_actualizado_por_idx ON protind.classificacoes_zona(actualizado_por);

CREATE INDEX detalhes_zona_industrial_criado_por_idx ON protind.detalhes_zona_industrial(criado_por);

CREATE INDEX detalhes_zona_industrial_actualizado_por_idx ON protind.detalhes_zona_industrial(actualizado_por);

CREATE INDEX detalhes_zona_industrial_zona_id_idx ON protind.detalhes_zona_industrial(zona_id);

CREATE INDEX detalhes_zona_residencial_criado_por_idx ON protind.detalhes_zona_residencial(criado_por);

CREATE INDEX detalhes_zona_residencial_actualizado_por_idx ON protind.detalhes_zona_residencial(actualizado_por);

CREATE INDEX detalhes_zona_residencial_zona_id_idx ON protind.detalhes_zona_residencial(zona_id);

CREATE INDEX detalhes_area_sensivel_criado_por_idx ON protind.detalhes_area_sensivel(criado_por);

CREATE INDEX detalhes_area_sensivel_actualizado_por_idx ON protind.detalhes_area_sensivel(actualizado_por);

CREATE INDEX detalhes_area_sensivel_zona_id_idx ON protind.detalhes_area_sensivel(zona_id);

CREATE INDEX instalacoes_industriais_unidade_territorial_id_idx ON protind.instalacoes_industriais(unidade_territorial_id);

CREATE INDEX instalacoes_industriais_zona_industrial_id_idx ON protind.instalacoes_industriais(zona_industrial_id);

CREATE INDEX instalacoes_industriais_criado_por_idx ON protind.instalacoes_industriais(criado_por);

CREATE INDEX instalacoes_industriais_actualizado_por_idx ON protind.instalacoes_industriais(actualizado_por);

CREATE INDEX actividades_industriais_criado_por_idx ON protind.actividades_industriais(criado_por);

CREATE INDEX actividades_industriais_actualizado_por_idx ON protind.actividades_industriais(actualizado_por);

CREATE INDEX instalacao_actividades_instalacao_id_idx ON protind.instalacao_actividades(instalacao_id);

CREATE INDEX instalacao_actividades_actividade_id_idx ON protind.instalacao_actividades(actividade_id);

CREATE INDEX instalacao_actividades_criado_por_idx ON protind.instalacao_actividades(criado_por);

CREATE INDEX instalacao_actividades_actualizado_por_idx ON protind.instalacao_actividades(actualizado_por);

CREATE INDEX enquetes_unidade_territorial_id_idx ON protind.enquetes(unidade_territorial_id);

CREATE INDEX enquetes_criado_por_idx ON protind.enquetes(criado_por);

CREATE INDEX enquetes_actualizado_por_idx ON protind.enquetes(actualizado_por);

CREATE INDEX perguntas_enquete_enquete_id_idx ON protind.perguntas_enquete(enquete_id);

CREATE INDEX perguntas_enquete_criado_por_idx ON protind.perguntas_enquete(criado_por);

CREATE INDEX perguntas_enquete_actualizado_por_idx ON protind.perguntas_enquete(actualizado_por);

CREATE INDEX opcoes_pergunta_pergunta_id_idx ON protind.opcoes_pergunta(pergunta_id);

CREATE INDEX opcoes_pergunta_criado_por_idx ON protind.opcoes_pergunta(criado_por);

CREATE INDEX opcoes_pergunta_actualizado_por_idx ON protind.opcoes_pergunta(actualizado_por);

CREATE INDEX submissoes_enquete_enquete_id_idx ON protind.submissoes_enquete(enquete_id);

CREATE INDEX submissoes_enquete_utilizador_id_idx ON protind.submissoes_enquete(utilizador_id);

CREATE INDEX submissoes_enquete_municipio_id_idx ON protind.submissoes_enquete(municipio_id);

CREATE INDEX submissoes_enquete_criado_por_idx ON protind.submissoes_enquete(criado_por);

CREATE INDEX submissoes_enquete_actualizado_por_idx ON protind.submissoes_enquete(actualizado_por);

CREATE INDEX respostas_enquete_criado_por_idx ON protind.respostas_enquete(criado_por);

CREATE INDEX respostas_enquete_actualizado_por_idx ON protind.respostas_enquete(actualizado_por);

CREATE INDEX resposta_opcoes_criado_por_idx ON protind.resposta_opcoes(criado_por);

CREATE INDEX resposta_opcoes_actualizado_por_idx ON protind.resposta_opcoes(actualizado_por);

CREATE INDEX observacoes_ambientais_unidade_territorial_id_idx ON protind.observacoes_ambientais(unidade_territorial_id);

CREATE INDEX observacoes_ambientais_zona_id_idx ON protind.observacoes_ambientais(zona_id);

CREATE INDEX observacoes_ambientais_instalacao_id_idx ON protind.observacoes_ambientais(instalacao_id);

CREATE INDEX observacoes_ambientais_validado_por_idx ON protind.observacoes_ambientais(validado_por);

CREATE INDEX observacoes_ambientais_criado_por_idx ON protind.observacoes_ambientais(criado_por);

CREATE INDEX observacoes_ambientais_actualizado_por_idx ON protind.observacoes_ambientais(actualizado_por);

CREATE INDEX impactos_ambientais_observacao_id_idx ON protind.impactos_ambientais(observacao_id);

CREATE INDEX impactos_ambientais_instalacao_id_idx ON protind.impactos_ambientais(instalacao_id);

CREATE INDEX impactos_ambientais_zona_id_idx ON protind.impactos_ambientais(zona_id);

CREATE INDEX impactos_ambientais_criado_por_idx ON protind.impactos_ambientais(criado_por);

CREATE INDEX impactos_ambientais_actualizado_por_idx ON protind.impactos_ambientais(actualizado_por);

CREATE INDEX avaliacoes_ambientais_unidade_territorial_id_idx ON protind.avaliacoes_ambientais(unidade_territorial_id);

CREATE INDEX avaliacoes_ambientais_zona_id_idx ON protind.avaliacoes_ambientais(zona_id);

CREATE INDEX avaliacoes_ambientais_instalacao_id_idx ON protind.avaliacoes_ambientais(instalacao_id);

CREATE INDEX avaliacoes_ambientais_responsavel_id_idx ON protind.avaliacoes_ambientais(responsavel_id);

CREATE INDEX avaliacoes_ambientais_aprovado_por_idx ON protind.avaliacoes_ambientais(aprovado_por);

CREATE INDEX avaliacoes_ambientais_criado_por_idx ON protind.avaliacoes_ambientais(criado_por);

CREATE INDEX avaliacoes_ambientais_actualizado_por_idx ON protind.avaliacoes_ambientais(actualizado_por);

CREATE INDEX indicadores_ambientais_criado_por_idx ON protind.indicadores_ambientais(criado_por);

CREATE INDEX indicadores_ambientais_actualizado_por_idx ON protind.indicadores_ambientais(actualizado_por);

CREATE INDEX criterios_indicador_indicador_id_idx ON protind.criterios_indicador(indicador_id);

CREATE INDEX criterios_indicador_criado_por_idx ON protind.criterios_indicador(criado_por);

CREATE INDEX criterios_indicador_actualizado_por_idx ON protind.criterios_indicador(actualizado_por);

CREATE INDEX medicoes_ambientais_avaliacao_id_idx ON protind.medicoes_ambientais(avaliacao_id);

CREATE INDEX medicoes_ambientais_indicador_id_idx ON protind.medicoes_ambientais(indicador_id);

CREATE INDEX medicoes_ambientais_criado_por_idx ON protind.medicoes_ambientais(criado_por);

CREATE INDEX medicoes_ambientais_actualizado_por_idx ON protind.medicoes_ambientais(actualizado_por);

CREATE INDEX projectos_ambientais_unidade_territorial_id_idx ON protind.projectos_ambientais(unidade_territorial_id);

CREATE INDEX projectos_ambientais_zona_id_idx ON protind.projectos_ambientais(zona_id);

CREATE INDEX projectos_ambientais_responsavel_id_idx ON protind.projectos_ambientais(responsavel_id);

CREATE INDEX projectos_ambientais_criado_por_idx ON protind.projectos_ambientais(criado_por);

CREATE INDEX projectos_ambientais_actualizado_por_idx ON protind.projectos_ambientais(actualizado_por);

CREATE INDEX analises_ia_unidade_territorial_id_idx ON protind.analises_ia(unidade_territorial_id);

CREATE INDEX analises_ia_avaliacao_id_idx ON protind.analises_ia(avaliacao_id);

CREATE INDEX analises_ia_projecto_id_idx ON protind.analises_ia(projecto_id);

CREATE INDEX analises_ia_revisto_por_idx ON protind.analises_ia(revisto_por);

CREATE INDEX analises_ia_criado_por_idx ON protind.analises_ia(criado_por);

CREATE INDEX analises_ia_actualizado_por_idx ON protind.analises_ia(actualizado_por);

CREATE INDEX relatorios_unidade_territorial_id_idx ON protind.relatorios(unidade_territorial_id);

CREATE INDEX relatorios_gerado_por_idx ON protind.relatorios(gerado_por);

CREATE INDEX relatorios_aprovado_por_idx ON protind.relatorios(aprovado_por);

CREATE INDEX relatorios_criado_por_idx ON protind.relatorios(criado_por);

CREATE INDEX relatorios_actualizado_por_idx ON protind.relatorios(actualizado_por);

CREATE INDEX relatorio_avaliacoes_relatorio_id_idx ON protind.relatorio_avaliacoes(relatorio_id);

CREATE INDEX relatorio_avaliacoes_avaliacao_id_idx ON protind.relatorio_avaliacoes(avaliacao_id);

CREATE INDEX relatorio_avaliacoes_criado_por_idx ON protind.relatorio_avaliacoes(criado_por);

CREATE INDEX relatorio_avaliacoes_actualizado_por_idx ON protind.relatorio_avaliacoes(actualizado_por);

CREATE INDEX auditoria_eventos_actor_id_idx ON protind.auditoria_eventos(actor_id);

CREATE INDEX respostas_enquete_submissao_id_fk_idx ON protind.respostas_enquete(submissao_id,enquete_id);

CREATE INDEX respostas_enquete_pergunta_id_fk_idx ON protind.respostas_enquete(pergunta_id,enquete_id);

CREATE INDEX resposta_opcoes_opcao_id_fk_idx ON protind.resposta_opcoes(opcao_id,pergunta_id);

CREATE INDEX medicoes_ambientais_criterio_id_fk_idx ON protind.medicoes_ambientais(criterio_id,indicador_id);

CREATE INDEX observacoes_data_idx ON protind.observacoes_ambientais(unidade_territorial_id, observado_em DESC, id);

CREATE INDEX medicoes_data_idx ON protind.medicoes_ambientais(indicador_id, medido_em DESC, id);

CREATE INDEX auditoria_registo_idx ON protind.auditoria_eventos(recurso,registo_id,ocorrido_em DESC,id);
