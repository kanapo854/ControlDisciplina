const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Subject = require('./Subject');
const StudentSubject = require('./StudentSubject');
const Incident = require('./Incident');
const PasswordHistory = require('./PasswordHistory');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');

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

// Asociaciones User - PasswordHistory
User.hasMany(PasswordHistory, {
  foreignKey: 'userId',
  as: 'passwordHistory'
});

PasswordHistory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Asociaciones Role - Permission (muchos a muchos)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

// Asociaciones directas para acceder a la tabla intermedia
Role.hasMany(RolePermission, {
  foreignKey: 'roleId',
  as: 'rolePermissions'
});

Permission.hasMany(RolePermission, {
  foreignKey: 'permissionId',
  as: 'permissionRoles'
});

RolePermission.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

RolePermission.belongsTo(Permission, {
  foreignKey: 'permissionId',
  as: 'permission'
});

module.exports = {
  User,
  Student,
  Course,
  Subject,
  StudentSubject,
  Incident,
  PasswordHistory,
  Role,
  Permission,
  RolePermission
};