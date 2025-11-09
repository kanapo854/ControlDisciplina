/**
 * Configuración de roles y permisos del sistema
 */

const ROLES = {
  ADMIN_USUARIOS: 'adminusuarios',
  PROFESOR: 'profesor', 
  PADRE_FAMILIA: 'padrefamilia',
  ADMIN_ESTUDIANTES: 'adminestudiantes',
  ADMIN_PROFESORES: 'adminprofesores'
};

const PERMISSIONS = {
  // Gestión de usuarios
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  ACTIVATE_USER: 'activate_user',
  
  // Gestión de estudiantes
  CREATE_STUDENT: 'create_student',
  READ_STUDENT: 'read_student',
  UPDATE_STUDENT: 'update_student',
  DELETE_STUDENT: 'delete_student',
  MANAGE_STUDENTS: 'manage_students', // Permiso general para gestionar estudiantes
  MANAGE_FAMILY_LINKS: 'manage_family_links', // Permiso específico para gestionar relaciones familiares
  READ_COURSES: 'read_courses', // Permiso para ver cursos (solo lectura)
  
  // Gestión de profesores
  CREATE_TEACHER: 'create_teacher',
  READ_TEACHER: 'read_teacher',
  UPDATE_TEACHER: 'update_teacher',
  DELETE_TEACHER: 'delete_teacher',
  
  // Gestión de incidentes
  CREATE_INCIDENT: 'create_incident',
  READ_INCIDENT: 'read_incident',
  UPDATE_INCIDENT: 'update_incident',
  DELETE_INCIDENT: 'delete_incident',
  READ_OWN_CHILDREN_INCIDENTS: 'read_own_children_incidents'
};

// Definir qué permisos tiene cada rol
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN_USUARIOS]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.ACTIVATE_USER,
    PERMISSIONS.READ_STUDENT, // Los admin usuarios necesitan ver estudiantes para vinculaciones familiares
    PERMISSIONS.MANAGE_FAMILY_LINKS, // Los admin usuarios gestionan solo las relaciones familiares
    PERMISSIONS.READ_COURSES // Los admin usuarios necesitan ver cursos para vinculaciones
  ],
  
  [ROLES.PROFESOR]: [
    PERMISSIONS.CREATE_INCIDENT,
    PERMISSIONS.READ_INCIDENT,
    PERMISSIONS.UPDATE_INCIDENT,
    PERMISSIONS.READ_STUDENT,
    PERMISSIONS.READ_COURSES // Los profesores pueden ver cursos
  ],
  
  [ROLES.PADRE_FAMILIA]: [
    PERMISSIONS.READ_OWN_CHILDREN_INCIDENTS,
    PERMISSIONS.READ_STUDENT // Solo sus hijos
  ],
  
  [ROLES.ADMIN_ESTUDIANTES]: [
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.READ_STUDENT,
    PERMISSIONS.UPDATE_STUDENT,
    PERMISSIONS.DELETE_STUDENT,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.READ_COURSES // Los admin estudiantes pueden ver cursos
  ],
  
  [ROLES.ADMIN_PROFESORES]: [
    PERMISSIONS.CREATE_TEACHER,
    PERMISSIONS.READ_TEACHER,
    PERMISSIONS.UPDATE_TEACHER,
    PERMISSIONS.DELETE_TEACHER
  ]
};

/**
 * Verificar si un rol tiene un permiso específico
 * @param {string} role - El rol del usuario
 * @param {string} permission - El permiso a verificar
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions ? rolePermissions.includes(permission) : false;
};

/**
 * Obtener todos los permisos de un rol
 * @param {string} role - El rol del usuario
 * @returns {array}
 */
const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Verificar si múltiples roles tienen un permiso
 * @param {array} roles - Array de roles
 * @param {string} permission - El permiso a verificar
 * @returns {boolean}
 */
const hasPermissionAnyRole = (roles, permission) => {
  return roles.some(role => hasPermission(role, permission));
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  hasPermissionAnyRole
};