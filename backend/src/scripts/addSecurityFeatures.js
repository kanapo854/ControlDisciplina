const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración de características de seguridad...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../add_security_features.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar la migración
    await sequelize.query(sql);
    
    console.log('✅ Migración completada exitosamente');
    console.log('   - Campos MFA agregados a la tabla users');
    console.log('   - Campos de política de contraseñas agregados');
    console.log('   - Tabla password_history creada');
    console.log('   - Índices creados para mejor rendimiento');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error);
    process.exit(1);
  }
}

runMigration();
