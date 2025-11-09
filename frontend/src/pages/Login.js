import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [verifyingMfa, setVerifyingMfa] = useState(false);
  const { login, loading, isAuthenticated, mfaRequired, mfaUserId, clearMfa } = useAuth();
  const navigate = useNavigate();

  // Debug: Mostrar estado MFA del contexto
  useEffect(() => {
    console.log('🔍 Estado MFA del contexto:', { mfaRequired, mfaUserId });
  }, [mfaRequired, mfaUserId]);

  // Redirigir si ya está autenticado (pero NO si está esperando MFA)
  useEffect(() => {
    if (isAuthenticated && !mfaRequired) {
      console.log('🔄 Usuario ya autenticado, redirigiendo...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, mfaRequired, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔄 Intentando login con:', formData.email);
      const response = await login(formData);
      console.log('✅ Respuesta de login:', response);
      
      // Si requiere MFA, el contexto ya actualizó el estado
      if (response?.mfaRequired) {
        console.log('🔐 MFA detectado, mostrando pantalla de verificación');
        toast.info('📧 Se ha enviado un código de verificación a tu email');
        return;
      }
      
      console.log('⚠️ No se requiere MFA, continuando login normal');
      
      toast.success('¡Inicio de sesión exitoso!');
      
      // Esperar un poco para que el estado se actualice y luego navegar
      setTimeout(() => {
        console.log('🔄 Navegando al dashboard...');
        navigate('/dashboard', { replace: true });
      }, 100);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      const errorMsg = error.response?.data?.error || 'Error al iniciar sesión';
      
      // Verificar si la contraseña expiró
      if (error.response?.data?.passwordExpired) {
        toast.error('Tu contraseña ha expirado. Debes cambiarla para continuar.');
        // Aquí podrías redirigir a una página de cambio de contraseña forzado
        return;
      }
      
      toast.error(errorMsg);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setVerifyingMfa(true);
    
    try {
      const response = await api.post('/auth/verify-mfa', {
        userId: mfaUserId,
        code: mfaCode
      });
      
      if (response.data.success) {
        // Guardar el token y usuario
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success('¡Código verificado! Bienvenido');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('❌ Error verificando MFA:', error);
      toast.error(error.response?.data?.error || 'Código inválido');
    } finally {
      setVerifyingMfa(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await api.post('/auth/resend-mfa', { userId: mfaUserId });
      toast.success('📧 Código reenviado a tu email');
    } catch (error) {
      toast.error('Error al reenviar código');
    }
  };

  // Si requiere MFA, mostrar pantalla de verificación
  if (mfaRequired) {
    console.log('🎨 RENDERIZANDO PANTALLA MFA', { mfaUserId });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-purple-100">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verificación en Dos Pasos
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ingresa el código de 6 dígitos que enviamos a tu email
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleMfaSubmit}>
            <div>
              <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700">
                Código de Verificación
              </label>
              <div className="mt-1">
                <input
                  id="mfaCode"
                  name="mfaCode"
                  type="text"
                  maxLength="6"
                  required
                  className="form-input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  autoComplete="off"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                El código expira en 5 minutos
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={verifyingMfa || mfaCode.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingMfa ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Verificar Código'
                )}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Reenviar Código
              </button>

              <button
                type="button"
                onClick={() => {
                  clearMfa();
                  setMfaCode('');
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  console.log('🎨 RENDERIZANDO PANTALLA LOGIN NORMAL');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Lock className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Control de Disciplina
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input pl-10"
                  placeholder="tu@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Olvidaste tu contraseña? Contacta al administrador
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;