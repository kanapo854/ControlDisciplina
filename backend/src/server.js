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

// Importar asociaciones
require('./models/associations');

const app = express();

// Conectar a la base de datos
connectDB();

// Función para inicializar datos por defecto
const initializeDefaultData = async () => {
  try {
    // Crear materias por defecto
    const { seedSubjects } = require('./seeders/subjectSeeder');
    await seedSubjects();
  } catch (error) {
    console.error('Error al inicializar datos por defecto:', error);
  }
};

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Inicializar datos por defecto después de que el servidor esté corriendo
  await initializeDefaultData();
});

module.exports = app;