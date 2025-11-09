const { Sequelize } = require('sequelize');

// Configuración de la base de datos PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ControlDisciplina',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'holamundo1',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado exitosamente');
    
    // Sincronizar modelos en desarrollo (crear tablas)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('📊 Tablas sincronizadas');
    }
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };