const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PasswordHistory = sequelize.define('PasswordHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  },
  changedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'changed_at'
  }
}, {
  tableName: 'password_history',
  timestamps: false
});

module.exports = PasswordHistory;
