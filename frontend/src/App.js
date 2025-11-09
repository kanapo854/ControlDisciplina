import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
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
import Users from './pages/Users';
import Profile from './pages/Profile';

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
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente principal de rutas
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Ruta de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Estudiantes */}
        <Route path="/students" element={<Students />} />
        <Route 
          path="/students/new" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'coordinador', 'profesor']}>
              <StudentForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/students/:id/edit" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'coordinador', 'profesor']}>
              <StudentForm />
            </ProtectedRoute>
          } 
        />
        <Route path="/students/:id" element={<StudentDetail />} />

        {/* Incidentes */}
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/incidents/new" element={<IncidentForm />} />
        <Route path="/incidents/:id/edit" element={<IncidentForm />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />

        {/* Reportes */}
        <Route path="/reports" element={<Reports />} />

        {/* Usuarios (solo admin y coordinador) */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'coordinador']}>
              <Users />
            </ProtectedRoute>
          } 
        />

        {/* Perfil */}
        <Route path="/profile" element={<Profile />} />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
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