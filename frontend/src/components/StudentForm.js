import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { studentService, courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import {
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserGroupIcon,
  HeartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    documentType: 'tarjeta_identidad',
    courseId: '', // Solo necesitamos el curso
    birthDate: '',
    gender: 'masculino',
    phone: '',
    address: '',
    emergencyContact: '',
    medicalInfo: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

  // Obtener cursos disponibles (siempre llamar el hook, pero deshabilitar si no está autenticado)
  const { data: coursesData, isLoading: loadingCourses, error: coursesError } = useQuery(
    'courses', 
    () => courseService.getCourses(),
    {
      enabled: isAuthenticated // Solo ejecutar si está autenticado
    }
  );
  
  // Debug: ver qué está devolviendo la API
  console.log('Courses Data:', coursesData);
  console.log('Loading Courses:', loadingCourses);
  console.log('Courses Error:', coursesError);
  console.log('Is Authenticated:', isAuthenticated);
  console.log('User:', user);

  // Obtener datos del estudiante si estamos editando (declarar hook antes del early return)
  const { data: studentData, isLoading: loadingStudent } = useQuery(
    ['student', id],
    () => studentService.getStudent(id),
    {
      enabled: isEditing && isAuthenticated, // Solo ejecutar si está editando y autenticado
      onSuccess: (data) => {
        if (data?.data) {
          const student = data.data;
          
          setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            documentNumber: student.documentNumber || '',
            documentType: student.documentType || 'tarjeta_identidad',
            courseId: student.courseId || '',
            birthDate: student.birthDate ? student.birthDate.split('T')[0] : '',
            gender: student.gender || 'masculino',
            phone: student.phone || '',
            address: student.address || '',
            emergencyContact: student.emergencyContact || '',
            medicalInfo: student.medicalInfo || '',
            notes: student.notes || ''
          });
        }
      }
    }
  );

  // Mutación para crear/actualizar estudiante
  const studentMutation = useMutation(
    (data) => isEditing ? studentService.updateStudent(id, data) : studentService.createStudent(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('students');
        queryClient.invalidateQueries(['student', id]);
        
        // Mostrar notificación de éxito
        setToast({
          show: true,
          type: 'success',
          title: isEditing ? 'Estudiante actualizado' : 'Estudiante creado',
          message: isEditing 
            ? 'La información del estudiante se ha actualizado correctamente'
            : 'El nuevo estudiante se ha registrado exitosamente'
        });
        
        // Navegar después de un breve delay para mostrar el toast
        setTimeout(() => {
          if (!isEditing && data?.data?.id) {
            navigate(`/gestion-estudiantes/${data.data.id}`);
          } else if (isEditing) {
            navigate(`/gestion-estudiantes/${id}`);
          } else {
            navigate('/gestion-estudiantes');
          }
        }, 1500);
      },
      onError: (error) => {
        if (error.response?.data?.errors) {
          const backendErrors = {};
          error.response.data.errors.forEach(err => {
            backendErrors[err.param || err.path] = err.msg;
          });
          setErrors(backendErrors);
        } else {
          setErrors({ general: error.response?.data?.error || 'Error al guardar el estudiante' });
        }
        
        // Mostrar toast de error
        setToast({
          show: true,
          type: 'error',
          title: 'Error al guardar',
          message: error.response?.data?.error || 'Ha ocurrido un error al guardar el estudiante'
        });
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar estado del formulario
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores del campo cuando el usuario está escribiendo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validación en tiempo real para campos específicos
    if (name === 'parentEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors(prev => ({
        ...prev,
        parentEmail: 'Email del acudiente inválido'
      }));
    }

    if ((name === 'phone' || name === 'parentPhone') && value && !/^\d{8}$/.test(value.replace(/\D/g, ''))) {
      setErrors(prev => ({
        ...prev,
        [name]: 'El teléfono debe tener 10 dígitos'
      }));
    }

    if (name === 'documentNumber' && value && value.length < 5) {
      setErrors(prev => ({
        ...prev,
        documentNumber: 'El documento debe tener al menos 5 caracteres'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = 'El nombre no puede exceder 50 caracteres';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'El apellido no puede exceder 50 caracteres';
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es requerido';
    } else if (formData.documentNumber.trim().length < 5) {
      newErrors.documentNumber = 'El documento debe tener al menos 5 caracteres';
    }

    if (!formData.courseId.trim()) newErrors.courseId = 'El curso es requerido';
    if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida';
    
    // Validaciones de formato
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    // Validación de edad
    if (formData.birthDate) {
      const today = new Date();
      const birthDate = new Date(formData.birthDate);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 3 || age > 25) {
        newErrors.birthDate = 'La edad debe estar entre 3 y 25 años';
      }
    }

    // Validación de curso para secundaria
    if (formData.level === 'secundaria' && !formData.courseId) {
      newErrors.courseId = 'El curso es requerido para estudiantes de secundaria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await studentMutation.mutateAsync(formData);
    } catch (error) {
      // El error ya se maneja en la mutación
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && loadingStudent) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si no está autenticado, mostrar loading mientras redirige
  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
              </h1>
              <p className="text-blue-100 mt-1">
                {isEditing ? 'Actualiza la información del estudiante' : 'Registra un nuevo estudiante en el sistema'}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/gestion-estudiantes')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <span>← Cancelar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {errors.general}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información Personal */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombres del estudiante"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Apellidos del estudiante"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento
              </label>
              <select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="tarjeta_identidad">Tarjeta de Identidad</option>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>

            <div>
              <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                id="documentNumber"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.documentNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Número de documento"
              />
              {errors.documentNumber && <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>}
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.birthDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Información Académica</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Curso */}
            <div className="col-span-full">
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                Curso *
              </label>
              {loadingCourses ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-700">Cargando cursos...</p>
                </div>
              ) : coursesError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Error al cargar cursos</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {coursesError.message || 'No se pudieron cargar los cursos'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : coursesData && coursesData.data && coursesData.data.length > 0 ? (
                <div>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.courseId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    style={{
                      appearance: 'auto',
                      maxHeight: 'none'
                    }}
                  >
                    <option value="">Seleccionar curso</option>
                    {coursesData.data
                      .filter(course => course.level === 'secundaria')
                      .sort((a, b) => {
                        // Ordenar por grado y luego por sección
                        if (a.grade !== b.grade) return a.grade - b.grade;
                        return a.section.localeCompare(b.section);
                      })
                      .map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))
                    }
                  </select>
                  
                  <p className="mt-2 text-sm text-gray-500">
                    {coursesData.data.filter(c => c.level === 'secundaria').length} cursos disponibles
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">No hay cursos disponibles</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Contacte al administrador para crear cursos antes de registrar estudiantes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {errors.courseId && <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>}
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <PhoneIcon className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Información de Contacto</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono del Estudiante
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Teléfono del estudiante"
              />
            </div>

            <div className="md:col-span-2"></div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dirección de residencia del estudiante"
              />
            </div>
          </div>
        </div>

        {/* Información del Padre/Madre/Acudiente */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Padre/Madre/Acudiente (Opcional)</h3>
            <p className="text-sm text-gray-500 mt-1">
              Esta información se puede completar más tarde si no está disponible
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo (opcional)
              </label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.parentName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre del padre/madre/acudiente"
              />
              {errors.parentName && <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>}
            </div>

            <div>
              <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                id="parentPhone"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.parentPhone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Teléfono del padre/madre/acudiente"
              />
              {errors.parentPhone && <p className="mt-1 text-sm text-red-600">{errors.parentPhone}</p>}
            </div>

            <div>
              <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email del Padre/Madre/Acudiente
              </label>
              <input
                type="email"
                id="parentEmail"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.parentEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="email@ejemplo.com"
              />
              {errors.parentEmail && <p className="mt-1 text-sm text-red-600">{errors.parentEmail}</p>}
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                Contacto de Emergencia
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre y teléfono de contacto de emergencia"
              />
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Información Adicional</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="medicalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                Información Médica
              </label>
              <textarea
                id="medicalInfo"
                name="medicalInfo"
                rows={3}
                value={formData.medicalInfo}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alergias, medicamentos, condiciones médicas relevantes, etc."
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observaciones adicionales sobre el estudiante"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Campos requeridos:</span> Los campos marcados con * son obligatorios
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/gestion-estudiantes')}
                className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || studentMutation.isLoading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting || studentMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEditing ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <>
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Actualizar Estudiante
                      </>
                    ) : (
                      <>
                        <UserIcon className="h-4 w-4 mr-2" />
                        Crear Estudiante
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Toast de notificaciones */}
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default StudentForm;