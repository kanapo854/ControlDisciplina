const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { auth } = require('../middleware/auth');
const { requirePermission, requireActiveUser } = require('../middleware/authorization');
const { PERMISSIONS } = require('../config/roles');
const Subject = require('../models/Subject');
const StudentSubject = require('../models/StudentSubject');

const router = express.Router();

// Todas las rutas requieren autenticación y usuario activo
router.use(auth);
router.use(requireActiveUser());

// @desc    Obtener todas las materias
// @route   GET /api/subjects
// @access  Private (adminestudiantes)
router.get('/', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (req.query.level) whereClause.level = req.query.level;
    if (req.query.category) whereClause.category = req.query.category;
    if (req.query.isActive !== undefined) whereClause.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { code: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    const { count, rows: subjects } = await Subject.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      offset,
      limit
    });

    res.json({
      success: true,
      data: subjects,
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

// @desc    Obtener materia por ID
// @route   GET /api/subjects/:id
// @access  Private (adminestudiantes)
router.get('/:id', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Materia no encontrada'
      });
    }

    res.json({
      success: true,
      data: subject
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Crear nueva materia
// @route   POST /api/subjects
// @access  Private (adminestudiantes)
router.post('/', requirePermission(PERMISSIONS.MANAGE_STUDENTS), [
  body('name')
    .notEmpty()
    .withMessage('El nombre de la materia es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('code')
    .notEmpty()
    .withMessage('El código de la materia es requerido')
    .isLength({ min: 2, max: 10 })
    .withMessage('El código debe tener entre 2 y 10 caracteres')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('El código solo puede contener letras mayúsculas y números'),
  body('level')
    .isIn(['primaria', 'secundaria', 'ambos'])
    .withMessage('El nivel debe ser primaria, secundaria o ambos'),
  body('category')
    .isIn(['obligatoria', 'optativa', 'extracurricular'])
    .withMessage('La categoría debe ser obligatoria, optativa o extracurricular'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Los créditos deben ser un número entre 1 y 10'),
  body('hoursPerWeek')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Las horas por semana deben ser un número entre 1 y 10')
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

    const { name, code, description, level, category, credits, hoursPerWeek } = req.body;

    // Verificar que no exista una materia con el mismo código
    const existingSubject = await Subject.findOne({
      where: { code }
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        error: `Ya existe una materia con el código ${code}`
      });
    }

    const subject = await Subject.create({
      name,
      code,
      description,
      level,
      category,
      credits,
      hoursPerWeek
    });

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Materia creada exitosamente'
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Actualizar materia
// @route   PUT /api/subjects/:id
// @access  Private (adminestudiantes)
router.put('/:id', requirePermission(PERMISSIONS.MANAGE_STUDENTS), [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('code')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('El código debe tener entre 2 y 10 caracteres')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('El código solo puede contener letras mayúsculas y números'),
  body('level')
    .optional()
    .isIn(['primaria', 'secundaria', 'ambos'])
    .withMessage('El nivel debe ser primaria, secundaria o ambos'),
  body('category')
    .optional()
    .isIn(['obligatoria', 'optativa', 'extracurricular'])
    .withMessage('La categoría debe ser obligatoria, optativa o extracurricular'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Los créditos deben ser un número entre 1 y 10'),
  body('hoursPerWeek')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Las horas por semana deben ser un número entre 1 y 10')
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

    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Materia no encontrada'
      });
    }

    // Si se está cambiando el código, verificar que no exista
    if (req.body.code && req.body.code !== subject.code) {
      const existingSubject = await Subject.findOne({
        where: { code: req.body.code }
      });

      if (existingSubject) {
        return res.status(400).json({
          success: false,
          error: `Ya existe una materia con el código ${req.body.code}`
        });
      }
    }

    await subject.update(req.body);

    res.json({
      success: true,
      data: subject,
      message: 'Materia actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Activar/Desactivar materia
// @route   PUT /api/subjects/:id/status
// @access  Private (adminestudiantes)
router.put('/:id/status', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Materia no encontrada'
      });
    }

    await subject.update({ isActive });

    res.json({
      success: true,
      data: subject,
      message: `Materia ${isActive ? 'activada' : 'desactivada'} exitosamente`
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Obtener materias por nivel
// @route   GET /api/subjects/by-level/:level
// @access  Private (adminestudiantes)
router.get('/by-level/:level', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const { level } = req.params;

    if (!['primaria', 'secundaria'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'El nivel debe ser primaria o secundaria'
      });
    }

    const subjects = await Subject.findAll({
      where: {
        [Op.or]: [
          { level: level },
          { level: 'ambos' }
        ],
        isActive: true
      },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: subjects
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;