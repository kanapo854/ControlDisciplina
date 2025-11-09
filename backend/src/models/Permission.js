const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Ya existe un permiso con ese nombre'
    },
    validate: {
      notEmpty: {
        msg: 'El nombre del permiso es requerido'
      }
    }
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Ya existe un permiso con ese código'
    },
    validate: {
      notEmpty: {
        msg: 'El código del permiso es requerido'
      },
      isLowercase: true,
      is: {
        args: /^[a-z_]+$/,
        msg: 'El código solo puede contener letras minúsculas y guiones bajos'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Categoría del permiso (usuarios, estudiantes, incidentes, etc.)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Permission;
