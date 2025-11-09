-- Migración para agregar campos de bloqueo de cuenta por intentos fallidos
-- Implementación de seguridad OWASP A07: Fallas de autenticación

-- Agregar columna para contar intentos fallidos de login
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Agregar columna para fecha de desbloqueo automático
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;

-- Comentarios explicativos
COMMENT ON COLUMN users.failed_login_attempts IS 'Contador de intentos fallidos de login. Se resetea tras login exitoso.';
COMMENT ON COLUMN users.account_locked_until IS 'Fecha hasta la cual la cuenta está bloqueada. NULL = no bloqueada.';

-- Inicializar valores por defecto para usuarios existentes
UPDATE users 
SET failed_login_attempts = 0 
WHERE failed_login_attempts IS NULL;

UPDATE users 
SET account_locked_until = NULL 
WHERE account_locked_until IS NOT NULL AND account_locked_until < NOW();

-- Crear índice para búsquedas eficientes de cuentas bloqueadas
CREATE INDEX IF NOT EXISTS idx_users_account_locked 
ON users(account_locked_until) 
WHERE account_locked_until IS NOT NULL;

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE 'Migración completada: Campos de bloqueo de cuenta agregados correctamente';
END $$;
