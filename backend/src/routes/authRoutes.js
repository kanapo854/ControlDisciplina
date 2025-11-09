const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  verifyMFA,
  resendMFA,
  getMe,
  changePassword,
  updateProfile,
  updateMFASettings,
  resetExpiredPassword
} = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validaciones
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'coordinador', 'profesor', 'estudiante'])
    .withMessage('Rol inválido')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

const changePasswordValidation = [
  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 12 })
    .withMessage('La nueva contraseña debe tener al menos 12 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('La contraseña debe contener al menos un símbolo')
];

const verifyMFAValidation = [
  body('userId')
    .notEmpty()
    .withMessage('El ID de usuario es requerido'),
  body('code')
    .notEmpty()
    .withMessage('El código es requerido')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener 6 dígitos')
];

const resetExpiredPasswordValidation = [
  body('userId')
    .notEmpty()
    .withMessage('El ID de usuario es requerido'),
  body('newPassword')
    .isLength({ min: 12 })
    .withMessage('La nueva contraseña debe tener al menos 12 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('La contraseña debe contener al menos un símbolo')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('phone')
    .optional()
    .trim()
];

// Rutas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/verify-mfa', verifyMFAValidation, verifyMFA);
router.post('/resend-mfa', resendMFA);
router.post('/reset-expired-password', resetExpiredPasswordValidation, resetExpiredPassword);

// Rutas privadas
router.get('/me', auth, getMe);
router.put('/change-password', auth, changePasswordValidation, changePassword);
router.put('/profile', auth, updateProfileValidation, updateProfile);
router.put('/mfa-settings', auth, updateMFASettings);

module.exports = router;