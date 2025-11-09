import React from 'react';
import { useLocation } from 'react-router-dom';
import CreateUserForm from '../components/CreateUserForm';

const Users = () => {
  const location = useLocation();
  const isCreateRoute = location.pathname.includes('/crear');

  if (isCreateRoute) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Usuarios
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Crear nuevo usuario en el sistema
          </p>
        </div>
        <CreateUserForm />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Usuarios
      </h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600 mb-4">
          Lista de usuarios - En desarrollo
        </p>
        <div className="text-sm text-gray-500">
          <p>🔗 Usa el enlace "Crear Usuario" en el dashboard para probar la creación de usuarios con diferentes roles.</p>
        </div>
      </div>
    </div>
  );
};

export default Users;