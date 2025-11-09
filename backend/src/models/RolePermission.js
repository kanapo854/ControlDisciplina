const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'role_id',
    references: {
      model: 'roles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'permission_id',
    references: {
      model: 'permissions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'role_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id']
    }
  ]
});

module.exports = RolePermission;
