const { sequelize } = require('./src/config/database');
const Course = require('./src/models/Course');

const seedCourses = async () => {
  try {
    console.log('🌱 Iniciando seeder de cursos...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si ya existen cursos
    const existingCourses = await Course.count();
    if (existingCourses > 0) {
      console.log(`ℹ️  Ya existen ${existingCourses} cursos en la base de datos`);
      console.log('🔄 Eliminando cursos existentes para recrear...');
      await Course.destroy({ where: {} });
    }

    // Cursos de primaria
    const primaryCourses = [];
    for (let grade = 1; grade <= 6; grade++) {
      for (const section of ['A', 'B']) {
        primaryCourses.push({
          name: `${grade}° Primaria ${section}`,
          level: 'primaria',
          grade: grade,
          section: section,
          academicYear: 2025,
          capacity: 30,
          isActive: true
        });
      }
    }

    // Cursos de secundaria
    const secondaryCourses = [];
    for (let grade = 1; grade <= 5; grade++) {
      for (const section of ['A', 'B', 'C']) {
        secondaryCourses.push({
          name: `${grade}° Secundaria ${section}`,
          level: 'secundaria',
          grade: grade,
          section: section,
          academicYear: 2025,
          capacity: 35,
          isActive: true
        });
      }
    }

    // Insertar cursos en la base de datos
    const allCourses = [...primaryCourses, ...secondaryCourses];
    
    console.log(`📚 Creando ${allCourses.length} cursos...`);
    
    const createdCourses = await Course.bulkCreate(allCourses);
    
    console.log(`✅ Se crearon ${createdCourses.length} cursos exitosamente:`);
    console.log(`   - ${primaryCourses.length} cursos de primaria`);
    console.log(`   - ${secondaryCourses.length} cursos de secundaria`);
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de cursos creados:');
    const sampleCourses = createdCourses.slice(0, 5);
    sampleCourses.forEach(course => {
      console.log(`   - ${course.name} (${course.level}, capacidad: ${course.capacity})`);
    });
    
    if (createdCourses.length > 5) {
      console.log(`   ... y ${createdCourses.length - 5} más`);
    }

  } catch (error) {
    console.error('❌ Error al crear cursos:', error);
    throw error;
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
};

// Ejecutar el seeder si se llama directamente
if (require.main === module) {
  seedCourses()
    .then(() => {
      console.log('🎉 Seeder de cursos completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el seeder de cursos:', error);
      process.exit(1);
    });
}

module.exports = seedCourses;