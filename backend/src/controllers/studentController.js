const { validationResult } = require('express-validator');
const { Student, User } = require('../models');
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
      include: [{
        model: User,
        as: 'registeredBy',
        attributes: ['name', 'email']
      }],
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

    const studentData = {
      ...req.body,
      registeredById: req.user.id
    };

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

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  activateStudent,
  searchByDocument
};