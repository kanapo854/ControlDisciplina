const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración para agregar courseId a students...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../migrations/20241108_add_courseId_to_students.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar la migración
    await pool.query(sqlContent);
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log('✅ Columna courseId agregada a la tabla students');
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    
    // Si el error es que la columna ya existe, no es crítico
    if (error.message.includes('already exists')) {
      console.log('⚠️ La columna courseId ya existe - continuando...');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Proceso de migración completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };