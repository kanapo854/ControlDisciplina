import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '../services/api';
import { ROLE_LABELS } from '../config/roles';
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const UsersList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: usersData, isLoading, error } = useQuery(
    ['users', { search, role: roleFilter, isActive: statusFilter }],
    () => userService.getUsers({ 
      search: search || undefined, 
      role: roleFilter || undefined,
      isActive: statusFilter || undefined
    }),
    {
      keepPreviousData: true
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, isActive }) => userService.updateUserStatus(id, { isActive }),
    {
      onSuccess: (data) => {
        toast.success(data.message || 'Estado actualizado exitosamente');
        queryClient.invalidateQueries('users');
        setShowStatusModal(false);
        setSelectedUser(null);
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Error al actualizar estado';
        toast.error(message);
      }
    }
  );

  const handleStatusToggle = (user) => {
    setSelectedUser(user);
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (selectedUser) {
      updateStatusMutation.mutate({
        id: selectedUser.id,
        isActive: !selectedUser.isActive
      });
    }
  };

  const users = usersData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          Error al cargar usuarios
        </h3>
        <p className="text-gray-500">
          {error.response?.data?.error || 'Error de conexión'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Lista de Usuarios ({users.length})
          </h2>
          <div className="mt-3 sm:mt-0 flex space-x-3">
            <Link
              to="relaciones-familiares"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Relaciones Familiares
            </Link>
            <Link
              to="crear"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Crear Usuario
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Filtro por rol */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todos los roles</option>
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <option key={role} value={role}>{label}</option>
            ))}
          </select>

          {/* Filtro por estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carnet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.carnet || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('es-ES')
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to={`editar/${user.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar usuario"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleStatusToggle(user)}
                      className={`${
                        user.isActive 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {user.isActive ? (
                        <XCircleIcon className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <UserPlusIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-500">
              {search || roleFilter || statusFilter 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando el primer usuario'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación de cambio de estado */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                selectedUser.isActive ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {selectedUser.isActive ? (
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                )}
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                {selectedUser.isActive ? 'Desactivar Usuario' : 'Activar Usuario'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro que deseas {selectedUser.isActive ? 'desactivar' : 'activar'} al usuario{' '}
                  <span className="font-medium">{selectedUser.name}</span>?
                </p>
                {selectedUser.isActive && (
                  <p className="text-xs text-red-600 mt-2">
                    Un usuario desactivado no podrá acceder al sistema.
                  </p>
                )}
              </div>
              <div className="items-center px-4 py-3 space-x-3 flex justify-center">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-white text-gray-500 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={updateStatusMutation.isLoading}
                  className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 ${
                    selectedUser.isActive
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {updateStatusMutation.isLoading 
                    ? 'Procesando...' 
                    : selectedUser.isActive ? 'Desactivar' : 'Activar'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;