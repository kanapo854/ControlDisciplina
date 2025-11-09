-- Migración para agregar el campo parent_user_id a la tabla students
-- Este campo permite vincular un estudiante con su padre/madre que tiene acceso al sistema

-- Agregar la columna parent_user_id (opcional)
ALTER TABLE students 
ADD COLUMN parent_user_id UUID NULL;

-- Agregar la restricción de clave foránea
ALTER TABLE students 
ADD CONSTRAINT fk_students_parent_user 
FOREIGN KEY (parent_user_id) 
REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Agregar índice para mejorar las consultas
CREATE INDEX idx_students_parent_user_id ON students(parent_user_id);

-- Agregar comentario a la columna
COMMENT ON COLUMN students.parent_user_id IS 'ID del usuario padre/madre que tiene acceso al sistema (opcional)';

-- Verificar que se creó correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name = 'parent_user_id';