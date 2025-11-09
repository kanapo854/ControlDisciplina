const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Subject = require('./Subject');
const StudentSubject = require('./StudentSubject');
const Incident = require('./Incident');

// Asociaciones Course - Student
Course.hasMany(Student, { 
  foreignKey: 'courseId', 
  as: 'students' 
});
Student.belongsTo(Course, { 
  foreignKey: 'courseId', 
  as: 'course' 
});

// Asociaciones Student - Subject (muchos a muchos)
Student.belongsToMany(Subject, {
  through: StudentSubject,
  foreignKey: 'studentId',
  otherKey: 'subjectId',
  as: 'subjects'
});

Subject.belongsToMany(Student, {
  through: StudentSubject,
  foreignKey: 'subjectId',
  otherKey: 'studentId',
  as: 'students'
});

// Asociación directa para acceder a la tabla intermedia
Student.hasMany(StudentSubject, {
  foreignKey: 'studentId',
  as: 'subjectEnrollments'
});

Subject.hasMany(StudentSubject, {
  foreignKey: 'subjectId',
  as: 'studentEnrollments'
});

StudentSubject.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});

StudentSubject.belongsTo(Subject, {
  foreignKey: 'subjectId',
  as: 'subject'
});

// Asociaciones User - Student (quién registró)
User.hasMany(Student, {
  foreignKey: 'registeredById',
  as: 'registeredStudents'
});

Student.belongsTo(User, {
  foreignKey: 'registeredById',
  as: 'registeredBy'
});

// Asociaciones User - Incident
User.hasMany(Incident, {
  foreignKey: 'reportedById',
  as: 'reportedIncidents'
});

Incident.belongsTo(User, {
  foreignKey: 'reportedById',
  as: 'reportedBy'
});

// Asociaciones Student - Incident
Student.hasMany(Incident, {
  foreignKey: 'studentId',
  as: 'incidents'
});

Incident.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});

// Asociaciones User (padre) - Student (hijo)
// Un padre puede tener múltiples hijos
User.hasMany(Student, {
  foreignKey: 'parentUserId',
  as: 'children'
});

// Un estudiante puede tener un padre (usuario del sistema)
Student.belongsTo(User, {
  foreignKey: 'parentUserId',
  as: 'parentUser'
});

module.exports = {
  User,
  Student,
  Course,
  Subject,
  StudentSubject,
  Incident
};