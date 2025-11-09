const Subject = require('../models/Subject');

const defaultSubjects = [
  // Materias para ambos niveles
  {
    name: 'Matemáticas',
    code: 'MAT',
    description: 'Aritmética, álgebra, geometría y cálculo básico',
    level: 'ambos',
    category: 'obligatoria',
    credits: 5,
    hoursPerWeek: 6
  },
  {
    name: 'Lengua Española',
    code: 'ESP',
    description: 'Gramática, literatura y comprensión lectora',
    level: 'ambos',
    category: 'obligatoria',
    credits: 5,
    hoursPerWeek: 5
  },
  {
    name: 'Ciencias Naturales',
    code: 'CNAT',
    description: 'Biología, química y física básica',
    level: 'ambos',
    category: 'obligatoria',
    credits: 4,
    hoursPerWeek: 4
  },
  {
    name: 'Ciencias Sociales',
    code: 'CSOC',
    description: 'Historia, geografía y civismo',
    level: 'ambos',
    category: 'obligatoria',
    credits: 4,
    hoursPerWeek: 4
  },
  {
    name: 'Inglés',
    code: 'ING',
    description: 'Idioma inglés básico e intermedio',
    level: 'ambos',
    category: 'obligatoria',
    credits: 3,
    hoursPerWeek: 3
  },
  {
    name: 'Educación Física',
    code: 'EDF',
    description: 'Actividad física y deportes',
    level: 'ambos',
    category: 'obligatoria',
    credits: 2,
    hoursPerWeek: 2
  },
  {
    name: 'Educación Artística',
    code: 'ART',
    description: 'Artes plásticas, música y expresión',
    level: 'ambos',
    category: 'obligatoria',
    credits: 2,
    hoursPerWeek: 2
  },
  
  // Materias específicas de secundaria
  {
    name: 'Física',
    code: 'FIS',
    description: 'Principios de física y mecánica',
    level: 'secundaria',
    category: 'obligatoria',
    credits: 4,
    hoursPerWeek: 4
  },
  {
    name: 'Química',
    code: 'QUI',
    description: 'Química básica y experimental',
    level: 'secundaria',
    category: 'obligatoria',
    credits: 4,
    hoursPerWeek: 4
  },
  {
    name: 'Biología',
    code: 'BIO',
    description: 'Estudio de los seres vivos',
    level: 'secundaria',
    category: 'obligatoria',
    credits: 4,
    hoursPerWeek: 4
  },
  {
    name: 'Historia Universal',
    code: 'HIST',
    description: 'Historia mundial y contemporánea',
    level: 'secundaria',
    category: 'obligatoria',
    credits: 3,
    hoursPerWeek: 3
  },
  {
    name: 'Geografía',
    code: 'GEO',
    description: 'Geografía física y humana',
    level: 'secundaria',
    category: 'obligatoria',
    credits: 3,
    hoursPerWeek: 3
  },
  {
    name: 'Filosofía',
    code: 'FIL',
    description: 'Introducción al pensamiento filosófico',
    level: 'secundaria',
    category: 'obligatoria',
    credits: 3,
    hoursPerWeek: 3
  },
  {
    name: 'Informática',
    code: 'INF',
    description: 'Computación y tecnología',
    level: 'secundaria',
    category: 'obligatoria',
    credits: 3,
    hoursPerWeek: 3
  },
  
  // Materias optativas
  {
    name: 'Francés',
    code: 'FRA',
    description: 'Idioma francés básico',
    level: 'secundaria',
    category: 'optativa',
    credits: 2,
    hoursPerWeek: 2
  },
  {
    name: 'Contabilidad',
    code: 'CONT',
    description: 'Principios de contabilidad y finanzas',
    level: 'secundaria',
    category: 'optativa',
    credits: 3,
    hoursPerWeek: 3
  },
  
  // Materias extracurriculares
  {
    name: 'Teatro',
    code: 'TEA',
    description: 'Artes escénicas y dramaturgia',
    level: 'ambos',
    category: 'extracurricular',
    credits: 1,
    hoursPerWeek: 2
  },
  {
    name: 'Robótica',
    code: 'ROB',
    description: 'Programación y robótica educativa',
    level: 'secundaria',
    category: 'extracurricular',
    credits: 2,
    hoursPerWeek: 2
  }
];

const seedSubjects = async () => {
  try {
    console.log('🌱 Iniciando creación de materias por defecto...');
    
    for (const subjectData of defaultSubjects) {
      const [subject, created] = await Subject.findOrCreate({
        where: { code: subjectData.code },
        defaults: subjectData
      });
      
      if (created) {
        console.log(`✅ Materia creada: ${subject.name} (${subject.code})`);
      } else {
        console.log(`⚪ Materia ya existe: ${subject.name} (${subject.code})`);
      }
    }
    
    console.log('🎯 Materias por defecto procesadas exitosamente');
  } catch (error) {
    console.error('❌ Error al crear materias por defecto:', error);
  }
};

module.exports = { seedSubjects, defaultSubjects };