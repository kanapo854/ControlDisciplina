-- Script SQL para migrar los roles de usuarios existentes
-- Este script debe ejecutarse directamente en PostgreSQL

-- Paso 1: Eliminar el valor por defecto temporalmente
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Paso 2: Renombrar el tipo enum existente
ALTER TYPE "enum_users_role" RENAME TO "enum_users_role_old";

-- Paso 3: Crear el nuevo tipo enum con los nuevos valores
CREATE TYPE "enum_users_role" AS ENUM(
  'adminusuarios',
  'profesor', 
  'padrefamilia',
  'adminestudiantes',
  'adminprofesores'
);

-- Paso 4: Actualizar la tabla users para usar el nuevo tipo con conversión de datos
ALTER TABLE users 
  ALTER COLUMN role TYPE "enum_users_role" 
  USING 
    CASE 
      WHEN role::text = 'admin' THEN 'adminusuarios'::enum_users_role
      WHEN role::text = 'coordinador' THEN 'adminusuarios'::enum_users_role
      WHEN role::text = 'estudiante' THEN 'padrefamilia'::enum_users_role
      WHEN role::text = 'profesor' THEN 'profesor'::enum_users_role
      ELSE 'profesor'::enum_users_role
    END;

-- Paso 5: Establecer el nuevo valor por defecto
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'profesor'::enum_users_role;

-- Paso 6: Eliminar el tipo enum anterior
DROP TYPE "enum_users_role_old";

-- Paso 7: Mostrar usuarios actualizados
SELECT id, name, email, role, "isActive" FROM users;