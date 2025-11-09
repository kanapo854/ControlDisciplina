const User = require('./User');
const Student = require('./Student');
const Incident = require('./Incident');

// Definir relaciones entre modelos

// Usuario registra estudiantes
User.hasMany(Student, {
  foreignKey: 'registeredById',
  as: 'registeredStudents'
});
Student.belongsTo(User, {
  foreignKey: 'registeredById',
  as: 'registeredBy'
});

// Usuario reporta incidentes
User.hasMany(Incident, {
  foreignKey: 'reportedById',
  as: 'reportedIncidents'
});
Incident.belongsTo(User, {
  foreignKey: 'reportedById',
  as: 'reportedBy'
});

// Estudiante tiene incidentes
Student.hasMany(Incident, {
  foreignKey: 'studentId',
  as: 'incidents'
});
Incident.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});

module.exports = {
  User,
  Student,
  Incident
};