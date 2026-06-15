-- ============================================================
-- Moto Fácil · Supabase Migration
-- Rodar no SQL Editor do Supabase (uma vez)
-- ============================================================

-- Tabela de motos
CREATE TABLE IF NOT EXISTS motos (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo          text        NOT NULL CHECK (tipo IN ('venda', 'aluguel')),
  marca         text        NOT NULL DEFAULT '',
  modelo        text        NOT NULL DEFAULT '',
  ano           integer,
  km            integer     DEFAULT 0,
  preco         numeric,
  entrada       numeric,
  parcela       numeric,
  preco_diaria  numeric,
  preco_semanal numeric,
  preco_mensal  numeric,
  cor           text        DEFAULT '',
  categoria     text        DEFAULT '',
  fotos         text[]      DEFAULT '{}',
  disponivel    boolean     DEFAULT true,
  destaque      boolean     DEFAULT false,
  observacoes   text        DEFAULT '',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  updated_by    text        DEFAULT ''
);

-- Configuração global de exibição de preços (tabela com 1 linha)
CREATE TABLE IF NOT EXISTS config (
  id               text PRIMARY KEY DEFAULT 'global',
  venda_preco      boolean DEFAULT true,
  venda_entrada    boolean DEFAULT true,
  venda_parcela    boolean DEFAULT true,
  venda_simulacao  boolean DEFAULT false,
  aluguel_diaria   boolean DEFAULT true,
  aluguel_semanal  boolean DEFAULT false,
  aluguel_mensal   boolean DEFAULT true,
  updated_at       timestamptz DEFAULT now(),
  updated_by       text DEFAULT ''
);

INSERT INTO config (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- Log de auditoria
CREATE TABLE IF NOT EXISTS audit_log (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  action     text        NOT NULL,
  entity     text,
  entity_id  text,
  user_email text,
  details    jsonb       DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE motos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Público (anon): só lê motos disponíveis
CREATE POLICY "anon_read_motos" ON motos
  FOR SELECT TO anon USING (disponivel = true);

-- Autenticado: acesso total a motos
CREATE POLICY "auth_all_motos" ON motos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Público: lê config
CREATE POLICY "anon_read_config" ON config
  FOR SELECT TO anon USING (true);

-- Autenticado: gerencia config
CREATE POLICY "auth_all_config" ON config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Autenticado: insere e lê audit_log
CREATE POLICY "auth_insert_audit" ON audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_read_audit" ON audit_log
  FOR SELECT TO authenticated USING (true);

-- ── Trigger: updated_at automático ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER motos_updated_at
  BEFORE UPDATE ON motos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
