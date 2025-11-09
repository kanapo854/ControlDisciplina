/**
 * Script para migrar usuarios existentes a los nuevos roles
 */

const User = require('../models/User');
const { sequelize } = require('../config/database');

const migrateUserRoles = async () => {
  try {
    console.log('🔄 Iniciando migración de roles de usuarios...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Actualizar usuarios con rol 'admin' a 'adminusuarios'
    const [updatedAdmins] = await User.update(
      { role: 'adminusuarios' },
      { 
        where: { role: 'admin' },
        returning: true 
      }
    );

    console.log(`✅ ${updatedAdmins} usuarios admin actualizados a adminusuarios`);

    // Actualizar usuarios con rol 'coordinador' a 'adminusuarios' 
    const [updatedCoordinadores] = await User.update(
      { role: 'adminusuarios' },
      { 
        where: { role: 'coordinador' },
        returning: true 
      }
    );

    console.log(`✅ ${updatedCoordinadores} usuarios coordinador actualizados a adminusuarios`);

    // Actualizar usuarios con rol 'estudiante' a 'padrefamilia' (asumiendo que son padres)
    const [updatedEstudiantes] = await User.update(
      { role: 'padrefamilia' },
      { 
        where: { role: 'estudiante' },
        returning: true 
      }
    );

    console.log(`✅ ${updatedEstudiantes} usuarios estudiante actualizados a padrefamilia`);

    // Mostrar usuarios actualizados
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive']
    });

    console.log('\n📋 Usuarios después de la migración:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Rol: ${user.role} - Activo: ${user.isActive}`);
    });

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar la migración si el archivo se ejecuta directamente
if (require.main === module) {
  migrateUserRoles();
}

module.exports = { migrateUserRoles };