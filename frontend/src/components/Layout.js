import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Users, 
  AlertTriangle, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  UserCheck 
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin, isCoordinator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      roles: ['admin', 'coordinador', 'profesor', 'estudiante']
    },
    {
      name: 'Estudiantes',
      icon: Users,
      path: '/students',
      roles: ['admin', 'coordinador', 'profesor']
    },
    {
      name: 'Incidentes',
      icon: AlertTriangle,
      path: '/incidents',
      roles: ['admin', 'coordinador', 'profesor']
    },
    {
      name: 'Reportes',
      icon: FileText,
      path: '/reports',
      roles: ['admin', 'coordinador', 'profesor']
    },
    {
      name: 'Usuarios',
      icon: UserCheck,
      path: '/users',
      roles: ['admin', 'coordinador']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
          <h1 className="text-xl font-bold text-white">Control Disciplina</h1>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                    ${isActive(item.path) 
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                navigate('/profile');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              Perfil
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              
              <div className="ml-4 lg:ml-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  {menuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Bienvenido, {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;