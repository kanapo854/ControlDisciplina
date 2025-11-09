import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { roleService, permissionService } from '../services/api';
import { toast } from 'react-toastify';
import { X, Shield, Check, Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const RolePermissionsManager = ({ role, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Obtener permisos del rol
  const { data: rolePermissionsData, isLoading: loadingRolePermissions } = useQuery({
    queryKey: ['role-permissions', role.id],
    queryFn: () => roleService.getRolePermissions(role.id)
  });

  // Obtener todos los permisos disponibles
  const { data: allPermissionsData, isLoading: loadingAllPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getPermissions()
  });

  // Mutación para agregar permiso
  const addPermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }) => roleService.addPermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['role-permissions', role.id]);
      queryClient.invalidateQueries(['roles']);
      toast.success('Permiso agregado correctamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al agregar permiso');
    }
  });

  // Mutación para quitar permiso
  const removePermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }) => roleService.removePermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['role-permissions', role.id]);
      queryClient.invalidateQueries(['roles']);
      toast.success('Permiso removido correctamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al remover permiso');
    }
  });

  const handleAddPermission = (permissionId) => {
    addPermissionMutation.mutate({ roleId: role.id, permissionId });
  };

  const handleRemovePermission = (permissionId) => {
    if (window.confirm('¿Estás seguro de quitar este permiso del rol?')) {
      removePermissionMutation.mutate({ roleId: role.id, permissionId });
    }
  };

  if (loadingRolePermissions || loadingAllPermissions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const rolePermissions = rolePermissionsData?.data || [];
  const allPermissions = allPermissionsData?.data || [];
  const groupedAllPermissions = allPermissionsData?.grouped || {};

  // Permisos que NO tiene el rol
  const availablePermissions = allPermissions.filter(
    p => !rolePermissions.find(rp => rp.id === p.id)
  );

  // Filtrar por búsqueda
  const filteredRolePermissions = rolePermissions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailablePermissions = availablePermissions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar permisos filtrados por categoría
  const groupedRolePermissions = filteredRolePermissions.reduce((acc, permission) => {
    const cat = permission.category || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(permission);
    return acc;
  }, {});

  const groupedAvailablePermissions = filteredAvailablePermissions.reduce((acc, permission) => {
    const cat = permission.category || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(permission);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: role.color + '20' }}
            >
              <Shield className="h-5 w-5" style={{ color: role.color }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Permisos de "{role.name}"
              </h2>
              <p className="text-sm text-gray-500">
                Gestiona los permisos asignados a este rol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-6 border-b bg-gray-50">
          <input
            type="text"
            placeholder="Buscar permisos..."
            className="form-input w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Body - Dos columnas */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-x divide-gray-200">
            {/* Permisos asignados */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 bg-green-50 border-b">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Permisos Asignados ({filteredRolePermissions.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredRolePermissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron permisos' : 'Este rol no tiene permisos asignados'}
                  </div>
                ) : (
                  Object.entries(groupedRolePermissions).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 px-2">
                        {category}
                      </h4>
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="bg-white p-3 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </div>
                              <code className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                                {permission.code}
                              </code>
                              {permission.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemovePermission(permission.id)}
                              disabled={removePermissionMutation.isPending}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                              title="Quitar permiso"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Permisos disponibles */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 bg-blue-50 border-b">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Permisos Disponibles ({filteredAvailablePermissions.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredAvailablePermissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron permisos' : 'Todos los permisos están asignados'}
                  </div>
                ) : (
                  Object.entries(groupedAvailablePermissions).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 px-2">
                        {category}
                      </h4>
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </div>
                              <code className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                                {permission.code}
                              </code>
                              {permission.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleAddPermission(permission.id)}
                              disabled={addPermissionMutation.isPending}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
                              title="Agregar permiso"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsManager;
