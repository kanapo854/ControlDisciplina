const express = require('express');
const { body } = require('express-validator');
const { Op } = require('sequelize');
const { auth, authorize } = require('../middleware/auth');
const { requirePermission, requireRole, requireActiveUser } = require('../middleware/authorization');
const { PERMISSIONS, ROLES } = require('../config/roles');
const User = require('../models/User');

const router = express.Router();

// Todas las rutas requieren autenticación y usuario activo
router.use(auth);
router.use(requireActiveUser());

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private (adminusuarios)
router.get('/', requirePermission(PERMISSIONS.READ_USER), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (req.query.role) whereClause.role = req.query.role;
    if (req.query.isActive !== undefined) whereClause.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']],
      offset,
      limit
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Obtener usuario por ID
// @route   GET /api/users/:id
// @access  Private (adminusuarios)
router.get('/:id', requirePermission(PERMISSIONS.READ_USER), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Crear nuevo usuario
// @route   POST /api/users
// @access  Private (adminusuarios)
router.post('/', requirePermission(PERMISSIONS.CREATE_USER), [
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 12 })
    .withMessage('La contraseña debe tener al menos 12 caracteres')
    .custom((value) => {
      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      
      if (!hasUpperCase) {
        throw new Error('La contraseña debe contener al menos una letra mayúscula');
      }
      if (!hasNumbers) {
        throw new Error('La contraseña debe contener al menos un número');
      }
      if (!hasSymbols) {
        throw new Error('La contraseña debe contener al menos un símbolo (!@#$%^&*(),.?":{}|<>)');
      }
      return true;
    }),
  body('role')
    .isIn(['adminusuarios', 'profesor', 'padrefamilia', 'adminestudiantes', 'adminprofesores'])
    .withMessage('Rol inválido'),
  body('carnet')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('El carnet debe tener entre 3 y 20 caracteres'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Número de teléfono inválido')
], async (req, res, next) => {
  try {
    const { name, email, password, role, carnet, phone } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con ese email'
      });
    }

    // Verificar si el carnet ya existe (si se proporciona)
    if (carnet) {
      const existingCarnet = await User.findOne({ where: { carnet } });
      if (existingCarnet) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un usuario con ese carnet'
        });
      }
    }

    // Crear el usuario
    const user = await User.create({
      name,
      email,
      password,
      role,
      carnet,
      phone,
      isActive: true
    });

    // Devolver usuario sin password
    const userData = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({
      success: true,
      data: userData,
      message: 'Usuario creado exitosamente'
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private (adminusuarios)
router.put('/:id', requirePermission(PERMISSIONS.UPDATE_USER), [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido'),
  body('role')
    .optional()
    .isIn(['adminusuarios', 'profesor', 'padrefamilia', 'adminestudiantes', 'adminprofesores'])
    .withMessage('Rol inválido')
], async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    await user.update(req.body);

    // Recargar el usuario sin password
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Activar/Desactivar usuario
// @route   PUT /api/users/:id/status
// @access  Private (adminusuarios)
router.put('/:id/status', requirePermission(PERMISSIONS.ACTIVATE_USER), async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    await user.update({ isActive });

    // Recargar el usuario sin password
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;