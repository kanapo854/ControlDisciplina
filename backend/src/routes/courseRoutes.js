const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { auth } = require('../middleware/auth');
const { requirePermission, requireActiveUser } = require('../middleware/authorization');
const { PERMISSIONS } = require('../config/roles');
const Course = require('../models/Course');
const Student = require('../models/Student');

const router = express.Router();

// Todas las rutas requieren autenticación y usuario activo
router.use(auth);
router.use(requireActiveUser());

// @desc    Obtener todos los cursos
// @route   GET /api/courses
// @access  Private (lectura de cursos)
router.get('/', requirePermission(PERMISSIONS.READ_COURSES), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (req.query.level) whereClause.level = req.query.level;
    if (req.query.grade) whereClause.grade = parseInt(req.query.grade);
    if (req.query.academicYear) whereClause.academicYear = parseInt(req.query.academicYear);
    if (req.query.isActive !== undefined) whereClause.isActive = req.query.isActive === 'true';

    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id', 'firstName', 'lastName'],
          where: { isActive: true },
          required: false
        }
      ],
      order: [['academicYear', 'DESC'], ['level', 'ASC'], ['grade', 'ASC'], ['section', 'ASC']],
      offset,
      limit
    });

    // Agregar conteo de estudiantes a cada curso
    const coursesWithStats = courses.map(course => ({
      ...course.toJSON(),
      studentCount: course.students ? course.students.length : 0
    }));

    res.json({
      success: true,
      data: coursesWithStats,
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

// @desc    Obtener curso por ID
// @route   GET /api/courses/:id
// @access  Private (lectura de cursos)
router.get('/:id', requirePermission(PERMISSIONS.READ_COURSES), async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'isActive'],
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Crear nuevo curso
// @route   POST /api/courses
// @access  Private (adminestudiantes)
router.post('/', requirePermission(PERMISSIONS.MANAGE_STUDENTS), [
  body('name')
    .notEmpty()
    .withMessage('El nombre del curso es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('level')
    .isIn(['primaria', 'secundaria'])
    .withMessage('El nivel debe ser primaria o secundaria'),
  body('grade')
    .isInt({ min: 1, max: 6 })
    .withMessage('El grado debe ser un número entre 1 y 6'),
  body('section')
    .notEmpty()
    .withMessage('La sección es requerida')
    .isLength({ min: 1, max: 10 })
    .withMessage('La sección debe tener entre 1 y 10 caracteres'),
  body('academicYear')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('El año académico debe estar entre 2020 y 2030'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La capacidad debe ser un número entre 1 y 50')
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

    const { name, level, grade, section, academicYear, capacity } = req.body;

    // Verificar que no exista un curso igual en el mismo año
    const existingCourse = await Course.findOne({
      where: {
        level,
        grade,
        section,
        academicYear
      }
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: `Ya existe un curso ${level} ${grade}° ${section} para el año ${academicYear}`
      });
    }

    const course = await Course.create({
      name,
      level,
      grade,
      section,
      academicYear,
      capacity
    });

    res.status(201).json({
      success: true,
      data: course,
      message: 'Curso creado exitosamente'
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Actualizar curso
// @route   PUT /api/courses/:id
// @access  Private (adminestudiantes)
router.put('/:id', requirePermission(PERMISSIONS.MANAGE_STUDENTS), [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('level')
    .optional()
    .isIn(['primaria', 'secundaria'])
    .withMessage('El nivel debe ser primaria o secundaria'),
  body('grade')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('El grado debe ser un número entre 1 y 6'),
  body('section')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('La sección debe tener entre 1 y 10 caracteres'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La capacidad debe ser un número entre 1 y 50')
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

    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    await course.update(req.body);

    res.json({
      success: true,
      data: course,
      message: 'Curso actualizado exitosamente'
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Activar/Desactivar curso
// @route   PUT /api/courses/:id/status
// @access  Private (adminestudiantes)
router.put('/:id/status', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    await course.update({ isActive });

    res.json({
      success: true,
      data: course,
      message: `Curso ${isActive ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;