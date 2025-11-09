-- Migración para agregar columna courseId a la tabla students
-- Fecha: 2024-11-08

-- Verificar si la columna existe antes de agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='students' AND column_name='courseId'
    ) THEN
        ALTER TABLE students ADD COLUMN "courseId" UUID;
        ALTER TABLE students ADD CONSTRAINT fk_students_course 
            FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE SET NULL;
        
        -- Agregar comentario
        COMMENT ON COLUMN students."courseId" IS 'ID del curso al que pertenece el estudiante (requerido para secundaria)';
        
        RAISE NOTICE 'Columna courseId agregada exitosamente a la tabla students';
    ELSE
        RAISE NOTICE 'La columna courseId ya existe en la tabla students';
    END IF;
END $$;