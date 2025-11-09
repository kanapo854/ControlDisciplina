const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
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

// @desc    Obtener estadísticas de usuarios para dashboard
// @route   GET /api/users/stats
// @access  Private (adminusuarios)
router.get('/stats', requirePermission(PERMISSIONS.READ_USER), async (req, res, next) => {
  try {
    // Contar usuarios por rol
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    // Contar usuarios activos vs inactivos
    const usersByStatus = await User.findAll({
      attributes: [
        'isActive',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['isActive'],
      raw: true
    });

    // Usuarios creados en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Total de usuarios
    const totalUsers = await User.count();

    // Usuarios activos
    const activeUsers = await User.count({
      where: { isActive: true }
    });

    // Últimos usuarios creados
    const latestUsers = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          recentUsers
        },
        charts: {
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item.role] = parseInt(item.count);
            return acc;
          }, {}),
          usersByStatus: usersByStatus.reduce((acc, item) => {
            acc[item.isActive ? 'active' : 'inactive'] = parseInt(item.count);
            return acc;
          }, {})
        },
        latestUsers
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
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 12 })
    .withMessage('La contraseña debe tener al menos 12 caracteres')
    .custom((value) => {
      // Validar que tenga al menos una mayúscula, un número y un símbolo
      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      
      if (!hasUpperCase || !hasNumber || !hasSymbol) {
        throw new Error('La contraseña debe contener al menos una mayúscula, un número y un símbolo');
      }
      
      return true;
    }),
  body('role')
    .optional()
    .isIn(['adminusuarios', 'profesor', 'padrefamilia', 'adminestudiantes', 'adminprofesores'])
    .withMessage('Rol inválido'),
  body('carnet')
    .optional()
    .isLength({ max: 20 })
    .withMessage('El carnet no puede exceder 20 caracteres'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede exceder 20 caracteres')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        details: errors.array()
      });
    }

    const { name, email, password, role, carnet, phone } = req.body;

    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si el email ya existe (si se está cambiando)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso'
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (carnet !== undefined) updateData.carnet = carnet;
    if (phone !== undefined) updateData.phone = phone;
    
    // Solo actualizar password si se proporciona
    if (password) {
      updateData.password = password;
    }

    await user.update(updateData);

    // Recargar el usuario sin password
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado exitosamente'
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