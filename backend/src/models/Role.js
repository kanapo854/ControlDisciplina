const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Ya existe un rol con ese nombre'
    },
    validate: {
      notEmpty: {
        msg: 'El nombre del rol es requerido'
      },
      len: {
        args: [2, 50],
        msg: 'El nombre debe tener entre 2 y 50 caracteres'
      }
    }
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Ya existe un rol con ese código'
    },
    validate: {
      notEmpty: {
        msg: 'El código del rol es requerido'
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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isSystemRole: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_system_role',
    comment: 'Los roles del sistema no pueden ser eliminados'
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#6B7280',
    validate: {
      is: {
        args: /^#[0-9A-Fa-f]{6}$/,
        msg: 'El color debe ser un código hexadecimal válido (ej: #FF5733)'
      }
    }
  },
  userCount: {
    type: DataTypes.VIRTUAL,
    get() {
      // Este campo se calculará dinámicamente
      return this.getDataValue('userCount') || 0;
    }
  }
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Role;
