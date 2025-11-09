import React from 'react';
import { useQuery } from 'react-query';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { hasPermission, PERMISSIONS, ROLES } from '../config/roles';
import WelcomeSection from '../components/WelcomeSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Solo cargar estadísticas si el usuario tiene permisos para ver reportes
  const shouldLoadStats = hasPermission(user, PERMISSIONS.VIEW_INCIDENTS) || 
                          hasPermission(user, PERMISSIONS.MANAGE_USERS) ||
                          hasPermission(user, PERMISSIONS.MANAGE_STUDENTS);
  
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    reportService.getDashboard,
    {
      retry: 1,
      enabled: shouldLoadStats
    }
  );

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
      title: 'Incidentes Este Mes',
      value: summary.incidentsThisMonth || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Pendientes',
      value: summary.pendingIncidents || 0,
      icon: Clock,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  const getIncidentTypeLabel = (type) => {
    const labels = {
      'leve': 'Leve',
      'grave': 'Grave',
      'muy_grave': 'Muy Grave',
      'agresion': 'Agresión',
      'bullying': 'Bullying',
      'vandalismo': 'Vandalismo',
      'inasistencia': 'Inasistencia',
      'tardanza': 'Tardanza',
      'uniforme': 'Uniforme',
      'conducta': 'Conducta',
      'academico': 'Académico',
      'otro': 'Otro'
    };
    return labels[type] || type;
  };

  const getSeverityLabel = (severity) => {
    const labels = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'critica': 'Crítica'
    };
    return labels[severity] || severity;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'baja': 'bg-green-100 text-green-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-orange-100 text-orange-800',
      'critica': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600">
          Resumen del sistema de control de disciplina
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
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
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidentes por Tipo */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Incidentes por Tipo
          </h3>
          <div className="space-y-3">
            {charts.incidentsByType?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {getIncidentTypeLabel(item._id)}
                </span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ 
                        width: `${(item.count / Math.max(...(charts.incidentsByType?.map(i => i.count) || [1]))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidentes por Severidad */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Incidentes por Severidad
          </h3>
          <div className="space-y-3">
            {charts.incidentsBySeverity?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`badge ${getSeverityColor(item._id)}`}>
                  {getSeverityLabel(item._id)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Estudiantes con más Incidentes */}
      {charts.topStudentsWithIncidents?.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Estudiantes con Más Incidentes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incidentes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {charts.topStudentsWithIncidents.slice(0, 5).map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-warning">
                        {student.incidentCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/incidents/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Nuevo Incidente</p>
              <p className="text-sm text-gray-500">Registrar un nuevo incidente</p>
            </div>
          </a>
          
          <a 
            href="/students/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Nuevo Estudiante</p>
              <p className="text-sm text-gray-500">Registrar un estudiante</p>
            </div>
          </a>
          
          <a 
            href="/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Ver Reportes</p>
              <p className="text-sm text-gray-500">Analizar estadísticas</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;