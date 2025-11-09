-- PARTE 1: Agregar nuevos valores al enum
-- Ejecutar este script PRIMERO y luego ejecutar la PARTE 2

-- Paso 1: Ver el estado actual de la tabla users
SELECT id, name, email, role, is_active FROM users LIMIT 5;

-- Paso 2: Ver qué valores tiene el enum actual
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
) ORDER BY enumsortorder;

-- Paso 3: Agregar nuevos valores al enum (uno por uno para evitar conflictos)
-- Verificar y agregar 'adminusuarios' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'adminusuarios'
    ) THEN
        ALTER TYPE enum_users_role ADD VALUE 'adminusuarios';
        RAISE NOTICE 'Agregado: adminusuarios';
    ELSE
        RAISE NOTICE 'Ya existe: adminusuarios';
    END IF;
END $$;

-- Verificar y agregar 'padrefamilia' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'padrefamilia'
    ) THEN
        ALTER TYPE enum_users_role ADD VALUE 'padrefamilia';
        RAISE NOTICE 'Agregado: padrefamilia';
    ELSE
        RAISE NOTICE 'Ya existe: padrefamilia';
    END IF;
END $$;

-- Verificar y agregar 'adminestudiantes' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'adminestudiantes'
    ) THEN
        ALTER TYPE enum_users_role ADD VALUE 'adminestudiantes';
        RAISE NOTICE 'Agregado: adminestudiantes';
    ELSE
        RAISE NOTICE 'Ya existe: adminestudiantes';
    END IF;
END $$;

-- Verificar y agregar 'adminprofesores' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'adminprofesores'
    ) THEN
        ALTER TYPE enum_users_role ADD VALUE 'adminprofesores';
        RAISE NOTICE 'Agregado: adminprofesores';
    ELSE
        RAISE NOTICE 'Ya existe: adminprofesores';
    END IF;
END $$;

-- Paso 4: Ver todos los valores disponibles en el enum ahora
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
) ORDER BY enumsortorder;

-- IMPORTANTE: Después de ejecutar esta PARTE 1, ejecuta la PARTE 2