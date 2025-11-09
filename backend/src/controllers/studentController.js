const { validationResult } = require('express-validator');
const { Student, User, Course, Subject, StudentSubject } = require('../models');
const { Op } = require('sequelize');

// @desc    Obtener todos los estudiantes
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros
    const where = {};
    if (req.query.grade) where.grade = req.query.grade;
    if (req.query.section) where.section = req.query.section;
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${req.query.search}%` } },
        { lastName: { [Op.iLike]: `%${req.query.search}%` } },
        { documentNumber: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    const { rows: students, count: total } = await Student.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'registeredBy',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'parentUser',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'grade', 'section']
        }
      ],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
      offset: skip,
      limit
    });

    res.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener estudiante por ID
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'registeredBy',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'parentUser',
          attributes: ['id', 'name', 'email', 'phone', 'carnet']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'grade', 'section', 'level']
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Crear nuevo estudiante
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verificar si ya existe un estudiante con ese documento
    const existingStudent = await Student.findOne({ 
      where: { documentNumber: req.body.documentNumber }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un estudiante con ese número de documento'
      });
    }

    // Si se envía courseId, obtener los datos del curso para grade y section
    let courseData = null;
    if (req.body.courseId) {
      courseData = await Course.findByPk(req.body.courseId);
      if (!courseData) {
        return res.status(400).json({
          success: false,
          error: 'Curso no encontrado'
        });
      }
    }

    const studentData = {
      ...req.body,
      registeredById: req.user.id
    };

    // Si hay courseId, agregar grade y section del curso
    if (courseData) {
      studentData.grade = courseData.grade;
      studentData.section = courseData.section;
    }

    const student = await Student.create(studentData);
    
    // Cargar la relación después de crear
    await student.reload({
      include: [{
        model: User,
        as: 'registeredBy',
        attributes: ['name', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar estudiante
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    // Verificar si se está cambiando el número de documento
    if (req.body.documentNumber && req.body.documentNumber !== student.documentNumber) {
      const existingStudent = await Student.findOne({ 
        where: { 
          documentNumber: req.body.documentNumber,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un estudiante con ese número de documento'
        });
      }
    }

    await student.update(req.body);
    
    // Recargar con relaciones
    await student.reload({
      include: [{
        model: User,
        as: 'registeredBy',
        attributes: ['name', 'email']
      }]
    });

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar estudiante (desactivar)
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    // En lugar de eliminar, desactivamos el estudiante
    await student.update({ isActive: false });

    res.json({
      success: true,
      message: 'Estudiante desactivado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reactivar estudiante
// @route   PUT /api/students/:id/activate
// @access  Private
const activateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    await student.update({ isActive: true });

    res.json({
      success: true,
      message: 'Estudiante reactivado exitosamente',
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Buscar estudiantes por número de documento
// @route   GET /api/students/search/:documentNumber
// @access  Private
const searchByDocument = async (req, res, next) => {
  try {
    const student = await Student.findOne({ 
      where: { documentNumber: req.params.documentNumber },
      include: [{
        model: User,
        as: 'registeredBy',
        attributes: ['name', 'email']
      }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener estadísticas de estudiantes
// @route   GET /api/students/stats
// @access  Private (adminestudiantes)
const getStudentStats = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Estadísticas básicas de estudiantes
    const totalStudents = await Student.count();
    const activeStudents = await Student.count({ where: { isActive: true } });
    const inactiveStudents = totalStudents - activeStudents;

    // Distribución por género
    const genderStats = await Student.findAll({
      attributes: [
        'gender',
        [Student.sequelize.fn('COUNT', Student.sequelize.col('gender')), 'count']
      ],
      where: { isActive: true },
      group: ['gender'],
      raw: true
    });

    // Distribución por grado
    const gradeStats = await Student.findAll({
      attributes: [
        'grade',
        [Student.sequelize.fn('COUNT', Student.sequelize.col('grade')), 'count']
      ],
      where: { isActive: true },
      group: ['grade'],
      order: [['grade', 'ASC']],
      raw: true
    });

    // Distribución por curso (solo secundaria)
    const courseStats = await Student.findAll({
      attributes: [
        [Student.sequelize.fn('COUNT', Student.sequelize.col('Student.id')), 'count']
      ],
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'level'],
        required: true
      }],
      where: { isActive: true },
      group: ['course.id', 'course.name', 'course.level'],
      raw: true
    });

    // Estadísticas de inscripciones por año académico
    const enrollmentStats = await StudentSubject.findAll({
      attributes: [
        'academicYear',
        'semester',
        [StudentSubject.sequelize.fn('COUNT', StudentSubject.sequelize.col('StudentSubject.id')), 'enrollmentCount'],
        [StudentSubject.sequelize.fn('COUNT', StudentSubject.sequelize.fn('DISTINCT', StudentSubject.sequelize.col('student_id'))), 'uniqueStudents']
      ],
      group: ['academicYear', 'semester'],
      order: [['academicYear', 'DESC'], ['semester', 'ASC']],
      raw: true
    });

    // Estadísticas de materias más populares
    const popularSubjects = await StudentSubject.findAll({
      attributes: [
        [StudentSubject.sequelize.fn('COUNT', StudentSubject.sequelize.col('StudentSubject.id')), 'enrollmentCount']
      ],
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['id', 'name', 'code', 'category'],
        required: true
      }],
      where: {
        academicYear: currentYear,
        status: { [Op.in]: ['inscrito', 'aprobado'] }
      },
      group: ['subject.id', 'subject.name', 'subject.code', 'subject.category'],
      order: [[StudentSubject.sequelize.fn('COUNT', StudentSubject.sequelize.col('StudentSubject.id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Estudiantes con inscripciones incompletas (menos de 6 materias)
    const incompleteEnrollments = await Student.findAll({
      attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'grade'],
      include: [{
        model: StudentSubject,
        as: 'subjectEnrollments',
        attributes: [],
        where: {
          academicYear: currentYear,
          status: { [Op.in]: ['inscrito', 'aprobado'] }
        },
        required: false
      }],
      where: { isActive: true },
      group: ['Student.id'],
      having: Student.sequelize.literal('COUNT("subjectEnrollments"."id") < 6'),
      raw: true
    });

    // Rendimiento académico por estado
    const academicPerformance = await StudentSubject.findAll({
      attributes: [
        'status',
        [StudentSubject.sequelize.fn('COUNT', StudentSubject.sequelize.col('StudentSubject.id')), 'count'],
        [StudentSubject.sequelize.fn('AVG', StudentSubject.sequelize.col('final_grade')), 'averageGrade']
      ],
      where: {
        academicYear: currentYear,
        finalGrade: { [Op.not]: null }
      },
      group: ['status'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          activeStudents,
          inactiveStudents,
          currentAcademicYear: currentYear
        },
        demographics: {
          gender: genderStats,
          grades: gradeStats,
          courses: courseStats.map(stat => ({
            courseName: stat['course.name'],
            level: stat['course.level'],
            studentCount: parseInt(stat.count)
          }))
        },
        academic: {
          enrollmentsByPeriod: enrollmentStats,
          popularSubjects: popularSubjects.map(subject => ({
            subjectName: subject['subject.name'],
            code: subject['subject.code'],
            category: subject['subject.category'],
            enrollmentCount: parseInt(subject.enrollmentCount)
          })),
          incompleteEnrollments: incompleteEnrollments.length,
          academicPerformance: academicPerformance.map(perf => ({
            status: perf.status,
            count: parseInt(perf.count),
            averageGrade: perf.averageGrade ? parseFloat(perf.averageGrade).toFixed(2) : null
          }))
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Vincular estudiante con padre (usuario del sistema)
// @route   PUT /api/students/:id/link-parent
// @access  Private (admin usuarios)
const linkParentToStudent = async (req, res, next) => {
  try {
    const { parentUserId } = req.body;
    const studentId = req.params.id;

    // Verificar que el estudiante existe
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    // Verificar que el usuario padre existe y tiene el rol correcto
    const parentUser = await User.findByPk(parentUserId);
    if (!parentUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario padre no encontrado'
      });
    }

    if (parentUser.role !== 'padrefamilia') {
      return res.status(400).json({
        success: false,
        error: 'El usuario debe tener el rol de padre de familia'
      });
    }

    // Vincular padre con estudiante
    await student.update({ parentUserId });

    // Cargar la relación actualizada
    await student.reload({
      include: [{
        model: User,
        as: 'parentUser',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    res.json({
      success: true,
      message: 'Padre vinculado exitosamente al estudiante',
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Desvincular padre de estudiante
// @route   DELETE /api/students/:id/unlink-parent
// @access  Private (admin usuarios)
const unlinkParentFromStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    await student.update({ parentUserId: null });

    res.json({
      success: true,
      message: 'Padre desvinculado exitosamente del estudiante'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener estudiantes de un padre
// @route   GET /api/students/my-children
// @access  Private (padre de familia)
const getMyChildren = async (req, res, next) => {
  try {
    // Solo los padres pueden acceder a esta ruta
    if (req.user.role !== 'padrefamilia') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo padres de familia pueden ver esta información'
      });
    }

    const students = await Student.findAll({
      where: { parentUserId: req.user.id },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'name', 'level', 'grade', 'section']
      }],
      order: [['firstName', 'ASC']]
    });

    res.json({
      success: true,
      data: students
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};