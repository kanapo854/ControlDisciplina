-- Script específico para migrar roles cuando el enum ya existe
-- Ejecutar paso a paso para evitar errores

-- Paso 1: Ver el estado actual de la tabla users
SELECT id, name, email, role, is_active FROM users LIMIT 5;

-- Paso 2: Ver qué valores tiene el enum actual
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
) ORDER BY enumsortorder;

-- Paso 3: Verificar si necesitamos agregar nuevos valores al enum
-- Si el enum actual no tiene los nuevos roles, los agregamos
DO $$
BEGIN
    -- Verificar y agregar 'adminusuarios' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'adminusuarios'
    ) THEN
        ALTER TYPE enum_users_role ADD VALUE 'adminusuarios';
    END IF;
    
    -- Verificar y agregar 'padrefamilia' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'padrefamilia'
    ) THEN
        ALTER TYPE enum_users_role ADD VALUE 'padrefamilia';
    END IF;
    
    -- Verificar y agregar 'adminestudiantes' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'adminestudiantes'
    ) THEN
        ALTER TYPE enum_users_role ADD VALUE 'adminestudiantes';
    END IF;
    
    -- Verificar y agregar 'adminprofesores' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'adminprofesores'
    ) THEN
        ALTER TYPE enum_users_role ADD VALUE 'adminprofesores';
    END IF;
END $$;

-- Paso 4: Actualizar los roles existentes
UPDATE users SET role = 'adminusuarios'::enum_users_role 
WHERE role::text = 'admin';

UPDATE users SET role = 'adminusuarios'::enum_users_role 
WHERE role::text = 'coordinador';

UPDATE users SET role = 'padrefamilia'::enum_users_role 
WHERE role::text = 'estudiante';

-- Paso 5: Verificar que la migración fue exitosa
SELECT id, name, email, role, is_active FROM users;

-- Paso 6: Ver todos los valores disponibles en el enum
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
) ORDER BY enumsortorder;