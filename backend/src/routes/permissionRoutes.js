const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const { PERMISSIONS } = require('../config/roles');
const {
  getPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  getCategories
} = require('../controllers/permissionController');

// Proteger todas las rutas
router.use(auth);

// Rutas especiales
router.get('/categories', requirePermission(PERMISSIONS.UPDATE_USER), getCategories);

// CRUD de permisos
router.get('/', requirePermission(PERMISSIONS.UPDATE_USER), getPermissions);
router.get('/:id', requirePermission(PERMISSIONS.UPDATE_USER), getPermission);

router.post('/', requirePermission(PERMISSIONS.UPDATE_USER), [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('code')
    .notEmpty().withMessage('El código es requerido')
    .isLowercase().withMessage('El código debe estar en minúsculas')
    .matches(/^[a-z_]+$/).withMessage('El código solo puede contener letras minúsculas y guiones bajos'),
  body('description').optional(),
  body('category').optional().notEmpty().withMessage('La categoría no puede estar vacía')
], createPermission);

router.put('/:id', requirePermission(PERMISSIONS.UPDATE_USER), [
  body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('description').optional(),
  body('category').optional(),
  body('isActive').optional().isBoolean().withMessage('isActive debe ser booleano')
], updatePermission);

router.delete('/:id', requirePermission(PERMISSIONS.UPDATE_USER), deletePermission);

module.exports = router;
