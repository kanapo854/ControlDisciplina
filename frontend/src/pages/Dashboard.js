import React from 'react';
import { useQuery } from 'react-query';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { hasPermission, PERMISSIONS, ROLES } from '../config/roles';
import WelcomeSection from '../components/WelcomeSection';
import UserAdminDashboard from '../components/UserAdminDashboard';
import StudentAdminDashboard from '../components/StudentAdminDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Solo cargar estadísticas si el usuario tiene permisos para ver reportes
  // y NO es administrador de usuarios o estudiantes (que tienen su propio dashboard)
  const shouldLoadStats = user.role !== ROLES.ADMIN_USUARIOS && 
    user.role !== ROLES.ADMIN_ESTUDIANTES && (
    hasPermission(user, PERMISSIONS.VIEW_INCIDENTS) || 
    hasPermission(user, PERMISSIONS.MANAGE_USERS) ||
    hasPermission(user, PERMISSIONS.MANAGE_STUDENTS)
  );
  
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    reportService.getDashboard,
    {
      retry: 1,
      enabled: shouldLoadStats
    }
  );

  // Dashboard específico para administrador de usuarios
  if (user.role === ROLES.ADMIN_USUARIOS) {
    return (
      <div className="space-y-6">
        <WelcomeSection />
        <UserAdminDashboard />
      </div>
    );
  }

  // Dashboard específico para administrador de estudiantes
  if (user.role === ROLES.ADMIN_ESTUDIANTES) {
    return (
      <div className="space-y-6">
        <WelcomeSection />
        <StudentAdminDashboard />
      </div>
    );
  }

  // Mostrar solo la sección de bienvenida para padres de familia
  if (user.role === ROLES.PADRE_FAMILIA) {
    return (
      <div className="space-y-6">
        <WelcomeSection />
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Información para Padres de Familia
          </h2>
          <p className="text-gray-600 mb-4">
            Desde aquí puedes consultar los incidentes de tus hijos y mantenerte informado sobre su comportamiento escolar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Mis Hijos</h3>
              <p className="text-blue-700 text-sm">
                Consulta la información básica de tus hijos registrados en el sistema.
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Incidentes</h3>
              <p className="text-yellow-700 text-sm">
                Revisa los incidentes disciplinarios reportados por los profesores.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeSection />
      
      {shouldLoadStats && (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <AlertTriangle className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error al cargar estadísticas
              </h3>
              <p className="text-gray-500">
                {error.response?.data?.error || 'Error de conexión'}
              </p>
            </div>
          ) : (
            <DashboardStats dashboardData={dashboardData} />
          )}
        </>
      )}
    </div>
  );
};

// Componente separado para las estadísticas
const DashboardStats = ({ dashboardData }) => {
  const summary = dashboardData?.data?.summary || {};
  const charts = dashboardData?.data?.charts || {};

  const statsCards = [
    {
      title: 'Total Estudiantes',
      value: summary.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Incidentes',
      value: summary.totalIncidents || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Incidentes Pendientes',
      value: summary.pendingIncidents || 0,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Profesores Activos',
      value: summary.activeTeachers || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
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

      {/* Gráficos */}
      {charts && Object.keys(charts).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incidentes por mes */}
          {charts.incidentsByMonth && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Incidentes por Mes
                </h3>
                <div className="text-sm text-gray-500">
                  {/* Aquí podrías agregar un componente de gráfico */}
                  Datos disponibles para {charts.incidentsByMonth.length} meses
                </div>
              </div>
            </div>
          )}

          {/* Tipos de incidentes */}
          {charts.incidentsByType && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Tipos de Incidentes
                </h3>
                <div className="space-y-2">
                  {Object.entries(charts.incidentsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-sm text-gray-600">{type}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Dashboard;