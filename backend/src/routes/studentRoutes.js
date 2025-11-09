const express = require('express');
const { body } = require('express-validator');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  activateStudent,
  searchByDocument,
  getStudentStats,
  linkParentToStudent,
  unlinkParentFromStudent,
  getMyChildren
} = require('../controllers/studentController');
const { auth, authorize } = require('../middleware/auth');
const { requirePermission, requireActiveUser } = require('../middleware/authorization');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Validaciones para estudiante
const studentValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('documentNumber')
    .notEmpty()
    .withMessage('El número de documento es requerido'),
  body('documentType')
    .optional()
    .isIn(['cedula', 'tarjeta_identidad', 'pasaporte'])
    .withMessage('Tipo de documento inválido'),
  body('courseId')
    .notEmpty()
    .withMessage('El curso es requerido')
    .isUUID()
    .withMessage('ID de curso inválido'),
  body('birthDate')
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),
  body('gender')
    .isIn(['masculino', 'femenino', 'otro'])
    .withMessage('Género inválido'),
  body('parentName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del padre/madre/acudiente debe tener entre 2 y 100 caracteres'),
  body('parentPhone')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El teléfono del padre/madre/acudiente debe tener entre 8 y 20 caracteres'),
  body('parentEmail')
    .optional()
    .isEmail()
    .withMessage('Email del padre/madre/acudiente inválido'),
  body('emergencyContactName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de contacto de emergencia debe tener entre 2 y 100 caracteres'),
  body('emergencyContactPhone')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El teléfono de contacto de emergencia debe tener entre 8 y 20 caracteres'),
  body('medicalInfo')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La información médica no puede exceder 1000 caracteres'),
  body('additionalNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas adicionales no pueden exceder 1000 caracteres')
];

// Todas las rutas requieren autenticación
router.use(auth);
router.use(requireActiveUser());

// Rutas básicas
router.get('/stats', requirePermission(PERMISSIONS.READ_STUDENT), getStudentStats);
router.get('/', requirePermission(PERMISSIONS.READ_STUDENT), getStudents);
router.get('/search/:documentNumber', requirePermission(PERMISSIONS.READ_STUDENT), searchByDocument);

// Ruta especial para padres de familia
router.get('/my-children', getMyChildren);

// Rutas de gestión de vinculación padre-estudiante (solo admin usuarios con permiso específico)
router.put('/:id/link-parent', requirePermission(PERMISSIONS.MANAGE_FAMILY_LINKS), [
  body('parentUserId')
    .notEmpty()
    .withMessage('El ID del padre es requerido')
    .isUUID()
    .withMessage('El ID del padre debe ser un UUID válido')
], linkParentToStudent);

router.delete('/:id/unlink-parent', requirePermission(PERMISSIONS.MANAGE_FAMILY_LINKS), unlinkParentFromStudent);

// Rutas CRUD normales
router.get('/:id', auth, requirePermission(PERMISSIONS.READ_STUDENT), getStudent);
router.post('/', auth, requirePermission(PERMISSIONS.CREATE_STUDENT), studentValidation, createStudent);
router.put('/:id', auth, requirePermission(PERMISSIONS.UPDATE_STUDENT), studentValidation, updateStudent);
router.delete('/:id', auth, requirePermission(PERMISSIONS.DELETE_STUDENT), deleteStudent);
router.put('/:id/activate', auth, requirePermission(PERMISSIONS.UPDATE_STUDENT), activateStudent);

module.exports = router;