const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Ya existe un usuario con ese email'
    },
    validate: {
      isEmail: {
        msg: 'Por favor ingresa un email válido'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [12],
        msg: 'La contraseña debe tener al menos 12 caracteres'
      },
      isStrongPassword(value) {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (!hasUpperCase) {
          throw new Error('La contraseña debe contener al menos una letra mayúscula');
        }
        if (!hasNumbers) {
          throw new Error('La contraseña debe contener al menos un número');
        }
        if (!hasSymbols) {
          throw new Error('La contraseña debe contener al menos un símbolo (!@#$%^&*(),.?":{}|<>)');
        }
      }
    }
  },
  role: {
    type: DataTypes.ENUM('adminusuarios', 'profesor', 'padrefamilia', 'adminestudiantes', 'adminprofesores'),
    defaultValue: 'profesor',
    validate: {
      isIn: {
        args: [['adminusuarios', 'profesor', 'padrefamilia', 'adminestudiantes', 'adminprofesores']],
        msg: 'El rol debe ser adminusuarios, profesor, padrefamilia, adminestudiantes o adminprofesores'
      }
    }
  },
  carnet: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: {
      msg: 'Ya existe un usuario con ese carnet'
    },
    validate: {
      len: {
        args: [3, 20],
        msg: 'El carnet debe tener entre 3 y 20 caracteres'
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método de instancia para comparar contraseñas
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método de instancia para obtener datos públicos
User.prototype.getPublicData = function() {
  const { password, ...publicData } = this.toJSON();
  return publicData;
};

module.exports = User;