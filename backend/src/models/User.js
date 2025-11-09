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
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'failed_login_attempts',
  },
  accountLockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'account_locked_until',
  },
  // MFA/2FA fields
  mfaEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'mfa_enabled',
  },
  mfaSecret: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mfa_secret',
  },
  // Password expiration fields
  lastPasswordChange: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'last_password_change',
  },
  passwordExpired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'password_expired',
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
        user.lastPasswordChange = new Date();
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
        user.lastPasswordChange = new Date();
        user.passwordExpired = false;
      }
    },
    afterUpdate: async (user) => {
      // Save password to history after successful update
      if (user.changed('password') && user.password) {
        const PasswordHistory = require('./PasswordHistory');
        
        // Save current password to history
        await PasswordHistory.create({
          userId: user.id,
          passwordHash: user.password,
          changedAt: new Date()
        });
        
        // Keep only last 5 passwords
        const histories = await PasswordHistory.findAll({
          where: { userId: user.id },
          order: [['changedAt', 'DESC']],
          limit: 100
        });
        
        if (histories.length > 5) {
          const toDelete = histories.slice(5);
          await PasswordHistory.destroy({
            where: {
              id: toDelete.map(h => h.id)
            }
          });
        }
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