-- Script de limpieza y migración completa de roles
-- Ejecutar este script para limpiar y migrar correctamente

-- Paso 1: Verificar el estado actual
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Paso 2: Ver qué tipos enum existen
SELECT typname FROM pg_type WHERE typname LIKE '%role%';

-- Paso 3: Ver los datos actuales
SELECT id, name, email, role, "isActive" FROM users;

-- Paso 4: Eliminar tipos enum existentes (si existen)
DROP TYPE IF EXISTS "enum_users_role_old" CASCADE;
DROP TYPE IF EXISTS "enum_users_role" CASCADE;

-- Paso 5: Convertir la columna role a VARCHAR temporalmente
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);

-- Paso 6: Actualizar los valores de rol existentes
UPDATE users SET role = 
  CASE 
    WHEN role = 'admin' THEN 'adminusuarios'
    WHEN role = 'coordinador' THEN 'adminusuarios'
    WHEN role = 'estudiante' THEN 'padrefamilia'
    WHEN role = 'profesor' THEN 'profesor'
    ELSE 'profesor'
  END;

-- Paso 7: Crear el nuevo tipo enum
CREATE TYPE "enum_users_role" AS ENUM(
  'adminusuarios',
  'profesor', 
  'padrefamilia',
  'adminestudiantes',
  'adminprofesores'
);

-- Paso 8: Convertir la columna al nuevo tipo enum
ALTER TABLE users 
  ALTER COLUMN role TYPE "enum_users_role" 
  USING role::"enum_users_role";

-- Paso 9: Establecer el valor por defecto
ALTER TABLE users 
  ALTER COLUMN role SET DEFAULT 'profesor'::"enum_users_role";

-- Paso 10: Verificar el resultado final
SELECT id, name, email, role, "isActive" FROM users;

-- Paso 11: Verificar la estructura de la columna
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';