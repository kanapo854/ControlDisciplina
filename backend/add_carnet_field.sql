-- Migración para agregar campo carnet a la tabla users

-- Agregar la columna carnet
ALTER TABLE users ADD COLUMN carnet VARCHAR(20);

-- Agregar índice único para el carnet (permitiendo valores NULL)
CREATE UNIQUE INDEX users_carnet_unique 
ON users (carnet) 
WHERE carnet IS NOT NULL;

-- Verificar la nueva estructura
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;