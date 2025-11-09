-- Migración para hacer opcionales los campos de padre en la tabla students
-- Esto permite crear estudiantes sin información del padre/acudiente

-- Hacer opcional el campo parent_name
ALTER TABLE students 
ALTER COLUMN parent_name DROP NOT NULL;

-- Hacer opcional el campo parent_phone  
ALTER TABLE students 
ALTER COLUMN parent_phone DROP NOT NULL;

-- El campo parent_email ya es opcional

-- Agregar comentarios explicativos
COMMENT ON COLUMN students.parent_name IS 'Nombre del padre/madre/acudiente (opcional)';
COMMENT ON COLUMN students.parent_phone IS 'Teléfono del padre/madre/acudiente (opcional)';
COMMENT ON COLUMN students.parent_email IS 'Email del padre/madre/acudiente (opcional)';

-- Verificar que los cambios se aplicaron correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('parent_name', 'parent_phone', 'parent_email')
ORDER BY column_name;