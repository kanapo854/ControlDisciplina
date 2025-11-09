-- Migración: Sistema de roles y permisos dinámicos
-- Fecha: 2025-01-09
-- Descripción: Crea tablas para gestión dinámica de roles y permisos

BEGIN;

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system_role BOOLEAN DEFAULT false,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla intermedia roles-permisos
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

-- Insertar roles del sistema (migración de roles actuales)
INSERT INTO roles (name, code, description, is_system_role, color) VALUES
  ('Administrador de Usuarios', 'adminusuarios', 'Gestiona usuarios y permisos del sistema', true, '#8B5CF6'),
  ('Profesor', 'profesor', 'Crea y gestiona incidentes de estudiantes', true, '#3B82F6'),
  ('Padre de Familia', 'padrefamilia', 'Visualiza incidentes de sus hijos', true, '#10B981'),
  ('Administrador de Estudiantes', 'adminestudiantes', 'Gestiona estudiantes, cursos y matrículas', true, '#F59E0B'),
  ('Administrador de Profesores', 'adminprofesores', 'Gestiona profesores del sistema', true, '#EF4444')
ON CONFLICT (code) DO NOTHING;

-- Insertar permisos del sistema
INSERT INTO permissions (name, code, description, category) VALUES
  -- Usuarios
  ('Crear Usuario', 'create_user', 'Permite crear nuevos usuarios', 'Usuarios'),
  ('Leer Usuario', 'read_user', 'Permite ver información de usuarios', 'Usuarios'),
  ('Actualizar Usuario', 'update_user', 'Permite modificar usuarios existentes', 'Usuarios'),
  ('Eliminar Usuario', 'delete_user', 'Permite eliminar usuarios', 'Usuarios'),
  ('Activar Usuario', 'activate_user', 'Permite activar/desactivar usuarios', 'Usuarios'),
  
  -- Estudiantes
  ('Crear Estudiante', 'create_student', 'Permite crear nuevos estudiantes', 'Estudiantes'),
  ('Leer Estudiante', 'read_student', 'Permite ver información de estudiantes', 'Estudiantes'),
  ('Actualizar Estudiante', 'update_student', 'Permite modificar estudiantes', 'Estudiantes'),
  ('Eliminar Estudiante', 'delete_student', 'Permite eliminar estudiantes', 'Estudiantes'),
  ('Gestionar Estudiantes', 'manage_students', 'Gestión completa de estudiantes', 'Estudiantes'),
  ('Gestionar Vínculos Familiares', 'manage_family_links', 'Gestiona relaciones padre-hijo', 'Estudiantes'),
  
  -- Profesores
  ('Crear Profesor', 'create_teacher', 'Permite crear nuevos profesores', 'Profesores'),
  ('Leer Profesor', 'read_teacher', 'Permite ver información de profesores', 'Profesores'),
  ('Actualizar Profesor', 'update_teacher', 'Permite modificar profesores', 'Profesores'),
  ('Eliminar Profesor', 'delete_teacher', 'Permite eliminar profesores', 'Profesores'),
  
  -- Incidentes
  ('Crear Incidente', 'create_incident', 'Permite crear nuevos incidentes', 'Incidentes'),
  ('Leer Incidente', 'read_incident', 'Permite ver incidentes', 'Incidentes'),
  ('Actualizar Incidente', 'update_incident', 'Permite modificar incidentes', 'Incidentes'),
  ('Eliminar Incidente', 'delete_incident', 'Permite eliminar incidentes', 'Incidentes'),
  ('Leer Incidentes Propios Hijos', 'read_own_children_incidents', 'Ver incidentes de hijos propios', 'Incidentes'),
  
  -- Cursos
  ('Leer Cursos', 'read_courses', 'Permite ver información de cursos', 'Cursos')
ON CONFLICT (code) DO NOTHING;

-- Asignar permisos a roles del sistema

-- Admin Usuarios
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'adminusuarios'
AND p.code IN (
  'create_user', 'read_user', 'update_user', 'delete_user', 'activate_user',
  'read_student', 'manage_family_links', 'read_courses'
)
ON CONFLICT DO NOTHING;

-- Profesor
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'profesor'
AND p.code IN (
  'create_incident', 'read_incident', 'update_incident',
  'read_student', 'read_courses'
)
ON CONFLICT DO NOTHING;

-- Padre de Familia
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'padrefamilia'
AND p.code IN (
  'read_own_children_incidents', 'read_student'
)
ON CONFLICT DO NOTHING;

-- Admin Estudiantes
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'adminestudiantes'
AND p.code IN (
  'create_student', 'read_student', 'update_student', 'delete_student',
  'manage_students', 'read_courses'
)
ON CONFLICT DO NOTHING;

-- Admin Profesores
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'adminprofesores'
AND p.code IN (
  'create_teacher', 'read_teacher', 'update_teacher', 'delete_teacher'
)
ON CONFLICT DO NOTHING;

COMMIT;

-- Verificar que todo se creó correctamente
SELECT 'Roles creados:' as tipo, COUNT(*) as total FROM roles
UNION ALL
SELECT 'Permisos creados:', COUNT(*) FROM permissions
UNION ALL
SELECT 'Asignaciones creadas:', COUNT(*) FROM role_permissions;
