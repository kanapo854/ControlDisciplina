const { hasPermission, hasPermissionAnyRole } = require('../config/roles');

/**
 * Middleware para verificar permisos específicos
 * @param {string|array} requiredPermissions - Permiso(s) requerido(s)
 * @returns {function} Middleware function
 */
const requirePermission = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const hasRequiredPermission = permissions.some(permission => 
        hasPermission(user.role, permission)
      );

      if (!hasRequiredPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción',
          requiredPermissions: permissions,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para verificar roles específicos
 * @param {string|array} allowedRoles - Rol(es) permitido(s)
 * @returns {function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes el rol necesario para acceder a este recurso',
          allowedRoles: roles,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario está activo
 * @returns {function} Middleware function
 */
const requireActiveUser = () => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Tu cuenta está inactiva. Contacta al administrador.'
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de usuario activo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
  requireActiveUser
};