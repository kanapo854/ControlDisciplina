import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { roleService } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Eye,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import RoleForm from './RoleForm';
import RolePermissionsManager from './RolePermissionsManager';

const RolesManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Obtener roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles', { search: searchTerm }],
    queryFn: () => roleService.getRoles({ search: searchTerm })
  });

  // Obtener roles sin uso
  const { data: unusedRolesData } = useQuery({
    queryKey: ['roles-unused'],
    queryFn: () => roleService.getUnusedRoles()
  });

  // Obtener estadísticas
  const { data: statsData } = useQuery({
    queryKey: ['roles-stats'],
    queryFn: () => roleService.getRoleStats()
  });

  // Mutación para eliminar rol
  const deleteMutation = useMutation({
    mutationFn: roleService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['roles-unused']);
      queryClient.invalidateQueries(['roles-stats']);
      toast.success('Rol eliminado correctamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al eliminar rol');
    }
  });

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowForm(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setShowPermissions(true);
  };

  const handleDeleteRole = (role) => {
    if (role.isSystemRole) {
      toast.error('No se pueden eliminar roles del sistema');
      return;
    }

    if (role.userCount > 0) {
      toast.error(`No se puede eliminar el rol porque tiene ${role.userCount} usuario(s) asignado(s)`);
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
      deleteMutation.mutate(role.id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedRole(null);
  };

  const handlePermissionsClose = () => {
    setShowPermissions(false);
    setSelectedRole(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const roles = rolesData?.data || [];
  const unusedRoles = unusedRolesData?.data || [];
  const stats = statsData?.data || {};

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRoles || 0}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Roles Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeRoles || 0}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Roles del Sistema</p>
              <p className="text-2xl font-bold text-purple-600">{stats.systemRoles || 0}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sin Uso</p>
              <p className="text-2xl font-bold text-orange-600">{unusedRoles.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar roles..."
              className="form-input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleCreateRole}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            Crear Rol
          </button>
        </div>
      </div>

      {/* Alerta de roles sin uso */}
      {unusedRoles.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">
                Roles sin usuarios asignados
              </h3>
              <p className="mt-1 text-sm text-orange-700">
                Hay {unusedRoles.length} rol(es) que no tienen usuarios asignados. 
                Considera eliminarlos para mantener el sistema organizado.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {unusedRoles.slice(0, 5).map(role => (
                  <span key={role.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    {role.name}
                  </span>
                ))}
                {unusedRoles.length > 5 && (
                  <span className="text-xs text-orange-600">
                    +{unusedRoles.length - 5} más
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de roles */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permisos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron roles
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: role.color + '20' }}
                        >
                          <Shield className="h-4 w-4" style={{ color: role.color }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {role.name}
                            {role.isSystemRole && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Sistema
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <div className="text-sm text-gray-500">{role.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {role.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {role.permissions?.length || 0} permisos
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className={role.userCount === 0 ? 'text-orange-600' : 'text-gray-900'}>
                          {role.userCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {role.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <X className="h-3 w-3 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleManagePermissions(role)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Gestionar permisos"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Editar rol"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {!role.isSystemRole && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={role.userCount > 0}
                            title={role.userCount > 0 ? 'No se puede eliminar (tiene usuarios asignados)' : 'Eliminar rol'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {showForm && (
        <RoleForm
          role={selectedRole}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries(['roles']);
            queryClient.invalidateQueries(['roles-stats']);
          }}
        />
      )}

      {showPermissions && selectedRole && (
        <RolePermissionsManager
          role={selectedRole}
          onClose={handlePermissionsClose}
        />
      )}
    </div>
  );
};

export default RolesManager;
