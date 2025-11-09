import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '../services/api';
import { ROLES, ROLE_LABELS } from '../config/roles';

const CreateUserForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'profesor',
    carnet: '',
    phone: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumbers: false,
    hasSymbols: false
  });

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

  const createUserMutation = useMutation(userService.createUser, {
    onSuccess: (data) => {
      toast.success(data.message || 'Usuario creado exitosamente');
      queryClient.invalidateQueries('users');
      navigate('/usuarios');
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Error al crear usuario';
      toast.error(message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar contraseña
    if (!validatePassword(formData.password)) {
      toast.error('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar contraseña en tiempo real
    if (name === 'password') {
      validatePassword(value);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Crear Nuevo Usuario
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
                placeholder="Ingresa el nombre completo"
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
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={12}
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Mínimo 12 caracteres con mayúsculas, números y símbolos"
              />
              
              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
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
                      Al menos un símbolo (!@#$%^&*(),.?":{}|&lt;&gt;)
                    </span>
                  </div>
                </div>
              )}
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
              <p className="mt-1 text-xs text-gray-500">
                Selecciona el rol que determinará los permisos del usuario
              </p>
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
              <p className="mt-1 text-xs text-gray-500">
                Código de identificación único (estudiantes, profesores, etc.)
              </p>
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
                placeholder="+1234567890"
              />
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
                disabled={createUserMutation.isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {createUserMutation.isLoading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;