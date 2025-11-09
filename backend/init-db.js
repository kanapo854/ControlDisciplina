const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ControlDisciplina',
  dialect: 'postgres',
  logging: false
};

async function initializeDatabase() {
  try {
    console.log('🔄 Verificando conexión a PostgreSQL...');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Usuario: ${dbConfig.username}`);
    console.log(`   Base de datos: ${dbConfig.database}`);
    
    // Primero intentamos conectar sin especificar la base de datos para crearla si no existe
    const sequelizeAdmin = new Sequelize({
      ...dbConfig,
      database: 'postgres' // Conectar a la BD por defecto para crear nuestra BD
    });

    await sequelizeAdmin.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida.');

    // Verificar si la base de datos existe
    console.log(`🔄 Verificando si existe la base de datos "${dbConfig.database}"...`);
    const [results] = await sequelizeAdmin.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`
    );

    if (results.length === 0) {
      console.log(`🔄 Creando base de datos "${dbConfig.database}"...`);
      await sequelizeAdmin.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log('✅ Base de datos creada exitosamente.');
    } else {
      console.log('✅ La base de datos ya existe.');
    }

    await sequelizeAdmin.close();

    // Ahora conectamos a nuestra base de datos específica
    const { sequelize } = require('./src/config/database');
    const User = require('./src/models/User');
    const Student = require('./src/models/Student');
    const Incident = require('./src/models/Incident');

    console.log('🔄 Conectando a la base de datos del proyecto...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🔄 Sincronizando modelos con la base de datos...');
    
    // Sincronizar tablas (esto creará las tablas si no existen)
    await sequelize.sync({ force: false }); // force: false preserva datos existentes
    
    console.log('✅ Base de datos inicializada correctamente.');
    console.log('📋 Tablas creadas:');
    console.log('  - users (usuarios del sistema)');
    console.log('  - students (estudiantes)');
    console.log('  - incidents (incidentes disciplinarios)');

    // Crear usuario administrador por defecto si no existe
    const adminExists = await User.findOne({ where: { email: 'admin@colegio.edu' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Administrador',
        email: 'admin@colegio.edu',
        password: 'admin123', // Se hasheará automáticamente
        role: 'admin',
        isActive: true
      });
      console.log('👤 Usuario administrador creado:');
      console.log('   Email: admin@colegio.edu');
      console.log('   Password: admin123');
      console.log('   ⚠️  Cambia esta contraseña después del primer login');
    } else {
      console.log('👤 Usuario administrador ya existe.');
    }

    await sequelize.close();
    console.log('🎉 Inicialización completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('   1. Verificar que PostgreSQL esté ejecutándose');
    console.error('   2. Verificar credenciales en el archivo .env');
    console.error('   3. Verificar que el usuario tenga permisos para crear bases de datos');
    process.exit(1);
  }
}

initializeDatabase();