-- Migración para eliminar campos redundantes de padre/madre de la tabla students
-- Estos datos ahora se obtienen de la tabla users mediante parent_user_id

-- Eliminar las columnas parent_name, parent_phone y parent_email
ALTER TABLE students 
DROP COLUMN IF EXISTS parent_name,
DROP COLUMN IF EXISTS parent_phone,
DROP COLUMN IF EXISTS parent_email;

-- Verificar que la columna parent_user_id existe y tiene la relación correcta
-- (Solo informativo, no ejecuta nada si ya existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'parent_user_id'
    ) THEN
        RAISE NOTICE 'ADVERTENCIA: La columna parent_user_id no existe en la tabla students';
    ELSE
        RAISE NOTICE 'OK: La columna parent_user_id existe correctamente';
    END IF;
END $$;

-- Comentario informativo
COMMENT ON COLUMN students.parent_user_id IS 'ID del usuario padre/madre vinculado desde la tabla users';
