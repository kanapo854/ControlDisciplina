const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Incident = require('../models/Incident');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Obtener todos los incidentes
// @route   GET /api/incidents
// @access  Private
const getIncidents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtros para Sequelize
    const whereClause = {};
    if (req.query.student) whereClause.studentId = req.query.student;
    if (req.query.type) whereClause.type = req.query.type;
    if (req.query.severity) whereClause.severity = req.query.severity;
    if (req.query.status) whereClause.status = req.query.status;
    if (req.query.reportedBy) whereClause.reportedById = req.query.reportedBy;

    // Filtro por rango de fechas
    if (req.query.startDate || req.query.endDate) {
      whereClause.dateOccurred = {};
      if (req.query.startDate) {
        whereClause.dateOccurred[Op.gte] = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        whereClause.dateOccurred[Op.lte] = new Date(req.query.endDate);
      }
    }

    const { count, rows: incidents } = await Incident.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'grade', 'section']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['dateOccurred', 'DESC'], ['createdAt', 'DESC']],
      offset,
      limit
    });

    res.json({
      success: true,
      data: incidents,
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
};

// @desc    Obtener incidente por ID
// @route   GET /api/incidents/:id
// @access  Private
const getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'grade', 'section', 'phone', 'email', 'parentName', 'parentPhone', 'parentEmail']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado'
      });
    }

    res.json({
      success: true,
      data: incident
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Crear nuevo incidente
// @route   POST /api/incidents
// @access  Private
const createIncident = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verificar que el estudiante existe
    const student = await Student.findByPk(req.body.student);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    const incidentData = {
      ...req.body,
      studentId: req.body.student, // Mapear student a studentId
      reportedById: req.user.id     // Mapear reportedBy a reportedById
    };

    // Remover campos que no existen en el modelo Sequelize
    delete incidentData.student;
    delete incidentData.reportedBy;

    const incident = await Incident.create(incidentData);
    
    // Cargar las relaciones después de crear
    const incidentWithRelations = await Incident.findByPk(incident.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'grade', 'section']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: incidentWithRelations
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar incidente
// @route   PUT /api/incidents/:id
// @access  Private
const updateIncident = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado'
      });
    }

    // Solo el reportador o usuarios con roles superiores pueden editar
    if (incident.reportedById !== req.user.id && 
        !['admin', 'coordinador'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este incidente'
      });
    }

    // Preparar datos para actualización
    const updateData = { ...req.body };
    if (updateData.student) {
      updateData.studentId = updateData.student;
      delete updateData.student;
    }
    if (updateData.reportedBy) {
      updateData.reportedById = updateData.reportedBy;
      delete updateData.reportedBy;
    }

    await incident.update(updateData);

    // Recargar el incidente con las relaciones
    const updatedIncident = await Incident.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'grade', 'section']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedIncident
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Agregar sanción a incidente
// @route   POST /api/incidents/:id/sanctions
// @access  Private (admin, coordinador)
const addSanction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado'
      });
    }

    const sanction = {
      ...req.body,
      appliedBy: req.user.id,
      appliedDate: new Date()
    };

    // Para PostgreSQL, actualizamos el array de sanciones
    const currentSanctions = incident.sanctions || [];
    currentSanctions.push(sanction);

    await incident.update({ 
      sanctions: currentSanctions,
      status: req.body.status || incident.status
    });

    // Recargar el incidente con las relaciones
    const updatedIncident = await Incident.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'grade', 'section']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedIncident
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Agregar seguimiento a incidente
// @route   POST /api/incidents/:id/follow-up
// @access  Private
const addFollowUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado'
      });
    }

    const followUp = {
      description: req.body.description,
      user: req.user.id,
      date: new Date()
    };

    // Para PostgreSQL, actualizamos el array de seguimientos
    const currentFollowUp = incident.followUp || [];
    currentFollowUp.push(followUp);

    await incident.update({ 
      followUp: currentFollowUp,
      status: req.body.status || incident.status
    });

    // Recargar el incidente con las relaciones
    const updatedIncident = await Incident.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'documentNumber', 'grade', 'section']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedIncident
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Cambiar estado del incidente
// @route   PUT /api/incidents/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado'
      });
    }

    const updateData = { status };
    if (status === 'resuelto' || status === 'cerrado') {
      updateData.resolutionNotes = resolutionNotes;
      if (!incident.resolutionDate) {
        updateData.resolutionDate = new Date();
      }
    }

    await incident.update(updateData);

    res.json({
      success: true,
      data: incident
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar incidente
// @route   DELETE /api/incidents/:id
// @access  Private (admin, coordinador)
const deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado'
      });
    }

    await incident.destroy();

    res.json({
      success: true,
      message: 'Incidente eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  addSanction,
  addFollowUp,
  updateStatus,
  deleteIncident
};