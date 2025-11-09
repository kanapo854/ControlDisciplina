import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import { ROLE_LABELS } from '../config/roles';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  UsersIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const UserAdminDashboard = () => {
  const { data: statsData, isLoading, error } = useQuery(
    'userStats',
    userService.getUserStats,
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

  const { summary, charts, latestUsers } = statsData?.data || {};

  const statsCards = [
    {
      title: 'Total de Usuarios',
      value: summary?.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Usuarios Activos',
      value: summary?.activeUsers || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Usuarios Inactivos',
      value: summary?.inactiveUsers || 0,
      icon: XCircleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Nuevos (30 días)',
      value: summary?.recentUsers || 0,
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
              Panel de Administración de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos los usuarios del sistema desde aquí
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/usuarios/crear"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Crear Usuario
            </Link>
            <Link
              to="/usuarios"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Gestionar Usuarios
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
        {/* Distribución por roles */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Usuarios por Rol
            </h3>
            <div className="space-y-3">
              {charts?.usersByRole && Object.entries(charts.usersByRole).map(([role, count]) => {
                const percentage = summary?.totalUsers > 0 ? ((count / summary.totalUsers) * 100).toFixed(1) : 0;
                return (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                      <span className="ml-3 text-sm text-gray-600">
                        {ROLE_LABELS[role] || role}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <span className="ml-2 text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Usuarios recientes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Usuarios Recientes
            </h3>
            <div className="space-y-3">
              {latestUsers && latestUsers.length > 0 ? (
                latestUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay usuarios recientes</p>
              )}
            </div>
            {latestUsers && latestUsers.length > 0 && (
              <div className="mt-4">
                <Link
                  to="/usuarios"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todos los usuarios →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Estado del Sistema de Usuarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usuarios Activos</span>
                <span className="text-lg font-semibold text-green-600">
                  {charts?.usersByStatus?.active || 0}
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${summary?.totalUsers > 0 ? ((charts?.usersByStatus?.active || 0) / summary.totalUsers * 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usuarios Inactivos</span>
                <span className="text-lg font-semibold text-red-600">
                  {charts?.usersByStatus?.inactive || 0}
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ 
                    width: `${summary?.totalUsers > 0 ? ((charts?.usersByStatus?.inactive || 0) / summary.totalUsers * 100) : 0}%` 
                  }}
                ></div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/usuarios/crear"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlusIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Crear Usuario</p>
                <p className="text-sm text-gray-500">Agregar nuevo usuario al sistema</p>
              </div>
            </Link>
            <Link
              to="/usuarios"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CogIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Gestionar Usuarios</p>
                <p className="text-sm text-gray-500">Ver, editar y administrar usuarios</p>
              </div>
            </Link>
            <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
              <UsersIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-3">
                <p className="font-medium text-gray-500">Reportes</p>
                <p className="text-sm text-gray-400">Próximamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAdminDashboard;