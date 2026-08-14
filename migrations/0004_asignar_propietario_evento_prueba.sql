-- Migration: asigna propietario al evento de prueba
-- Mantiene consistente la regla administrador/supervisor para eventos existentes.

UPDATE events
SET created_by_user_id = 'user_admin_seed',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'evt_inauguracion_otca'
  AND created_by_user_id IS NULL;
