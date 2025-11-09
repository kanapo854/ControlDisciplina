const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del curso (ej: 1° Año A, 2° Año B, etc.)'
  },
  level: {
    type: DataTypes.ENUM('primaria', 'secundaria'),
    allowNull: false,
    comment: 'Nivel educativo del curso'
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 6
    },
    comment: 'Grado del curso (1-6 para primaria, 1-5 para secundaria)'
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Sección del curso (A, B, C, etc.)'
  },
  academicYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: () => new Date().getFullYear(),
    comment: 'Año académico'
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    validate: {
      min: 1,
      max: 50
    },
    comment: 'Capacidad máxima de estudiantes'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Estado del curso'
  }
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['level', 'grade', 'section', 'academic_year'],
      name: 'unique_course_per_year'
    },
    {
      fields: ['level']
    },
    {
      fields: ['academic_year']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Course;