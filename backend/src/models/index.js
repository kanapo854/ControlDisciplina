const User = require('./User');
const Student = require('./Student');
const Incident = require('./Incident');
const Course = require('./Course');
const Subject = require('./Subject');
const StudentSubject = require('./StudentSubject');

// Las asociaciones están definidas en associations.js
// Este archivo solo exporta los modelos para compatibilidad

module.exports = {
  User,
  Student,
  Incident,
  Course,
  Subject,
  StudentSubject
};