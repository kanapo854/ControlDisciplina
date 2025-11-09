/**
 * Configuración de roles y permisos para el frontend
 */

export const ROLES = {
  ADMIN_USUARIOS: 'adminusuarios',
  PROFESOR: 'profesor', 
  PADRE_FAMILIA: 'padrefamilia',
  ADMIN_ESTUDIANTES: 'adminestudiantes',
  ADMIN_PROFESORES: 'adminprofesores'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN_USUARIOS]: 'Administrador de Usuarios',
  [ROLES.PROFESOR]: 'Profesor',
  [ROLES.PADRE_FAMILIA]: 'Padre de Familia',
  [ROLES.ADMIN_ESTUDIANTES]: 'Administrador de Estudiantes',
  [ROLES.ADMIN_PROFESORES]: 'Administrador de Profesores'
};

export const PERMISSIONS = {
  // Gestión de usuarios
  MANAGE_USERS: 'manage_users',
  
  // Gestión de estudiantes
  MANAGE_STUDENTS: 'manage_students',
  VIEW_STUDENTS: 'view_students',
  
  // Gestión de profesores
  MANAGE_TEACHERS: 'manage_teachers',
  VIEW_TEACHERS: 'view_teachers',
  
  // Gestión de incidentes
  MANAGE_INCIDENTS: 'manage_incidents',
  VIEW_INCIDENTS: 'view_incidents',
  VIEW_OWN_CHILDREN_INCIDENTS: 'view_own_children_incidents'
};

// Definir qué permisos tiene cada rol en el frontend
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN_USUARIOS]: [
    PERMISSIONS.MANAGE_USERS,
  ],
  
  [ROLES.PROFESOR]: [
    PERMISSIONS.MANAGE_INCIDENTS,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.VIEW_STUDENTS
  ],
  
  [ROLES.PADRE_FAMILIA]: [
    PERMISSIONS.VIEW_OWN_CHILDREN_INCIDENTS
  ],
  
  [ROLES.ADMIN_ESTUDIANTES]: [
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VIEW_STUDENTS
  ],
  
  [ROLES.ADMIN_PROFESORES]: [
    PERMISSIONS.MANAGE_TEACHERS,
    PERMISSIONS.VIEW_TEACHERS
  ]
};

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {object} user - El objeto usuario
 * @param {string} permission - El permiso a verificar
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role];
  return rolePermissions ? rolePermissions.includes(permission) : false;
};

/**
 * Obtener todos los permisos de un usuario
 * @param {object} user - El objeto usuario
 * @returns {array}
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];
  return ROLE_PERMISSIONS[user.role] || [];
};

/**
 * Verificar si un usuario tiene uno de varios roles
 * @param {object} user - El objeto usuario
 * @param {array} allowedRoles - Array de roles permitidos
 * @returns {boolean}
 */
export const hasRole = (user, allowedRoles) => {
  if (!user || !user.role) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
};

/**
 * Obtener el label legible de un rol
 * @param {string} role - El rol
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role;
};

/**
 * Obtener las rutas que puede acceder cada rol
 * @param {string} role - El rol del usuario
 * @returns {array} Array de rutas permitidas
 */
export const getAllowedRoutes = (role) => {
  const routes = {
    [ROLES.ADMIN_USUARIOS]: [
      '/dashboard',
      '/usuarios',
      '/usuarios/crear',
      '/usuarios/editar/:id',
      '/perfil'
    ],
    
    [ROLES.PROFESOR]: [
      '/dashboard',
      '/incidentes',
      '/incidentes/crear',
      '/incidentes/editar/:id',
      '/estudiantes',
      '/perfil'
    ],
    
    [ROLES.PADRE_FAMILIA]: [
      '/dashboard',
      '/mis-hijos',
      '/incidentes-hijos',
      '/perfil'
    ],
    
    [ROLES.ADMIN_ESTUDIANTES]: [
      '/dashboard',
      '/estudiantes',
      '/estudiantes/crear',
      '/estudiantes/editar/:id',
      '/perfil'
    ],
    
    [ROLES.ADMIN_PROFESORES]: [
      '/dashboard',
      '/profesores',
      '/profesores/crear',
      '/profesores/editar/:id',
      '/perfil'
    ]
  };
  
  return routes[role] || ['/dashboard', '/perfil'];
};