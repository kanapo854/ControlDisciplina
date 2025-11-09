const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { Incident, Student, User } = require('../models');
const { sequelize } = require('../config/database');
const { QueryTypes, Op } = require('sequelize');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// @desc    Dashboard - Estadísticas generales
// @route   GET /api/reports/dashboard
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Estadísticas básicas
    const totalStudents = await Student.count({ where: { isActive: true } });
    const totalIncidents = await Incident.count();
    const incidentsThisMonth = await Incident.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });
    const pendingIncidents = await Incident.count({
      where: {
        status: { [Op.in]: ['pendiente', 'en_proceso'] }
      }
    });

    // Incidentes por tipo usando SQL nativo
    const incidentsByType = await sequelize.query(`
      SELECT type, COUNT(*) as count
      FROM incidents
      GROUP BY type
      ORDER BY count DESC
    `, { type: QueryTypes.SELECT });

    // Incidentes por severidad
    const incidentsBySeverity = await sequelize.query(`
      SELECT severity, COUNT(*) as count
      FROM incidents
      GROUP BY severity
    `, { type: QueryTypes.SELECT });

    // Incidentes por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const incidentsByMonth = await sequelize.query(`
      SELECT 
        EXTRACT(YEAR FROM created_at) as year,
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as count
      FROM incidents
      WHERE created_at >= :sixMonthsAgo
      GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
      ORDER BY year, month
    `, { 
      replacements: { sixMonthsAgo },
      type: QueryTypes.SELECT 
    });

    // Top estudiantes con más incidentes
    const topStudentsWithIncidents = await sequelize.query(`
      SELECT 
        s.first_name || ' ' || s.last_name as "studentName",
        s.grade,
        s.section,
        COUNT(i.id) as "incidentCount"
      FROM students s
      INNER JOIN incidents i ON s.id = i.student_id
      GROUP BY s.id, s.first_name, s.last_name, s.grade, s.section
      ORDER BY "incidentCount" DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalIncidents,
          incidentsThisMonth,
          pendingIncidents
        },
        charts: {
          incidentsByType,
          incidentsBySeverity,
          incidentsByMonth,
          topStudentsWithIncidents
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Reporte de incidentes por estudiante
// @route   GET /api/reports/student/:studentId
// @access  Private
router.get('/student/:studentId', async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }

    const incidents = await Incident.findAll({
      where: { studentId: req.params.studentId },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Estadísticas del estudiante usando SQL nativo
    const incidentsByType = await sequelize.query(`
      SELECT type, COUNT(*) as count
      FROM incidents
      WHERE student_id = :studentId
      GROUP BY type
    `, { 
      replacements: { studentId: req.params.studentId },
      type: QueryTypes.SELECT 
    });

    const incidentsBySeverity = await sequelize.query(`
      SELECT severity, COUNT(*) as count
      FROM incidents
      WHERE student_id = :studentId
      GROUP BY severity
    `, { 
      replacements: { studentId: req.params.studentId },
      type: QueryTypes.SELECT 
    });

    res.json({
      success: true,
      data: {
        student,
        incidents,
        statistics: {
          total: incidents.length,
          byType: incidentsByType,
          bySeverity: incidentsBySeverity
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Reporte por rango de fechas
// @route   GET /api/reports/date-range
// @access  Private
router.get('/date-range', async (req, res, next) => {
  try {
    const { startDate, endDate, type, severity, grade } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Fecha de inicio y fin son requeridas'
      });
    }

    // Construir filtros para Sequelize
    let whereClause = {
      dateOccurred: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    if (type) whereClause.type = type;
    if (severity) whereClause.severity = severity;

    // Configurar includes para Student
    let includeClause = [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'grade', 'section']
      },
      {
        model: User,
        as: 'reporter',
        attributes: ['id', 'name']
      }
    ];

    // Si se especifica grado, agregar filtro al include
    if (grade) {
      includeClause[0].where = { grade: grade };
    }

    const incidents = await Incident.findAll({
      where: whereClause,
      include: includeClause,
      order: [['dateOccurred', 'DESC']]
    });

    // Estadísticas del período usando SQL nativo
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN type = 'conducta' THEN 1 END) as conducta_count,
        COUNT(CASE WHEN type = 'academico' THEN 1 END) as academico_count,
        COUNT(CASE WHEN type = 'asistencia' THEN 1 END) as asistencia_count,
        COUNT(CASE WHEN severity = 'leve' THEN 1 END) as leve_count,
        COUNT(CASE WHEN severity = 'moderado' THEN 1 END) as moderado_count,
        COUNT(CASE WHEN severity = 'grave' THEN 1 END) as grave_count
      FROM incidents 
      WHERE date_occurred BETWEEN :startDate AND :endDate
      ${type ? 'AND type = :type' : ''}
      ${severity ? 'AND severity = :severity' : ''}
    `;

    const replacements = { startDate: new Date(startDate), endDate: new Date(endDate) };
    if (type) replacements.type = type;
    if (severity) replacements.severity = severity;

    const stats = await sequelize.query(statsQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        incidents,
        period: { startDate, endDate },
        filters: { type, severity, grade },
        statistics: stats[0] || { total: 0 }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Reporte de sanciones
// @route   GET /api/reports/sanctions
// @access  Private (admin, coordinador)
router.get('/sanctions', authorize('admin', 'coordinador'), async (req, res, next) => {
  try {
    // Consulta SQL para obtener sanciones con información del estudiante y quien aplicó la sanción
    const sanctions = await sequelize.query(`
      SELECT 
        i.id as incident_id,
        i.type as incident_type,
        i.description as incident_description,
        i.date_occurred,
        s.first_name || ' ' || s.last_name as student_name,
        s.grade,
        s.section,
        sanction_data.type as sanction_type,
        sanction_data.description as sanction_description,
        sanction_data.applied_date,
        sanction_data.start_date,
        sanction_data.end_date,
        u.name as applied_by_name
      FROM incidents i
      CROSS JOIN LATERAL jsonb_array_elements(i.sanctions) as sanction_data
      INNER JOIN students s ON i.student_id = s.id
      LEFT JOIN users u ON (sanction_data->>'appliedBy')::uuid = u.id
      ORDER BY sanction_data->>'appliedDate' DESC
    `, { type: QueryTypes.SELECT });

    // Estadísticas de sanciones usando SQL nativo
    const sanctionStats = await sequelize.query(`
      SELECT 
        sanction_data->>'type' as sanction_type,
        COUNT(*) as count
      FROM incidents i
      CROSS JOIN LATERAL jsonb_array_elements(i.sanctions) as sanction_data
      GROUP BY sanction_data->>'type'
      ORDER BY count DESC
    `, { type: QueryTypes.SELECT });

    res.json({
      success: true,
      data: {
        sanctions,
        statistics: sanctionStats
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;