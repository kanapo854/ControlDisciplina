const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  changePassword,
  updateProfile
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
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
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

// Rutas privadas
router.get('/me', auth, getMe);
router.put('/change-password', auth, changePasswordValidation, changePassword);
router.put('/profile', auth, updateProfileValidation, updateProfile);

module.exports = router;