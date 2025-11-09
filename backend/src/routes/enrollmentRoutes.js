const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { auth } = require('../middleware/auth');
const { requirePermission, requireActiveUser } = require('../middleware/authorization');
const { PERMISSIONS } = require('../config/roles');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const StudentSubject = require('../models/StudentSubject');

const router = express.Router();

// Todas las rutas requieren autenticación y usuario activo
router.use(auth);
router.use(requireActiveUser());

// @desc    Inscribir estudiante en materias
// @route   POST /api/enrollments
// @access  Private (adminestudiantes)
router.post('/', requirePermission(PERMISSIONS.MANAGE_STUDENTS), [
  body('studentId')
    .notEmpty()
    .withMessage('El ID del estudiante es requerido')
    .isUUID()
    .withMessage('ID de estudiante inválido'),
  body('subjectIds')
    .isArray({ min: 6 })
    .withMessage('El estudiante debe estar inscrito en al menos 6 materias'),
  body('subjectIds.*')
    .isUUID()
    .withMessage('ID de materia inválido'),
  body('academicYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Año académico inválido'),
  body('semester')
    .optional()
    .isIn(['1', '2', 'anual'])
    .withMessage('Semestre inválido')
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

    const { studentId, subjectIds, academicYear = new Date().getFullYear(), semester = 'anual' } = req.body;

    // Verificar que el estudiante existe
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    // Verificar que todas las materias existen y están activas
    const subjects = await Subject.findAll({
      where: {
        id: { [Op.in]: subjectIds },
        isActive: true
      }
    });

    if (subjects.length !== subjectIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Una o más materias no existen o están inactivas'
      });
    }

    // Verificar si ya está inscrito en el año/semestre
    const existingEnrollments = await StudentSubject.findAll({
      where: {
        studentId,
        academicYear,
        semester
      }
    });

    if (existingEnrollments.length > 0) {
      return res.status(400).json({
        success: false,
        error: `El estudiante ya tiene inscripciones para ${semester === 'anual' ? 'el año' : `el semestre ${semester}`} ${academicYear}`
      });
    }

    // Crear las inscripciones
    const enrollments = await Promise.all(
      subjectIds.map(subjectId => 
        StudentSubject.create({
          studentId,
          subjectId,
          academicYear,
          semester,
          status: 'inscrito'
        })
      )
    );

    // Cargar datos completos para la respuesta
    const enrollmentsWithData = await StudentSubject.findAll({
      where: {
        studentId,
        academicYear,
        semester
      },
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code', 'credits', 'hoursPerWeek']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: enrollmentsWithData,
      message: `Estudiante inscrito exitosamente en ${enrollments.length} materias`
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Obtener inscripciones de un estudiante
// @route   GET /api/enrollments/student/:studentId
// @access  Private (adminestudiantes)
router.get('/student/:studentId', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    const whereClause = { studentId };
    if (academicYear) whereClause.academicYear = parseInt(academicYear);
    if (semester) whereClause.semester = semester;

    const enrollments = await StudentSubject.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code', 'description', 'credits', 'hoursPerWeek', 'category']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber']
        }
      ],
      order: [['academicYear', 'DESC'], ['semester', 'ASC'], [{ model: Subject, as: 'subject' }, 'name', 'ASC']]
    });

    // Agrupar por año académico y semestre
    const groupedEnrollments = enrollments.reduce((acc, enrollment) => {
      const key = `${enrollment.academicYear}-${enrollment.semester}`;
      if (!acc[key]) {
        acc[key] = {
          academicYear: enrollment.academicYear,
          semester: enrollment.semester,
          enrollments: [],
          totalSubjects: 0,
          totalCredits: 0
        };
      }
      
      acc[key].enrollments.push(enrollment);
      acc[key].totalSubjects++;
      acc[key].totalCredits += enrollment.subject.credits;
      
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        student: enrollments[0]?.student || null,
        periods: Object.values(groupedEnrollments)
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Obtener estudiantes de una materia
// @route   GET /api/enrollments/subject/:subjectId
// @access  Private (adminestudiantes)
router.get('/subject/:subjectId', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { academicYear, semester } = req.query;

    const whereClause = { subjectId };
    if (academicYear) whereClause.academicYear = parseInt(academicYear);
    if (semester) whereClause.semester = semester;

    const enrollments = await StudentSubject.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'grade', 'section'],
          include: [
            {
              model: require('../models/Course'),
              as: 'course',
              attributes: ['id', 'name', 'level']
            }
          ]
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code', 'description']
        }
      ],
      order: [[{ model: Student, as: 'student' }, 'lastName', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        subject: enrollments[0]?.subject || null,
        enrollments: enrollments,
        totalStudents: enrollments.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Actualizar inscripción (calificación, estado)
// @route   PUT /api/enrollments/:id
// @access  Private (adminestudiantes)
router.put('/:id', requirePermission(PERMISSIONS.MANAGE_STUDENTS), [
  body('status')
    .optional()
    .isIn(['inscrito', 'aprobado', 'reprobado', 'retirado'])
    .withMessage('Estado inválido'),
  body('finalGrade')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('La calificación debe estar entre 0 y 100'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
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

    const enrollment = await StudentSubject.findByPk(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Inscripción no encontrada'
      });
    }

    // Si se está marcando como aprobado/reprobado, establecer fecha de finalización
    if (req.body.status && ['aprobado', 'reprobado'].includes(req.body.status)) {
      req.body.completionDate = new Date();
    }

    await enrollment.update(req.body);

    // Recargar con datos relacionados
    const updatedEnrollment = await StudentSubject.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedEnrollment,
      message: 'Inscripción actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Eliminar inscripción
// @route   DELETE /api/enrollments/:id
// @access  Private (adminestudiantes)
router.delete('/:id', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const enrollment = await StudentSubject.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Inscripción no encontrada'
      });
    }

    // Verificar que no se elimine si deja al estudiante con menos de 6 materias
    const remainingEnrollments = await StudentSubject.count({
      where: {
        studentId: enrollment.studentId,
        academicYear: enrollment.academicYear,
        semester: enrollment.semester,
        id: { [Op.ne]: req.params.id },
        status: { [Op.in]: ['inscrito', 'aprobado'] }
      }
    });

    if (remainingEnrollments < 6) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar la inscripción. El estudiante debe permanecer inscrito en al menos 6 materias'
      });
    }

    await enrollment.destroy();

    res.json({
      success: true,
      message: 'Inscripción eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Validar mínimo de materias para un estudiante
// @route   GET /api/enrollments/validate/:studentId
// @access  Private (adminestudiantes)
router.get('/validate/:studentId', requirePermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { academicYear = new Date().getFullYear(), semester = 'anual' } = req.query;

    const enrollmentCount = await StudentSubject.count({
      where: {
        studentId,
        academicYear: parseInt(academicYear),
        semester,
        status: { [Op.in]: ['inscrito', 'aprobado'] }
      }
    });

    const isValid = enrollmentCount >= 6;

    res.json({
      success: true,
      data: {
        studentId,
        academicYear: parseInt(academicYear),
        semester,
        enrollmentCount,
        minimumRequired: 6,
        isValid,
        message: isValid 
          ? 'El estudiante cumple con el mínimo de materias requeridas'
          : `El estudiante necesita ${6 - enrollmentCount} materias adicionales`
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;