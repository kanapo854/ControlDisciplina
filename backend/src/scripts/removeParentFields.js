const { sequelize } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración: Eliminar campos redundantes de padre/madre...\n');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, '..', '..', 'remove_parent_fields_from_students.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Ejecutar la migración
    console.log('📝 Ejecutando migración SQL...');
    await sequelize.query(sqlContent);

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\nCambios realizados:');
    console.log('  ❌ Eliminada columna: parent_name');
    console.log('  ❌ Eliminada columna: parent_phone');
    console.log('  ❌ Eliminada columna: parent_email');
    console.log('  ✅ Mantenida columna: parent_user_id (para vinculación con tabla users)\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al ejecutar la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar la migración
runMigration();
