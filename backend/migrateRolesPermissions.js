const { sequelize } = require('./src/config/database');
const fs = require('fs').promises;
const path = require('path');

async function runRolesPermissionsMigration() {
  try {
    console.log('🚀 Iniciando migración de roles y permisos...');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'create_roles_permissions_tables.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    console.log('📄 Archivo SQL cargado');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Ejecutar el SQL
    await sequelize.query(sql);
    console.log('✅ Migración ejecutada exitosamente');

    // Verificar resultados
    const [roles] = await sequelize.query('SELECT COUNT(*) as count FROM roles');
    const [permissions] = await sequelize.query('SELECT COUNT(*) as count FROM permissions');
    const [rolePermissions] = await sequelize.query('SELECT COUNT(*) as count FROM role_permissions');

    console.log('\n📊 Resumen de migración:');
    console.log(`   - Roles creados: ${roles[0].count}`);
    console.log(`   - Permisos creados: ${permissions[0].count}`);
    console.log(`   - Asignaciones creadas: ${rolePermissions[0].count}`);

    console.log('\n✅ Migración completada exitosamente');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
runRolesPermissionsMigration();
