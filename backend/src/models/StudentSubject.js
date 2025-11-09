const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentSubject = sequelize.define('StudentSubject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    comment: 'ID del estudiante'
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    },
    comment: 'ID de la materia'
  },
  academicYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: () => new Date().getFullYear(),
    comment: 'Año académico de la inscripción'
  },
  semester: {
    type: DataTypes.ENUM('1', '2', 'anual'),
    allowNull: false,
    defaultValue: 'anual',
    comment: 'Semestre o período'
  },
  status: {
    type: DataTypes.ENUM('inscrito', 'aprobado', 'reprobado', 'retirado'),
    allowNull: false,
    defaultValue: 'inscrito',
    comment: 'Estado de la inscripción'
  },
  finalGrade: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Calificación final (0-100)'
  },
  enrollmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de inscripción'
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de finalización/aprobación'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre la inscripción'
  }
}, {
  tableName: 'student_subjects',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'subject_id', 'academic_year', 'semester'],
      name: 'unique_student_subject_enrollment'
    },
    {
      fields: ['student_id']
    },
    {
      fields: ['subject_id']
    },
    {
      fields: ['academic_year']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = StudentSubject;