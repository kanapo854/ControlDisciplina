import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studentService, subjectService, enrollmentService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import {
  BookOpenIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const EnrollmentManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('anual');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener datos del estudiante
  const { data: studentData, isLoading: loadingStudent } = useQuery(
    ['student', id],
    () => studentService.getStudent(id)
  );

  // Obtener materias disponibles
  const { data: subjectsData, isLoading: loadingSubjects } = useQuery(
    'subjects',
    () => subjectService.getSubjects({ isActive: true })
  );

  // Obtener inscripciones actuales del estudiante
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery(
    ['student-enrollments', id, academicYear, semester],
    () => enrollmentService.getStudentEnrollments(id, { academicYear, semester }),
    {
      enabled: !!id
    }
  );

  // Validar inscripciones mínimas
  const { data: validationData } = useQuery(
    ['enrollment-validation', id, academicYear, semester],
    () => enrollmentService.validateEnrollments(id, { academicYear, semester }),
    {
      enabled: !!id
    }
  );

  // Mutación para inscribir estudiante
  const enrollMutation = useMutation(
    (data) => enrollmentService.enrollStudent(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['student-enrollments', id]);
        queryClient.invalidateQueries(['enrollment-validation', id]);
        setSelectedSubjects([]);
        setErrors({});
      },
      onError: (error) => {
        setErrors({ 
          general: error.response?.data?.error || 'Error al inscribir al estudiante' 
        });
      }
    }
  );

  // Mutación para eliminar inscripción
  const deleteEnrollmentMutation = useMutation(
    (enrollmentId) => enrollmentService.deleteEnrollment(enrollmentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['student-enrollments', id]);
        queryClient.invalidateQueries(['enrollment-validation', id]);
      }
    }
  );

  const student = studentData?.data;
  const subjects = subjectsData?.data || [];
  const currentEnrollments = enrollmentsData?.data?.periods?.[0]?.enrollments || [];
  const validation = validationData?.data;

  // Filtrar materias disponibles (no inscritas)
  const availableSubjects = subjects.filter(subject => 
    !currentEnrollments.some(enrollment => enrollment.subject.id === subject.id)
  );

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedSubjects.length === 0) {
      setErrors({ general: 'Debe seleccionar al menos una materia' });
      return;
    }

    // Validar que no exceda el límite de materias
    const totalAfterEnrollment = currentEnrollments.length + selectedSubjects.length;
    if (totalAfterEnrollment > 12) {
      setErrors({ 
        general: `No se pueden inscribir más de 12 materias. Actualmente tiene ${currentEnrollments.length} materias.` 
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await enrollMutation.mutateAsync({
        studentId: id,
        subjectIds: selectedSubjects,
        academicYear,
        semester
      });
    } catch (error) {
      // Error ya manejado en la mutación
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (window.confirm('¿Está seguro de eliminar esta inscripción?')) {
      try {
        await deleteEnrollmentMutation.mutateAsync(enrollmentId);
      } catch (error) {
        alert('Error al eliminar la inscripción');
      }
    }
  };

  if (loadingStudent || loadingSubjects || loadingEnrollments) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/estudiantes/${id}`)}
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Volver
            </button>
            <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-700">
                {student.firstName?.charAt(0)?.toUpperCase()}{student.lastName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Inscripciones
              </h1>
              <p className="text-gray-600">
                {student.firstName} {student.lastName} - {student.grade} {student.section}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración del período */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
              Año Académico
            </label>
            <select
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(parseInt(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          </div>
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="anual">Anual</option>
              <option value="1">Primer Semestre</option>
              <option value="2">Segundo Semestre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estado de validación */}
      {validation && (
        <div className={`rounded-lg p-4 ${
          validation.isValid 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            {validation.isValid ? (
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            )}
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                validation.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                Estado de Inscripciones
              </h3>
              <div className={`mt-2 text-sm ${
                validation.isValid ? 'text-green-700' : 'text-red-700'
              }`}>
                <p>{validation.message}</p>
                <p className="mt-1">
                  Inscrito en: {validation.enrollmentCount} materias • 
                  Mínimo requerido: {validation.minimumRequired} materias
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materias Inscritas */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpenIcon className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Materias Inscritas ({currentEnrollments.length})
              </h3>
            </div>
          </div>

          {currentEnrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin inscripciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay materias inscritas para este período.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {enrollment.subject.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{enrollment.subject.code}</span>
                      <span>•</span>
                      <span>{enrollment.subject.credits} créditos</span>
                      <span>•</span>
                      <span className="capitalize">{enrollment.subject.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      enrollment.status === 'inscrito' ? 'bg-blue-100 text-blue-800' :
                      enrollment.status === 'aprobado' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'reprobado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </span>
                    <button
                      onClick={() => handleDeleteEnrollment(enrollment.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar inscripción"
                      disabled={deleteEnrollmentMutation.isLoading}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inscribir en Nuevas Materias */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <PlusIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Inscribir en Materias ({availableSubjects.length} disponibles)
            </h3>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            {availableSubjects.length === 0 ? (
              <div className="text-center py-8">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay materias disponibles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Todas las materias activas ya están inscritas para este período.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableSubjects.map((subject) => (
                    <label key={subject.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={() => handleSubjectToggle(subject.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {subject.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{subject.code}</span>
                          <span>•</span>
                          <span>{subject.credits} créditos</span>
                          <span>•</span>
                          <span>{subject.hoursPerWeek}h/semana</span>
                          <span>•</span>
                          <span className="capitalize">{subject.category}</span>
                        </div>
                        {subject.description && (
                          <p className="text-xs text-gray-400 mt-1">{subject.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {selectedSubjects.length} materia(s) seleccionada(s)
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Total después de inscripción: {currentEnrollments.length + selectedSubjects.length} materias
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={selectedSubjects.length === 0 || isSubmitting || enrollMutation.isLoading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || enrollMutation.isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Inscribiendo...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Inscribir ({selectedSubjects.length})
                      </>
                    )}
                  </button>
                  
                  {selectedSubjects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubjects([])}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Información de ayuda */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Información importante
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Cada estudiante debe estar inscrito en un mínimo de 6 materias</li>
                <li>El máximo de materias por período es 12</li>
                <li>Las materias obligatorias deben completarse antes que las optativas</li>
                <li>Los cambios en las inscripciones pueden afectar el horario del estudiante</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManager;