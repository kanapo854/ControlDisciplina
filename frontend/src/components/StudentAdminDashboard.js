import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { studentService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import {
  AcademicCapIcon,
  UserPlusIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const StudentAdminDashboard = () => {
  const { data: statsData, isLoading, error } = useQuery(
    'studentStats',
    studentService.getStudentStats,
    {
      retry: 1,
      refetchInterval: 30000 // Actualizar cada 30 segundos
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <XCircleIcon className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar estadísticas
        </h3>
        <p className="text-gray-500">
          {error.response?.data?.error || 'Error de conexión'}
        </p>
      </div>
    );
  }

  const { overview, demographics, academic } = statsData?.data || {};

  const statsCards = [
    {
      title: 'Total Estudiantes',
      value: overview?.totalStudents || 0,
      icon: AcademicCapIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Estudiantes Activos',
      value: overview?.activeStudents || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Inscripciones Incompletas',
      value: academic?.incompleteEnrollments || 0,
      icon: XCircleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Año Académico',
      value: overview?.currentAcademicYear || new Date().getFullYear(),
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de Administración de Estudiantes
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona estudiantes, cursos y materias del sistema educativo
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/gestion-estudiantes/nuevo"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Nuevo Estudiante
            </Link>
            <Link
              to="/gestion-estudiantes"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Ver Estudiantes
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por género */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Distribución por Género
            </h3>
            <div className="space-y-3">
              {demographics?.gender && demographics.gender.map((item) => {
                const percentage = overview?.activeStudents > 0 ? ((item.count / overview.activeStudents) * 100).toFixed(1) : 0;
                return (
                  <div key={item.gender} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          item.gender === 'masculino' ? 'bg-blue-500' : 
                          item.gender === 'femenino' ? 'bg-pink-500' : 'bg-gray-500'
                        }`}></div>
                      </div>
                      <span className="ml-3 text-sm text-gray-600 capitalize">
                        {item.gender}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      <span className="ml-2 text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Materias más populares */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Materias Más Populares
            </h3>
            <div className="space-y-3">
              {academic?.popularSubjects && academic.popularSubjects.slice(0, 5).map((subject, index) => (
                <div key={subject.subjectName} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {subject.subjectName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {subject.code} - {subject.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{subject.enrollmentCount}</span>
                    <p className="text-xs text-gray-500">inscripciones</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No hay datos de inscripciones</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rendimiento académico */}
      {academic?.academicPerformance && academic.academicPerformance.length > 0 && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Rendimiento Académico {overview?.currentAcademicYear}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {academic.academicPerformance.map((perf) => {
                const statusColors = {
                  'inscrito': 'bg-blue-100 text-blue-800',
                  'aprobado': 'bg-green-100 text-green-800',
                  'reprobado': 'bg-red-100 text-red-800',
                  'retirado': 'bg-gray-100 text-gray-800'
                };
                
                return (
                  <div key={perf.status} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[perf.status] || 'bg-gray-100 text-gray-800'}`}>
                        {perf.status.charAt(0).toUpperCase() + perf.status.slice(1)}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">{perf.count}</span>
                    </div>
                    {perf.averageGrade && (
                      <div className="text-xs text-gray-500">
                        Promedio: {perf.averageGrade}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Estado del sistema académico */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Estado del Sistema Académico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estudiantes por Grado</span>
                <span className="text-lg font-semibold text-blue-600">
                  {demographics?.grades?.length || 0}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Grados activos en el sistema
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cursos Disponibles</span>
                <span className="text-lg font-semibold text-green-600">
                  {demographics?.courses?.length || 0}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Para nivel secundaria
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Inscripciones Incompletas</span>
                <span className="text-lg font-semibold text-red-600">
                  {academic?.incompleteEnrollments || 0}
                </span>
              </div>
              <div className="mt-2 text-xs text-red-500">
                Estudiantes con menos de 6 materias
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/gestion-estudiantes/nuevo"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlusIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Nuevo Estudiante</p>
                <p className="text-sm text-gray-500">Registrar estudiante</p>
              </div>
            </Link>
            <Link
              to="/cursos"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BuildingLibraryIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Gestionar Cursos</p>
                <p className="text-sm text-gray-500">Administrar cursos</p>
              </div>
            </Link>
            <Link
              to="/materias"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpenIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Gestionar Materias</p>
                <p className="text-sm text-gray-500">Administrar materias</p>
              </div>
            </Link>
            <Link
              to="/matriculas"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AcademicCapIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Gestionar Matrículas</p>
                <p className="text-sm text-gray-500">Administrar inscripciones</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAdminDashboard;