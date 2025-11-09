-- PARTE 2: Actualizar los roles de usuarios existentes
-- Ejecutar DESPUÉS de haber ejecutado la PARTE 1 exitosamente

-- Paso 1: Ver el estado actual antes de la migración
SELECT id, name, email, role, is_active FROM users;

-- Paso 2: Actualizar usuarios con rol 'admin' a 'adminusuarios'
UPDATE users SET role = 'adminusuarios'::enum_users_role 
WHERE role::text = 'admin';

-- Mostrar cuántos usuarios se actualizaron
SELECT 'admin -> adminusuarios' as migracion, COUNT(*) as usuarios_actualizados
FROM users WHERE role = 'adminusuarios';

-- Paso 3: Actualizar usuarios con rol 'coordinador' a 'adminusuarios'
UPDATE users SET role = 'adminusuarios'::enum_users_role 
WHERE role::text = 'coordinador';

-- Paso 4: Actualizar usuarios con rol 'estudiante' a 'padrefamilia'
UPDATE users SET role = 'padrefamilia'::enum_users_role 
WHERE role::text = 'estudiante';

-- Mostrar cuántos usuarios se actualizaron
SELECT 'estudiante -> padrefamilia' as migracion, COUNT(*) as usuarios_actualizados
FROM users WHERE role = 'padrefamilia';

-- Paso 5: Verificar que la migración fue exitosa
SELECT 
    role,
    COUNT(*) as cantidad_usuarios,
    string_agg(name, ', ') as nombres_usuarios
FROM users 
GROUP BY role
ORDER BY role;

-- Paso 6: Ver todos los usuarios después de la migración
SELECT id, name, email, role, is_active FROM users ORDER BY role, name;

-- Paso 7: Confirmar que todos los valores del enum están disponibles
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
) ORDER BY enumsortorder;