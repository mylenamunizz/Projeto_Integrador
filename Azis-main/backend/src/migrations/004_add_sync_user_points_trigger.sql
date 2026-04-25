-- Migration: 004_add_sync_user_points_trigger.sql
-- Descrição: Criação de trigger para sincronizar pontos automáticamente
--            entre a tabela user_points (fonte da verdade) e users
-- Data: 2026-04-12

-- Garantir que a coluna points existe na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- FUNÇÃO: sync_user_points()
-- =============================================================================
-- Propósito: Sincronizar automaticamente o valor total_points da tabela
--           user_points para a coluna points na tabela users.
--           Garante que os pontos estejam sempre consistentes entre as duas
--           tabelas.
-- Tipo: TRIGGER FUNCTION (RETURNS TRIGGER)
-- Comportamento:
--   - Atualiza users.points com o valor de NEW.total_points
--   - Filtra pela chave user_id
--   - Retorna NEW para permitir continuação da operação
-- =============================================================================
CREATE OR REPLACE FUNCTION sync_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Sincronizar o total_points de user_points para points em users
  UPDATE users
  SET points = NEW.total_points
  WHERE id = NEW.user_id;

  -- Retornar o registro modificado (obrigatório para triggers)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER: trg_sync_user_points
-- =============================================================================
-- Propósito: Disparar a sincronização sempre que houver mudanças na tabela
--           user_points
-- Momento: AFTER INSERT OR UPDATE
-- Escopo: FOR EACH ROW (executa para cada linha modificada)
-- Ação: Executa a função sync_user_points() para manter users.points
--       sincronizado com user_points.total_points
-- =============================================================================
DROP TRIGGER IF EXISTS trg_sync_user_points ON user_points;

CREATE TRIGGER trg_sync_user_points
AFTER INSERT OR UPDATE ON user_points
FOR EACH ROW
EXECUTE FUNCTION sync_user_points();
