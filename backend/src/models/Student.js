const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [2, 50],
        msg: 'El nombre debe tener entre 2 y 50 caracteres'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El apellido es requerido'
      },
      len: {
        args: [2, 50],
        msg: 'El apellido debe tener entre 2 y 50 caracteres'
      }
    }
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Ya existe un estudiante con ese número de documento'
    }
  },
  documentType: {
    type: DataTypes.ENUM('cedula', 'tarjeta_identidad', 'pasaporte'),
    defaultValue: 'tarjeta_identidad'
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El grado es requerido'
      }
    }
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La sección es requerida'
      }
    }
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'La fecha de nacimiento debe ser válida'
      }
    }
  },
  gender: {
    type: DataTypes.ENUM('masculino', 'femenino', 'otro'),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Por favor ingresa un email válido'
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parentName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del padre/madre/acudiente es requerido'
      }
    }
  },
  parentPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El teléfono del padre/madre/acudiente es requerido'
      }
    }
  },
  parentEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Email del padre/madre inválido'
      }
    }
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  medicalInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      allergies: [],
      medications: [],
      conditions: [],
      emergencyProcedures: ''
    }
  },
  enrollmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  registeredById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'students',
  indexes: [
    {
      unique: true,
      fields: ['document_number']
    },
    {
      fields: ['grade', 'section']
    },
    {
      fields: ['first_name', 'last_name']
    }
  ]
});

// Virtual para nombre completo
Student.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Método para calcular la edad
Student.prototype.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = Student;