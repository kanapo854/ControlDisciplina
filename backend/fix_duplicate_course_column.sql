-- Eliminar la columna courseId duplicada
ALTER TABLE students DROP COLUMN IF EXISTS "courseId";

-- Verificar la estructura
\d students;