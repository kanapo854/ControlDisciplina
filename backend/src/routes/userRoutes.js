const express = require('express');
const { body } = require('express-validator');
const { Op } = require('sequelize');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private (admin, coordinador)
router.get('/', authorize('admin', 'coordinador'), async (req, res, next) => {
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
// @access  Private (admin, coordinador)
router.get('/:id', authorize('admin', 'coordinador'), async (req, res, next) => {
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

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private (admin)
router.put('/:id', authorize('admin'), [
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
    .isIn(['admin', 'coordinador', 'profesor', 'estudiante'])
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
// @access  Private (admin)
router.put('/:id/status', authorize('admin'), async (req, res, next) => {
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