import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UsersList from '../components/UsersList';
import CreateUserForm from '../components/CreateUserForm';
import EditUserForm from '../components/EditUserForm';
import FamilyLinksManager from '../components/FamilyLinksManager';
import RolesManager from '../components/RolesManager';

const UsersPage = () => {
  return (
    <div className="p-6">
      <Routes>
        {/* Lista de usuarios - ruta principal */}
        <Route path="/" element={<UsersList />} />
        
        {/* Crear nuevo usuario */}
        <Route path="crear" element={
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Crear Usuario</h1>
              <p className="text-gray-600">Agrega un nuevo usuario al sistema</p>
            </div>
            <CreateUserForm />
          </div>
        } />
        
        {/* Editar usuario existente */}
        <Route path="editar/:id" element={
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
              <p className="text-gray-600">Modifica la información del usuario</p>
            </div>
            <EditUserForm />
          </div>
        } />
        
        {/* Gestión de relaciones familiares */}
        <Route path="relaciones-familiares" element={<FamilyLinksManager />} />
        
        {/* Gestión de roles y permisos */}
        <Route path="roles" element={
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles y Permisos</h1>
              <p className="text-gray-600">Administra roles del sistema y sus permisos</p>
            </div>
            <RolesManager />
          </div>
        } />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/usuarios" replace />} />
      </Routes>
    </div>
  );
};

export default UsersPage;