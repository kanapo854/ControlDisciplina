import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { studentService, enrollmentService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import {
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserGroupIcon,
  HeartIcon,
  PencilIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Obtener datos del estudiante
  const { data: studentData, isLoading: loadingStudent, error: studentError } = useQuery(
    ['student', id],
    () => studentService.getStudent(id)
  );

  // Obtener inscripciones del estudiante
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery(
    ['student-enrollments', id],
    () => enrollmentService.getStudentEnrollments(id),
    {
      enabled: !!id
    }
  );

  if (loadingStudent) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (studentError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <XCircleIcon className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar estudiante
        </h3>
        <p className="text-gray-500 mb-4">
          {studentError.response?.data?.error || 'No se pudo cargar la información del estudiante'}
        </p>
        <button
          onClick={() => navigate('/estudiantes')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a la lista
        </button>
      </div>
    );
  }

  const student = studentData?.data;
  const enrollments = enrollmentsData?.data?.periods || [];

  if (!student) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Estudiante no encontrado
        </h3>
        <button
          onClick={() => navigate('/estudiantes')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a la lista
        </button>
      </div>
    );
  }

  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'inscrito': 'bg-blue-100 text-blue-800',
      'aprobado': 'bg-green-100 text-green-800',
      'reprobado': 'bg-red-100 text-red-800',
      'retirado': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/estudiantes')}
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Volver
            </button>
            <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-gray-700">
                {student.firstName?.charAt(0)?.toUpperCase()}{student.lastName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{student.documentType}: {student.documentNumber}</span>
                <span>•</span>
                <span>{student.grade} - Sección {student.section}</span>
                <span>•</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  student.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/gestion-estudiantes"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Volver a la lista
            </Link>
            <Link
              to={`/gestion-estudiantes/${id}/editar`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="text-gray-900">{student.firstName} {student.lastName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Documento</label>
                <p className="text-gray-900">{student.documentType}: {student.documentNumber}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                <p className="text-gray-900">
                  {student.birthDate ? new Date(student.birthDate).toLocaleDateString('es-ES') : 'N/A'}
                  <span className="text-gray-500 ml-2">({getAge(student.birthDate)} años)</span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Género</label>
                <p className="text-gray-900 capitalize">{student.gender}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Inscripción</label>
                <p className="text-gray-900">
                  {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Información Académica */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Información Académica</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Grado y Sección</label>
                <p className="text-gray-900">{student.grade} - Sección {student.section}</p>
              </div>
              
              {student.course && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Curso</label>
                  <p className="text-gray-900">{student.course.name}</p>
                  <p className="text-sm text-gray-500">{student.course.level}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <PhoneIcon className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Contacto</h3>
            </div>
            
            <div className="space-y-3">
              {student.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-gray-900">{student.phone}</p>
                </div>
              )}
              
              {student.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{student.email}</p>
                </div>
              )}
              
              {student.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-gray-900">{student.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información del Padre/Madre y Inscripciones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Padre/Madre/Acudiente */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-orange-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Padre/Madre/Acudiente</h3>
              </div>
              {!student.parentUser && (
                <Link
                  to={`/gestion-estudiantes/${id}/vinculos`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Gestionar vínculos
                </Link>
              )}
            </div>
            
            {student.parentUser ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-gray-900">{student.parentUser.name}</p>
                </div>
                
                {student.parentUser.carnet && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Carnet</label>
                    <p className="text-gray-900">{student.parentUser.carnet}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{student.parentUser.email}</p>
                </div>
                
                {student.parentUser.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-gray-900">{student.parentUser.phone}</p>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <Link
                    to={`/gestion-estudiantes/${id}/vinculos`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Modificar vinculación
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start">
                  <UserGroupIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800">No hay padre/madre vinculado</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Este estudiante aún no tiene un padre/madre/acudiente vinculado en el sistema.
                    </p>
                    <Link
                      to={`/gestion-estudiantes/${id}/vinculos`}
                      className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Vincular padre/madre
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {student.emergencyContact && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500">Contacto de Emergencia</label>
                <p className="text-gray-900 mt-1">{student.emergencyContact}</p>
              </div>
            )}
          </div>

          {/* Inscripciones en Materias */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BookOpenIcon className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Inscripciones en Materias</h3>
              </div>
              <Link
                to={`/gestion-estudiantes/${id}/materias`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
              >
                Gestionar Inscripciones
              </Link>
            </div>
            
            {loadingEnrollments ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin inscripciones</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Este estudiante no tiene inscripciones en materias.
                </p>
                <div className="mt-6">
                  <Link
                    to={`/gestion-estudiantes/${id}/materias`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Inscribir en Materias
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {enrollments.map((period) => (
                  <div key={`${period.academicYear}-${period.semester}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-md font-medium text-gray-900">
                          {period.semester === 'anual' ? 'Año' : `Semestre ${period.semester}`} {period.academicYear}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{period.totalSubjects} materias</span>
                          <span>•</span>
                          <span>{period.totalCredits} créditos</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          period.totalSubjects >= 6 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {period.totalSubjects >= 6 ? 'Completo' : 'Incompleto'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {period.enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {enrollment.subject.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {enrollment.subject.code} • {enrollment.subject.credits} créditos
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(enrollment.status)}
                            {enrollment.finalGrade && (
                              <p className="text-xs text-gray-500 mt-1">
                                Nota: {enrollment.finalGrade}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {period.totalSubjects < 6 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex">
                          <ClockIcon className="h-5 w-5 text-yellow-400" />
                          <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                              El estudiante necesita {6 - period.totalSubjects} materias adicionales para cumplir con el mínimo requerido.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información Adicional */}
          {(student.medicalInfo || student.notes) && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Información Adicional</h3>
              </div>
              
              <div className="space-y-4">
                {student.medicalInfo && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Información Médica</label>
                    <p className="text-gray-900 mt-1">{student.medicalInfo}</p>
                  </div>
                )}
                
                {student.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notas</label>
                    <p className="text-gray-900 mt-1">{student.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;