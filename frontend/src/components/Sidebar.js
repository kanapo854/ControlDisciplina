import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, PERMISSIONS, ROLES, getRoleLabel } from '../config/roles';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    // Dashboard - disponible para todos
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      show: true
    },
    
    // Gestión de usuarios - solo adminusuarios
    {
      name: 'Usuarios',
      href: '/usuarios',
      icon: UserGroupIcon,
      show: hasPermission(user, PERMISSIONS.MANAGE_USERS)
    },
    
    // Gestión de estudiantes - admin estudiantes y profesores (solo ver)
    {
      name: 'Estudiantes',
      href: '/estudiantes',
      icon: AcademicCapIcon,
      show: hasPermission(user, PERMISSIONS.MANAGE_STUDENTS) || hasPermission(user, PERMISSIONS.VIEW_STUDENTS)
    },
    
    // Gestión de profesores - solo admin profesores
    {
      name: 'Profesores',
      href: '/profesores',
      icon: UserIcon,
      show: hasPermission(user, PERMISSIONS.MANAGE_TEACHERS)
    },
    
    // Gestión de incidentes - profesores y padres
    {
      name: 'Incidentes',
      href: '/incidentes',
      icon: ExclamationTriangleIcon,
      show: hasPermission(user, PERMISSIONS.MANAGE_INCIDENTS) || hasPermission(user, PERMISSIONS.VIEW_INCIDENTS)
    },
    
    // Incidentes de hijos - solo padres de familia
    {
      name: 'Mis Hijos',
      href: '/mis-hijos',
      icon: AcademicCapIcon,
      show: hasPermission(user, PERMISSIONS.VIEW_OWN_CHILDREN_INCIDENTS)
    },
    
    // Reportes - disponible para roles administrativos
    {
      name: 'Reportes',
      href: '/reportes',
      icon: ChartBarIcon,
      show: user.role === ROLES.ADMIN_USUARIOS || 
            user.role === ROLES.ADMIN_ESTUDIANTES || 
            user.role === ROLES.ADMIN_PROFESORES
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Control Disciplina</h1>
        <p className="text-sm text-gray-300 mt-1">{getRoleLabel(user.role)}</p>
      </div>

      {/* Información del usuario */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems
            .filter(item => item.show)
            .map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Link
          to="/perfil"
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 mb-2"
        >
          <Cog6ToothIcon className="mr-3 h-5 w-5" />
          Mi Perfil
        </Link>
        
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
        >
          <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;