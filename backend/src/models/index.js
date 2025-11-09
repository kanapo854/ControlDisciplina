const User = require('./User');
const Student = require('./Student');
const Incident = require('./Incident');
const Course = require('./Course');
const Subject = require('./Subject');
const StudentSubject = require('./StudentSubject');
const PasswordHistory = require('./PasswordHistory');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');

// Las asociaciones están definidas en associations.js
// Este archivo solo exporta los modelos para compatibilidad

module.exports = {
  User,
  Student,
  Incident,
  Course,
  Subject,
  StudentSubject,
  PasswordHistory,
  Role,
  Permission,
  RolePermission
};