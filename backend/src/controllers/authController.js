const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { User, PasswordHistory } = require('../models');
const { generateEmailOTP, verifyEmailOTP, clearOTP } = require('../services/mfaService');
const { sendMFACode, sendPasswordExpiredNotification } = require('../services/emailService');

// Generar JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d', // Reducido de 30 a 7 días
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
    const token = generateToken(user.id);

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

    // Verificar si la cuenta está bloqueada
    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      const minutesRemaining = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutesRemaining} minutos`,
        lockedUntil: user.accountLockedUntil
      });
    }

    // Si el bloqueo ya expiró, desbloqueamos y reseteamos contador
    if (user.accountLockedUntil && new Date() >= user.accountLockedUntil) {
      user.accountLockedUntil = null;
      user.failedLoginAttempts = 0;
      await user.save();
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
      // Incrementar intentos fallidos
      user.failedLoginAttempts += 1;
      
      const MAX_ATTEMPTS = 3;
      const LOCKOUT_DURATION_MINUTES = 15;
      
      // Si alcanzó el máximo de intentos, bloquear cuenta
      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        user.accountLockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
        await user.save();
        
        return res.status(423).json({
          success: false,
          error: `Cuenta bloqueada por ${LOCKOUT_DURATION_MINUTES} minutos debido a múltiples intentos fallidos`,
          lockedUntil: user.accountLockedUntil
        });
      }
      
      await user.save();
      
      const remainingAttempts = MAX_ATTEMPTS - user.failedLoginAttempts;
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        remainingAttempts: remainingAttempts
      });
    }

    // Login exitoso - resetear contador de intentos fallidos
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastLogin = new Date();
    
    // Check password expiration (90 days)
    const PASSWORD_EXPIRY_DAYS = 90;
    const daysSinceChange = user.lastPasswordChange 
      ? Math.floor((Date.now() - new Date(user.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24))
      : PASSWORD_EXPIRY_DAYS + 1;
    
    if (daysSinceChange >= PASSWORD_EXPIRY_DAYS) {
      user.passwordExpired = true;
      await user.save();
      
      return res.status(403).json({
        success: false,
        error: 'Tu contraseña ha expirado. Debes cambiarla para continuar.',
        passwordExpired: true,
        userId: user.id
      });
    }
    
    await user.save();

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      // Generate and send OTP code
      const otpCode = generateEmailOTP(user.id);
      await sendMFACode(user.email, otpCode, user.name);
      
      return res.json({
        success: true,
        mfaRequired: true,
        userId: user.id,
        message: 'Se ha enviado un código de verificación a tu email'
      });
    }

    // Generar token
    const token = generateToken(user.id);

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
      data: user.getPublicData()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verificar código MFA
// @route   POST /api/auth/verify-mfa
// @access  Public
const verifyMFA = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId, code } = req.body;

    // Verificar el código OTP
    const isValid = verifyEmailOTP(userId, code);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Código inválido o expirado'
      });
    }

    // Código válido - generar token
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: user.getPublicData()
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reenviar código MFA
// @route   POST /api/auth/resend-mfa
// @access  Public
const resendMFA = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Generar y enviar nuevo código
    const otpCode = generateEmailOTP(user.id);
    await sendMFACode(user.email, otpCode, user.name);

    res.json({
      success: true,
      message: 'Código reenviado a tu email'
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

    // Verificar contraseña actual (si no es cambio forzado por expiración)
    if (currentPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Contraseña actual incorrecta'
        });
      }
    }

    // Verificar que no sea una de las últimas 5 contraseñas
    const passwordHistories = await PasswordHistory.findAll({
      where: { userId: user.id },
      order: [['changedAt', 'DESC']],
      limit: 5
    });

    for (const history of passwordHistories) {
      const isSame = await bcrypt.compare(newPassword, history.passwordHash);
      if (isSame) {
        return res.status(400).json({
          success: false,
          error: 'No puedes reutilizar una de tus últimas 5 contraseñas'
        });
      }
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

// @desc    Habilitar/deshabilitar MFA
// @route   PUT /api/auth/mfa-settings
// @access  Private
const updateMFASettings = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const user = await User.findByPk(req.user.id);

    await user.update({ mfaEnabled: enabled });

    res.json({
      success: true,
      message: `MFA ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
      mfaEnabled: enabled
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Cambiar contraseña expirada
// @route   POST /api/auth/reset-expired-password
// @access  Public (but requires userId)
const resetExpiredPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (!user.passwordExpired) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña no ha expirado'
      });
    }

    // Verificar que no sea una de las últimas 5 contraseñas
    const passwordHistories = await PasswordHistory.findAll({
      where: { userId: user.id },
      order: [['changedAt', 'DESC']],
      limit: 5
    });

    for (const history of passwordHistories) {
      const isSame = await bcrypt.compare(newPassword, history.passwordHash);
      if (isSame) {
        return res.status(400).json({
          success: false,
          error: 'No puedes reutilizar una de tus últimas 5 contraseñas'
        });
      }
    }

    // Actualizar contraseña y marcar como no expirada
    await user.update({ 
      password: newPassword,
      passwordExpired: false
    });

    // Generar token
    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: user.getPublicData(),
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyMFA,
  resendMFA,
  getMe,
  changePassword,
  updateProfile,
  updateMFASettings,
  resetExpiredPassword
};