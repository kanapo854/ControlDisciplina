import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, PERMISSIONS, ROLES, getRoleLabel } from '../config/roles';
import {
  UserPlusIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const WelcomeSection = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    switch (user.role) {
      case ROLES.ADMIN_USUARIOS:
        return 'Gestiona usuarios del sistema y sus permisos';
      case ROLES.PROFESOR:
        return 'Registra y gestiona incidentes disciplinarios';
      case ROLES.PADRE_FAMILIA:
        return 'Consulta los incidentes de tus hijos';
      case ROLES.ADMIN_ESTUDIANTES:
        return 'Administra la información de los estudiantes';
      case ROLES.ADMIN_PROFESORES:
        return 'Gestiona los datos de los profesores';
      default:
        return 'Bienvenido al sistema de control disciplinario';
    }
  };

  const getQuickActions = () => {
    const actions = [];

    // Acciones para Admin Usuarios
    /*if (hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
      actions.push({
        title: 'Crear Usuario',
        description: 'Agregar nuevo usuario al sistema',
        href: '/usuarios/crear',
        icon: UserPlusIcon,
        color: 'bg-blue-500 hover:bg-blue-600'
      });
      actions.push({
        title: 'Ver Usuarios',
        description: 'Gestionar usuarios existentes',
        href: '/usuarios',
        icon: UserGroupIcon,
        color: 'bg-green-500 hover:bg-green-600'
      });
    }*/

    // Acciones para Admin Estudiantes
    /*if (hasPermission(user, PERMISSIONS.MANAGE_STUDENTS)) {
      actions.push({
        title: 'Crear Estudiante',
        description: 'Registrar nuevo estudiante',
        href: '/gestion-estudiantes/nuevo',
        icon: UserPlusIcon,
        color: 'bg-purple-500 hover:bg-purple-600'
      });
      actions.push({
        title: 'Ver Estudiantes',
        description: 'Gestionar estudiantes',
        href: '/gestion-estudiantes',
        icon: AcademicCapIcon,
        color: 'bg-indigo-500 hover:bg-indigo-600'
      });
    }*/

    // Acciones para Admin Profesores
    if (hasPermission(user, PERMISSIONS.MANAGE_TEACHERS)) {
      actions.push({
        title: 'Crear Profesor',
        description: 'Registrar nuevo profesor',
        href: '/profesores/crear',
        icon: UserPlusIcon,
        color: 'bg-teal-500 hover:bg-teal-600'
      });
      actions.push({
        title: 'Ver Profesores',
        description: 'Gestionar profesores',
        href: '/profesores',
        icon: UserGroupIcon,
        color: 'bg-cyan-500 hover:bg-cyan-600'
      });
    }

    // Acciones para Profesores
    if (hasPermission(user, PERMISSIONS.MANAGE_INCIDENTS)) {
      actions.push({
        title: 'Registrar Incidente',
        description: 'Reportar nuevo incidente',
        href: '/incidentes/crear',
        icon: ExclamationTriangleIcon,
        color: 'bg-orange-500 hover:bg-orange-600'
      });
      actions.push({
        title: 'Ver Incidentes',
        description: 'Gestionar incidentes',
        href: '/incidentes',
        icon: ChartBarIcon,
        color: 'bg-red-500 hover:bg-red-600'
      });
    }

    // Acciones para Padres de Familia
    if (hasPermission(user, PERMISSIONS.VIEW_OWN_CHILDREN_INCIDENTS)) {
      actions.push({
        title: 'Mis Hijos',
        description: 'Ver información de mis hijos',
        href: '/mis-hijos',
        icon: AcademicCapIcon,
        color: 'bg-pink-500 hover:bg-pink-600'
      });
      actions.push({
        title: 'Incidentes',
        description: 'Consultar incidentes',
        href: '/incidentes-hijos',
        icon: EyeIcon,
        color: 'bg-violet-500 hover:bg-violet-600'
      });
    }

    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {user.name}!
          </h1>
          <p className="text-lg text-gray-600 mb-1">
            {getRoleLabel(user.role)}
          </p>
          <p className="text-gray-500 mb-8">
            {getWelcomeMessage()}
          </p>
        </div>

        {quickActions.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className={`
                    ${action.color} 
                    text-white p-4 rounded-lg shadow-sm transition-all duration-200 
                    hover:shadow-md transform hover:-translate-y-1 block
                  `}
                >
                  <div className="flex items-center">
                    <action.icon className="h-6 w-6 mr-3" />
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeSection;