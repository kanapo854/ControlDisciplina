const express = require('express');
const { body } = require('express-validator');
const {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  addSanction,
  addFollowUp,
  updateStatus,
  deleteIncident
} = require('../controllers/incidentController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validaciones para incidente
const incidentValidation = [
  body('student')
    .notEmpty()
    .withMessage('El estudiante es requerido')
    .isMongoId()
    .withMessage('ID de estudiante inválido'),
  body('title')
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres'),
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('type')
    .isIn([
      'leve', 'grave', 'muy_grave', 'agresion', 'bullying',
      'vandalismo', 'inasistencia', 'tardanza', 'uniforme',
      'conducta', 'academico', 'otro'
    ])
    .withMessage('Tipo de incidente inválido'),
  body('severity')
    .isIn(['baja', 'media', 'alta', 'critica'])
    .withMessage('Severidad inválida'),
  body('location')
    .notEmpty()
    .withMessage('El lugar es requerido'),
  body('dateOccurred')
    .isISO8601()
    .withMessage('Fecha de ocurrencia inválida'),
  body('timeOccurred')
    .notEmpty()
    .withMessage('La hora es requerida')
];

const sanctionValidation = [
  body('type')
    .isIn([
      'amonestacion_verbal', 'amonestacion_escrita', 'trabajo_comunitario',
      'suspension_1_dia', 'suspension_2_dias', 'suspension_3_dias',
      'suspension_temporal', 'remision_coordinacion', 'citacion_padres',
      'compromiso_disciplinario', 'matricula_condicional',
      'cancelacion_matricula', 'otro'
    ])
    .withMessage('Tipo de sanción inválido'),
  body('description')
    .notEmpty()
    .withMessage('La descripción de la sanción es requerida'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
];

const followUpValidation = [
  body('description')
    .notEmpty()
    .withMessage('La descripción del seguimiento es requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres')
];

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas principales
router.get('/', getIncidents);
router.get('/:id', getIncident);
router.post('/', incidentValidation, createIncident);
router.put('/:id', incidentValidation, updateIncident);
router.delete('/:id', authorize('admin', 'coordinador'), deleteIncident);

// Rutas para sanciones
router.post('/:id/sanctions', authorize('admin', 'coordinador'), sanctionValidation, addSanction);

// Rutas para seguimiento
router.post('/:id/follow-up', followUpValidation, addFollowUp);

// Ruta para cambiar estado
router.put('/:id/status', updateStatus);

module.exports = router;