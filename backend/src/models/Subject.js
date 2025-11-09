const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre de la materia'
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    comment: 'Código único de la materia (ej: MAT, ESP, ING, etc.)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción de la materia'
  },
  level: {
    type: DataTypes.ENUM('primaria', 'secundaria', 'ambos'),
    allowNull: false,
    defaultValue: 'ambos',
    comment: 'Nivel educativo donde se imparte'
  },
  category: {
    type: DataTypes.ENUM('obligatoria', 'optativa', 'extracurricular'),
    allowNull: false,
    defaultValue: 'obligatoria',
    comment: 'Categoría de la materia'
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      min: 1,
      max: 10
    },
    comment: 'Créditos académicos de la materia'
  },
  hoursPerWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
    validate: {
      min: 1,
      max: 10
    },
    comment: 'Horas semanales de clase'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Estado de la materia'
  }
}, {
  tableName: 'subjects',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['level']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Subject;