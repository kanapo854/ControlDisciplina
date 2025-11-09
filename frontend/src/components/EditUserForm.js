import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { userService } from '../services/api';
import { ROLES, ROLE_LABELS } from '../config/roles';

const EditUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'profesor',
    carnet: '',
    phone: ''
  });

  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumbers: false,
    hasSymbols: false
  });

  // Obtener datos del usuario
  const { data: userData, isLoading, error } = useQuery(
    ['user', id],
    () => userService.getUser(id),
    {
      onSuccess: (data) => {
        const user = data.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'profesor',
          carnet: user.carnet || '',
          phone: user.phone || ''
        });
      }
    }
  );

  // Mutación para actualizar usuario
  const updateUserMutation = useMutation(
    (data) => userService.updateUser(id, data),
    {
      onSuccess: (data) => {
        toast.success(data.message || 'Usuario actualizado exitosamente');
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', id]);
        navigate('/usuarios');
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Error al actualizar usuario';
        toast.error(message);
      }
    }
  );

  // Validar fortaleza de contraseña
  const validatePassword = (password) => {
    const strength = {
      hasMinLength: password.length >= 12,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSymbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    let updateData = { ...formData };

    // Si se está cambiando la contraseña
    if (changePassword) {
      if (!passwordData.newPassword) {
        toast.error('Por favor ingresa la nueva contraseña');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }

      if (!validatePassword(passwordData.newPassword)) {
        toast.error('La contraseña no cumple con los requisitos de seguridad');
        return;
      }

      updateData.password = passwordData.newPassword;
    }

    updateUserMutation.mutate(updateData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar contraseña en tiempo real
    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar usuario
        </h3>
        <p className="text-gray-500 mb-4">
          {error.response?.data?.error || 'Usuario no encontrado'}
        </p>
        <button
          onClick={() => navigate('/usuarios')}
          className="text-blue-600 hover:text-blue-800"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const user = userData?.data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Editar Usuario: {user?.name}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rol del usuario *
              </label>
              <select
                name="role"
                id="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {Object.values(ROLES).map(role => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>

            {/* Carnet */}
            <div>
              <label htmlFor="carnet" className="block text-sm font-medium text-gray-700">
                Carnet (opcional)
              </label>
              <input
                type="text"
                name="carnet"
                id="carnet"
                maxLength={20}
                value={formData.carnet}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: EST2024001, PROF001, etc."
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Cambiar contraseña */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Cambiar contraseña
                  </span>
                </label>
              </div>

              {changePassword && (
                <div className="space-y-4">
                  {/* Nueva contraseña */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      Nueva contraseña *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      required={changePassword}
                      minLength={12}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Mínimo 12 caracteres con mayúsculas, números y símbolos"
                    />
                    
                    {/* Indicador de fortaleza de contraseña */}
                    {passwordData.newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${passwordStrength.hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                            Mínimo 12 caracteres
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${passwordStrength.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                            Al menos una mayúscula
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${passwordStrength.hasNumbers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordStrength.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                            Al menos un número
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${passwordStrength.hasSymbols ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordStrength.hasSymbols ? 'text-green-600' : 'text-gray-500'}`}>
                            Al menos un símbolo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmar nueva contraseña *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      required={changePassword}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Confirma la nueva contraseña"
                    />
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Información del rol seleccionado */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Permisos del rol: {ROLE_LABELS[formData.role]}
              </h4>
              <div className="text-xs text-blue-800">
                {formData.role === ROLES.ADMIN_USUARIOS && '• Gestionar usuarios del sistema'}
                {formData.role === ROLES.PROFESOR && '• Crear y gestionar incidentes • Ver estudiantes'}
                {formData.role === ROLES.PADRE_FAMILIA && '• Ver incidentes de sus hijos'}
                {formData.role === ROLES.ADMIN_ESTUDIANTES && '• Gestionar información de estudiantes'}
                {formData.role === ROLES.ADMIN_PROFESORES && '• Gestionar información de profesores'}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/usuarios')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateUserMutation.isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {updateUserMutation.isLoading ? 'Actualizando...' : 'Actualizar Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;