const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const courseRoutes = require('./routes/courseRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');

// Importar asociaciones
require('./models/associations');

// Importar servicios de seguridad
const { startPasswordExpirationScheduler } = require('./services/passwordExpirationService');

const app = express();

// Conectar a la base de datos
connectDB();

// Función para inicializar datos por defecto
const initializeDefaultData = async () => {
  try {
    // Crear materias por defecto
    const { seedSubjects } = require('./seeders/subjectSeeder');
    await seedSubjects();
    
    // Iniciar verificación automática de expiración de contraseñas
    startPasswordExpirationScheduler();
    console.log('✅ Password expiration scheduler initialized');
  } catch (error) {
    console.error('Error al inicializar datos por defecto:', error);
  }
};

// Middleware de seguridad
app.use(helmet());

// Configurar CORS para permitir múltiples orígenes
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'https://control-disciplina-mi4ubwlyq-valhery-quispes-projects.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor de Control de Disciplina funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Configurar servidor (HTTP en desarrollo, HTTPS en producción)
const { configureServer } = require('./config/https');

configureServer(app).on('listening', async () => {
  // Inicializar datos por defecto después de que el servidor esté corriendo
  await initializeDefaultData();
});

module.exports = app;