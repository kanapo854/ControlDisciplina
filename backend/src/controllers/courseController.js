const { validationResult } = require('express-validator');
const { Course } = require('../models');
const { Op } = require('sequelize');

// @desc    Obtener todos los cursos
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Filtros
    const where = {};
    if (req.query.level) where.level = req.query.level;
    if (req.query.grade) where.grade = req.query.grade;
    if (req.query.academicYear) where.academicYear = req.query.academicYear;
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

    // Búsqueda por nombre
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { section: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    const { rows: courses, count: total } = await Course.findAndCountAll({
      where,
      order: [['level', 'ASC'], ['grade', 'ASC'], ['section', 'ASC']],
      offset: skip,
      limit
    });

    res.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener un curso por ID
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

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
    console.error('Error al obtener curso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Crear un nuevo curso
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = async (req, res, next) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, level, grade, section, academicYear, capacity } = req.body;

    // Verificar si ya existe un curso con la misma combinación
    const existingCourse = await Course.findOne({
      where: {
        level,
        grade,
        section,
        academicYear: academicYear || new Date().getFullYear()
      }
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un curso con esta combinación de nivel, grado, sección y año académico'
      });
    }

    const course = await Course.create({
      name,
      level,
      grade,
      section,
      academicYear: academicYear || new Date().getFullYear(),
      capacity
    });

    res.status(201).json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar un curso
// @route   PUT /api/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res, next) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, level, grade, section, academicYear, capacity, isActive } = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    // Verificar si la nueva combinación ya existe (excluyendo el curso actual)
    if (level || grade || section || academicYear) {
      const existingCourse = await Course.findOne({
        where: {
          level: level || course.level,
          grade: grade || course.grade,
          section: section || course.section,
          academicYear: academicYear || course.academicYear,
          id: { [Op.ne]: id }
        }
      });

      if (existingCourse) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un curso con esta combinación de nivel, grado, sección y año académico'
        });
      }
    }

    await course.update({
      name: name || course.name,
      level: level || course.level,
      grade: grade || course.grade,
      section: section || course.section,
      academicYear: academicYear || course.academicYear,
      capacity: capacity || course.capacity,
      isActive: isActive !== undefined ? isActive : course.isActive
    });

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Eliminar un curso
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    // Verificar si hay estudiantes asociados
    const { Student } = require('../models');
    const studentCount = await Student.count({
      where: { courseId: id }
    });

    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar el curso porque tiene ${studentCount} estudiante(s) asociado(s)`
      });
    }

    await course.destroy();

    res.json({
      success: true,
      message: 'Curso eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Activar/Desactivar curso
// @route   PATCH /api/courses/:id/toggle-status
// @access  Private (Admin)
const toggleCourseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    await course.update({
      isActive: !course.isActive
    });

    res.json({
      success: true,
      data: course,
      message: `Curso ${course.isActive ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado del curso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus
};