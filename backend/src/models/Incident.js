const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incident = sequelize.define('Incident', {
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
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El título del incidente es requerido'
      },
      len: {
        args: [5, 200],
        msg: 'El título debe tener entre 5 y 200 caracteres'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción del incidente es requerida'
      },
      len: {
        args: [10, 1000],
        msg: 'La descripción debe tener entre 10 y 1000 caracteres'
      }
    }
  },
  type: {
    type: DataTypes.ENUM(
      'leve', 'grave', 'muy_grave', 'agresion', 'bullying',
      'vandalismo', 'inasistencia', 'tardanza', 'uniforme',
      'conducta', 'academico', 'otro'
    ),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El lugar del incidente es requerido'
      }
    }
  },
  dateOccurred: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timeOccurred: {
    type: DataTypes.STRING,
    allowNull: false
  },
  witnesses: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  reportedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'resuelto', 'cerrado'),
    defaultValue: 'pendiente'
  },
  sanctions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  followUp: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  parentNotified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parentNotificationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  parentResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolutionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'incidents',
  indexes: [
    { fields: ['student_id'] },
    { fields: ['type'] },
    { fields: ['severity'] },
    { fields: ['status'] },
    { fields: ['date_occurred'] },
    { fields: ['reported_by_id'] }
  ],
  hooks: {
    beforeUpdate: (incident) => {
      // Actualizar fecha de resolución cuando el estado cambie a resuelto
      if (incident.changed('status') && incident.status === 'resuelto' && !incident.resolutionDate) {
        incident.resolutionDate = new Date();
      }
    }
  }
});

module.exports = Incident;