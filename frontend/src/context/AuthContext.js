import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

// Estados de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        mfaRequired: false,
        mfaUserId: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'SET_MFA_REQUIRED':
      return {
        ...state,
        loading: false,
        mfaRequired: true,
        mfaUserId: action.payload.userId
      };
    case 'CLEAR_MFA':
      return {
        ...state,
        mfaRequired: false,
        mfaUserId: null
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        mfaRequired: false,
        mfaUserId: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
  mfaRequired: false,
  mfaUserId: null
};

// Crear contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar si hay token al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Inicializando autenticación...');
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('✅ Token y usuario encontrados en localStorage:', user.email);
          
          // Por ahora, confiamos en el localStorage sin verificar con el servidor
          // TODO: Descomentar cuando el backend esté funcionando correctamente
          /*
          const response = await authService.getMe();
          console.log('✅ Token válido, usuario autenticado:', response.data.email);
          */
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              token,
              user: user
            }
          });
        } catch (error) {
          console.error('❌ Error al parsear usuario, limpiando storage:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        console.log('🔓 No hay token, usuario no autenticado');
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Función de login
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('🔄 AuthContext: Iniciando login...');
      const response = await authService.login(credentials);
      console.log('✅ AuthContext: Respuesta del servidor:', response);
      
      // Si requiere MFA, actualizar estado MFA en el contexto
      if (response.mfaRequired) {
        console.log('🔐 MFA requerido, actualizando estado en contexto...');
        dispatch({ 
          type: 'SET_MFA_REQUIRED',
          payload: { userId: response.userId }
        });
        return response;
      }
      
      // Guardar en localStorage solo si no requiere MFA
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      console.log('✅ AuthContext: Estado actualizado, usuario autenticado');
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Error en login:', error);
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      throw error;
    }
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  // Función de registro
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.register(userData);
      
      // Guardar en localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al registrar usuario';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      throw error;
    }
  };

  // Función para actualizar el perfil del usuario
  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  // Función para cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      updateUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verificar permisos por rol
  const hasPermission = (requiredRoles) => {
    if (!state.user || !Array.isArray(requiredRoles)) return false;
    return requiredRoles.includes(state.user.role);
  };

  // Verificar si es admin
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  // Verificar si es coordinador o admin
  const isCoordinator = () => {
    return ['admin', 'coordinador'].includes(state.user?.role);
  };

  // Limpiar estado MFA
  const clearMfa = () => {
    dispatch({ type: 'CLEAR_MFA' });
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    updateUser,
    changePassword,
    updateProfile,
    clearMfa,
    hasPermission,
    isAdmin,
    isCoordinator
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;