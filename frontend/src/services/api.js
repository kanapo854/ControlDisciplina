import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};

// Servicios de estudiantes
export const studentService = {
  getStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },
  
  getStudent: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  
  getStudentStats: async () => {
    const response = await api.get('/students/stats');
    return response.data;
  },
  
  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },
  
  updateStudent: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },
  
  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
  
  activateStudent: async (id) => {
    const response = await api.put(`/students/${id}/activate`);
    return response.data;
  },
  
  searchByDocument: async (documentNumber) => {
    const response = await api.get(`/students/search/${documentNumber}`);
    return response.data;
  },
  
  // Métodos para gestión de relaciones familiares
  linkParentToStudent: async (studentId, parentUserId) => {
    const response = await api.put(`/students/${studentId}/link-parent`, { parentUserId });
    return response.data;
  },
  
  unlinkParentFromStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}/unlink-parent`);
    return response.data;
  },
  
  getMyChildren: async () => {
    const response = await api.get('/students/my-children');
    return response.data;
  }
};

// Servicios de incidentes
export const incidentService = {
  getIncidents: async (params = {}) => {
    const response = await api.get('/incidents', { params });
    return response.data;
  },
  
  getIncident: async (id) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },
  
  createIncident: async (incidentData) => {
    const response = await api.post('/incidents', incidentData);
    return response.data;
  },
  
  updateIncident: async (id, incidentData) => {
    const response = await api.put(`/incidents/${id}`, incidentData);
    return response.data;
  },
  
  deleteIncident: async (id) => {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  },
  
  addSanction: async (id, sanctionData) => {
    const response = await api.post(`/incidents/${id}/sanctions`, sanctionData);
    return response.data;
  },
  
  addFollowUp: async (id, followUpData) => {
    const response = await api.post(`/incidents/${id}/follow-up`, followUpData);
    return response.data;
  },
  
  updateStatus: async (id, statusData) => {
    const response = await api.put(`/incidents/${id}/status`, statusData);
    return response.data;
  }
};

// Servicios de usuarios
export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  updateUserStatus: async (id, statusData) => {
    const response = await api.put(`/users/${id}/status`, statusData);
    return response.data;
  }
};

// Servicios de reportes
export const reportService = {
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },
  
  getStudentReport: async (studentId) => {
    const response = await api.get(`/reports/student/${studentId}`);
    return response.data;
  },
  
  getDateRangeReport: async (params) => {
    const response = await api.get('/reports/date-range', { params });
    return response.data;
  },
  
  getSanctionsReport: async () => {
    const response = await api.get('/reports/sanctions');
    return response.data;
  }
};

// Servicios de cursos
export const courseService = {
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },
  
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },
  
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },
  
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  }
};

// Servicios de materias
export const subjectService = {
  getSubjects: async (params = {}) => {
    const response = await api.get('/subjects', { params });
    return response.data;
  },
  
  getSubject: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },
  
  createSubject: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },
  
  updateSubject: async (id, subjectData) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },
  
  deleteSubject: async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  }
};

// Servicios de inscripciones
export const enrollmentService = {
  enrollStudent: async (enrollmentData) => {
    const response = await api.post('/enrollments', enrollmentData);
    return response.data;
  },
  
  getStudentEnrollments: async (studentId, params = {}) => {
    const response = await api.get(`/enrollments/student/${studentId}`, { params });
    return response.data;
  },
  
  getSubjectEnrollments: async (subjectId, params = {}) => {
    const response = await api.get(`/enrollments/subject/${subjectId}`, { params });
    return response.data;
  },
  
  updateEnrollment: async (id, enrollmentData) => {
    const response = await api.put(`/enrollments/${id}`, enrollmentData);
    return response.data;
  },
  
  deleteEnrollment: async (id) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  },
  
  validateEnrollments: async (studentId, params = {}) => {
    const response = await api.get(`/enrollments/validate/${studentId}`, { params });
    return response.data;
  }
};

export default api;