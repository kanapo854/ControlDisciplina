const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public (solo admins pueden crear usuarios)
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, role, phone } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con ese email'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone
    });

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.getPublicData()
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada. Contacta al administrador'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.getPublicData()
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    res.json({
      success: true,
      user: user.getPublicData()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar perfil
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    await user.update({ name, phone });

    res.json({
      success: true,
      user: user.getPublicData()
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  updateProfile
};