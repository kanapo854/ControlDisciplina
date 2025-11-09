const { sequelize } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  try {
    console.log('🔐 Iniciando migración: Campos de bloqueo de cuenta...\n');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, '..', '..', 'add_account_lockout_fields.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Ejecutar la migración
    console.log('📝 Ejecutando migración SQL...');
    await sequelize.query(sqlContent);

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\nCampos agregados a la tabla users:');
    console.log('  ✅ failed_login_attempts (INTEGER) - Contador de intentos fallidos');
    console.log('  ✅ account_locked_until (TIMESTAMP) - Fecha de desbloqueo automático');
    console.log('\nPolítica de bloqueo configurada:');
    console.log('  🔢 Máximo de intentos: 5');
    console.log('  ⏱️  Duración del bloqueo: 15 minutos');
    console.log('  🔄 Desbloqueo automático tras expiración');
    console.log('  ✅ Reset de contador tras login exitoso\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al ejecutar la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar la migración
runMigration();
