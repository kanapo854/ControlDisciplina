const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const { PERMISSIONS } = require('../config/roles');
const {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  assignPermissions,
  addPermission,
  removePermission,
  getUnusedRoles,
  getRoleStats
} = require('../controllers/roleController');

// Proteger todas las rutas
router.use(auth);

// Rutas especiales (antes de las rutas con :id)
router.get('/unused', requirePermission(PERMISSIONS.UPDATE_USER), getUnusedRoles);
router.get('/stats', requirePermission(PERMISSIONS.UPDATE_USER), getRoleStats);

// CRUD básico de roles
router.get('/', requirePermission(PERMISSIONS.UPDATE_USER), getRoles);
router.get('/:id', requirePermission(PERMISSIONS.UPDATE_USER), getRole);

router.post('/', requirePermission(PERMISSIONS.UPDATE_USER), [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('code')
    .notEmpty().withMessage('El código es requerido')
    .isLowercase().withMessage('El código debe estar en minúsculas')
    .matches(/^[a-z_]+$/).withMessage('El código solo puede contener letras minúsculas y guiones bajos'),
  body('description').optional(),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('El color debe ser un código hexadecimal válido'),
  body('permissionIds').optional().isArray().withMessage('Los permisos deben ser un array')
], createRole);

router.put('/:id', requirePermission(PERMISSIONS.UPDATE_USER), [
  body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('description').optional(),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('El color debe ser un código hexadecimal válido'),
  body('isActive').optional().isBoolean().withMessage('isActive debe ser booleano')
], updateRole);

router.delete('/:id', requirePermission(PERMISSIONS.UPDATE_USER), deleteRole);

// Gestión de permisos del rol
router.get('/:id/permissions', requirePermission(PERMISSIONS.UPDATE_USER), getRolePermissions);
router.post('/:id/permissions', requirePermission(PERMISSIONS.UPDATE_USER), [
  body('permissionIds')
    .isArray({ min: 1 }).withMessage('Debes proporcionar al menos un permiso')
], assignPermissions);
router.post('/:id/permissions/:permissionId', requirePermission(PERMISSIONS.UPDATE_USER), addPermission);
router.delete('/:id/permissions/:permissionId', requirePermission(PERMISSIONS.UPDATE_USER), removePermission);

module.exports = router;
