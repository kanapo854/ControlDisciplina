import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studentService, userService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import {
  UserGroupIcon,
  LinkIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const FamilyLinksManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });
  
  const queryClient = useQueryClient();

  // Obtener todos los estudiantes
  const { data: studentsData, isLoading: loadingStudents } = useQuery(
    'students-all',
    () => studentService.getStudents({ limit: 1000 })
  );

  // Obtener usuarios con rol de padre de familia
  const { data: parentsData, isLoading: loadingParents } = useQuery(
    'parents',
    () => userService.getUsers({ role: 'padrefamilia', limit: 1000 })
  );

  // Mutación para vincular padre con estudiante
  const linkMutation = useMutation(
    ({ studentId, parentUserId }) => 
      studentService.linkParentToStudent(studentId, parentUserId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students-all');
        setShowLinkForm(false);
        setSelectedStudent(null);
        setSelectedParent(null);
        setToast({
          show: true,
          type: 'success',
          title: 'Vinculación exitosa',
          message: 'El padre ha sido vinculado al estudiante correctamente'
        });
      },
      onError: (error) => {
        setToast({
          show: true,
          type: 'error',
          title: 'Error al vincular',
          message: error.response?.data?.error || 'No se pudo realizar la vinculación'
        });
      }
    }
  );

  // Mutación para desvincular padre de estudiante
  const unlinkMutation = useMutation(
    (studentId) => studentService.unlinkParentFromStudent(studentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students-all');
        setToast({
          show: true,
          type: 'success',
          title: 'Desvinculación exitosa',
          message: 'El padre ha sido desvinculado del estudiante'
        });
      },
      onError: (error) => {
        setToast({
          show: true,
          type: 'error',
          title: 'Error al desvincular',
          message: error.response?.data?.error || 'No se pudo realizar la desvinculación'
        });
      }
    }
  );

  const students = studentsData?.data || [];
  const parents = parentsData?.data || [];

  // Filtrar estudiantes según búsqueda
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.documentNumber.includes(searchTerm)
  );

  const handleLink = () => {
    if (selectedStudent && selectedParent) {
      linkMutation.mutate({
        studentId: selectedStudent.id,
        parentUserId: selectedParent.id
      });
    }
  };

  const handleUnlink = (studentId) => {
    if (window.confirm('¿Está seguro de que desea desvincular este padre del estudiante?')) {
      unlinkMutation.mutate(studentId);
    }
  };

  if (loadingStudents || loadingParents) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <UserGroupIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Relaciones Familiares</h1>
            <p className="text-indigo-100">Vincular padres de familia con sus hijos estudiantes</p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vinculados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {students.filter(s => s.parentUserId).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Padres Registrados</p>
              <p className="text-2xl font-semibold text-gray-900">{parents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar estudiante por nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button
            onClick={() => setShowLinkForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Vinculación
          </button>
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Estudiantes y sus Vinculaciones</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Padre Vinculado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.documentType}: {student.documentNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.course?.name || 'Sin curso asignado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.parentUser ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.parentUser.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.parentUser.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin vinculación</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.parentUserId ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Vinculado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Sin vincular
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {student.parentUserId ? (
                      <button
                        onClick={() => handleUnlink(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowLinkForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para nueva vinculación */}
      {showLinkForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Nueva Vinculación Familiar
                </h3>
                <button
                  onClick={() => {
                    setShowLinkForm(false);
                    setSelectedStudent(null);
                    setSelectedParent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Selector de estudiante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estudiante
                  </label>
                  <select
                    value={selectedStudent?.id || ''}
                    onChange={(e) => {
                      const student = students.find(s => s.id === e.target.value);
                      setSelectedStudent(student);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar estudiante</option>
                    {students
                      .filter(s => !s.parentUserId)
                      .map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - {student.documentNumber}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selector de padre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Padre de Familia
                  </label>
                  <select
                    value={selectedParent?.id || ''}
                    onChange={(e) => {
                      const parent = parents.find(p => p.id === e.target.value);
                      setSelectedParent(parent);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar padre</option>
                    {parents.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} - {parent.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowLinkForm(false);
                    setSelectedStudent(null);
                    setSelectedParent(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLink}
                  disabled={!selectedStudent || !selectedParent || linkMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linkMutation.isLoading ? 'Vinculando...' : 'Vincular'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notificaciones */}
      {toast.show && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default FamilyLinksManager;