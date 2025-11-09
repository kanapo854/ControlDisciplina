const express = require('express');
const { body } = require('express-validator');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  activateStudent,
  searchByDocument
} = require('../controllers/studentController');
const { auth, authorize } = require('../middleware/auth');

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
  body('grade')
    .notEmpty()
    .withMessage('El grado es requerido'),
  body('section')
    .notEmpty()
    .withMessage('La sección es requerida'),
  body('birthDate')
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),
  body('gender')
    .isIn(['masculino', 'femenino', 'otro'])
    .withMessage('Género inválido'),
  body('parentName')
    .notEmpty()
    .withMessage('El nombre del padre/madre/acudiente es requerido'),
  body('parentPhone')
    .notEmpty()
    .withMessage('El teléfono del padre/madre/acudiente es requerido'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido'),
  body('parentEmail')
    .optional()
    .isEmail()
    .withMessage('Email del padre/madre/acudiente inválido')
];

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas
router.get('/', getStudents);
router.get('/search/:documentNumber', searchByDocument);
router.get('/:id', getStudent);
router.post('/', authorize('admin', 'coordinador', 'profesor'), studentValidation, createStudent);
router.put('/:id', authorize('admin', 'coordinador', 'profesor'), studentValidation, updateStudent);
router.delete('/:id', authorize('admin', 'coordinador'), deleteStudent);
router.put('/:id/activate', authorize('admin', 'coordinador'), activateStudent);

module.exports = router;