import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { roleService, permissionService } from '../services/api';
import { toast } from 'react-toastify';
import { X, Shield, Save } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const RoleForm = ({ role, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#6B7280',
    permissionIds: []
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  // Obtener permisos disponibles
  const { data: permissionsData, isLoading: loadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getPermissions()
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        code: role.code || '',
        description: role.description || '',
        color: role.color || '#6B7280',
        permissionIds: role.permissions?.map(p => p.id) || []
      });
    }
  }, [role]);

  // Mutación para crear/actualizar
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (role) {
        return roleService.updateRole(role.id, data);
      } else {
        return roleService.createRole(data);
      }
    },
    onSuccess: () => {
      toast.success(role ? 'Rol actualizado correctamente' : 'Rol creado correctamente');
      queryClient.invalidateQueries(['roles']);
      onSuccess();
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Error al guardar rol';
      toast.error(errorMsg);
      
      // Mostrar errores de validación
      if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach(err => {
          validationErrors[err.path] = err.msg;
        });
        setErrors(validationErrors);
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Si cambia el nombre, generar código automáticamente (solo para nuevos roles)
    if (name === 'name' && !role) {
      const code = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9\s]/g, '') // Quitar caracteres especiales
        .replace(/\s+/g, '_') // Reemplazar espacios por guiones bajos
        .substring(0, 50);
      setFormData(prev => ({ ...prev, code }));
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validaciones básicas
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }
    if (!/^[a-z_]+$/.test(formData.code)) {
      newErrors.code = 'El código solo puede contener letras minúsculas y guiones bajos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveMutation.mutate(formData);
  };

  const permissions = permissionsData?.data || [];
  const groupedPermissions = permissionsData?.grouped || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {role ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </h2>
              <p className="text-sm text-gray-500">
                {role ? 'Modifica la información del rol' : 'Define un nuevo rol con sus permisos'}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Información básica */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-900">Información del Rol</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Ej: Coordinador Académico"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    disabled={role?.isSystemRole}
                    className={`form-input ${errors.code ? 'border-red-500' : ''} ${role?.isSystemRole ? 'bg-gray-100' : ''}`}
                    placeholder="Ej: coordinador_academico"
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                  {role?.isSystemRole && (
                    <p className="mt-1 text-xs text-gray-500">
                      No se puede cambiar el código de roles del sistema
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                  placeholder="Describe las responsabilidades de este rol..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="form-input flex-1"
                    placeholder="#6B7280"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  <div
                    className="h-10 w-10 rounded border border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  El color se usa para identificar visualmente el rol
                </p>
              </div>
            </div>

            {/* Permisos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  Permisos ({formData.permissionIds.length} seleccionados)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.permissionIds.length === permissions.length) {
                      setFormData(prev => ({ ...prev, permissionIds: [] }));
                    } else {
                      setFormData(prev => ({ ...prev, permissionIds: permissions.map(p => p.id) }));
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {formData.permissionIds.length === permissions.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>

              {loadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-medium text-sm text-gray-700 mb-3">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissionIds.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </div>
                              {permission.description && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {permission.description}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={saveMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {role ? 'Actualizar' : 'Crear'} Rol
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
