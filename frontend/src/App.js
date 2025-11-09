import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import StudentDetail from './pages/StudentDetail';
import Incidents from './pages/Incidents';
import IncidentForm from './pages/IncidentForm';
import IncidentDetail from './pages/IncidentDetail';
import Reports from './pages/Reports';
import UsersPage from './pages/UsersPage';
import Profile from './pages/Profile';

// Componentes de gestión de estudiantes
import StudentsList from './components/StudentsList';
import { default as StudentFormComponent } from './components/StudentForm';
import StudentDetails from './components/StudentDetails';
import EnrollmentManager from './components/EnrollmentManager';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('🛡️ ProtectedRoute:', { 
    isAuthenticated, 
    loading, 
    userRole: user?.role
  });

  if (loading) {
    console.log('⏳ ProtectedRoute: Cargando...');
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: No autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: Acceso permitido');
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
};

// Componente principal de rutas
const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('🔍 AppRoutes - Estado:', { isAuthenticated, loading, user: user?.email });

  if (loading) {
    console.log('⏳ AppRoutes: Cargando...');
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Ruta de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            (() => {
              console.log('🔄 Usuario autenticado, redirigiendo a dashboard');
              return <Navigate to="/dashboard" replace />;
            })()
          ) : (
            (() => {
              console.log('🔓 Usuario no autenticado, mostrando login');
              return <Login />;
            })()
          )
        } 
      />

      {/* Rutas protegidas */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Estudiantes */}
      <Route path="/estudiantes" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/estudiantes/crear" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
      <Route path="/estudiantes/:id/editar" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
      <Route path="/estudiantes/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
      
      {/* Gestión avanzada de estudiantes */}
      <Route path="/gestion-estudiantes" element={<ProtectedRoute><StudentsList /></ProtectedRoute>} />
      <Route path="/gestion-estudiantes/nuevo" element={<ProtectedRoute><StudentFormComponent /></ProtectedRoute>} />
      <Route path="/gestion-estudiantes/:id" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
      <Route path="/gestion-estudiantes/:id/editar" element={<ProtectedRoute><StudentFormComponent /></ProtectedRoute>} />
      <Route path="/gestion-estudiantes/:id/materias" element={<ProtectedRoute><EnrollmentManager /></ProtectedRoute>} />
      <Route path="/matriculas" element={<ProtectedRoute><EnrollmentManager /></ProtectedRoute>} />
      
      {/* Incidentes */}
      <Route path="/incidentes" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
      <Route path="/incidentes/crear" element={<ProtectedRoute><IncidentForm /></ProtectedRoute>} />
      <Route path="/incidentes/:id/editar" element={<ProtectedRoute><IncidentForm /></ProtectedRoute>} />
      <Route path="/incidentes/:id" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
      
      {/* Usuarios */}
      <Route path="/usuarios/*" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      
      {/* Profesores */}
      <Route path="/profesores/*" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      
      {/* Padres de familia */}
      <Route path="/mis-hijos" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/incidentes-hijos" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
      
      {/* Reportes */}
      <Route path="/reportes" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      
      {/* Perfil */}
      <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;