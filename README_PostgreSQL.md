# 🎓 Sistema de Control de Disciplina Escolar

## 📋 Descripción

Sistema completo de gestión disciplinaria escolar desarrollado con **Node.js**, **PostgreSQL**, **React** y **Tailwind CSS**. Permite el registro, seguimiento y gestión de incidentes disciplinarios con un sistema de roles y permisos.

## 🏗️ Arquitectura

- **Backend**: Node.js + Express + PostgreSQL + Sequelize
- **Frontend**: React 18 + Tailwind CSS + React Router
- **Base de Datos**: PostgreSQL con relaciones optimizadas
- **Autenticación**: JWT con roles (admin, coordinador, profesor, estudiante)

## 🚀 Características

### 👥 **Gestión de Usuarios**
- Sistema de roles y permisos
- Autenticación JWT segura
- Panel de administración de usuarios

### 📚 **Gestión de Estudiantes**
- Registro completo de estudiantes
- Información médica y de contacto
- Historial disciplinario individual

### 📝 **Registro de Incidentes**
- Múltiples tipos de incidentes
- Clasificación por severidad
- Sistema de sanciones y seguimiento
- Notificación a padres

### 📊 **Reportes y Estadísticas**
- Dashboard con métricas en tiempo real
- Reportes por estudiante, fecha, tipo
- Estadísticas de incidentes por período
- Gráficos interactivos

## 🛠️ Instalación y Configuración

### Prerrequisitos

- **Node.js** (v18 o superior)
- **PostgreSQL** (v12 o superior)
- **npm** o **yarn**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/kanapo854/ControlDisciplina.git
cd ControlDisciplina
```

### 2. Configurar PostgreSQL

#### Instalar PostgreSQL
- Descargar desde [postgresql.org](https://www.postgresql.org/download/)
- Instalar con las opciones por defecto
- Recordar la contraseña del usuario `postgres`

#### Crear Base de Datos
```sql
-- Opción 1: Usando pgAdmin
CREATE DATABASE "ControlDisciplina";

-- Opción 2: Línea de comandos
createdb -U postgres ControlDisciplina
```

### 3. Configurar Backend

```bash
cd backend
npm install
```

#### Configurar Variables de Entorno
Crear archivo `.env` en `backend/`:

```env
# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ControlDisciplina
DB_USER=postgres
DB_PASSWORD=tu_password_postgres
DB_SSL=false

# JWT Secret
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# URL del Frontend
FRONTEND_URL=http://localhost:3000

# Configuración de archivos
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880

# Configuración del entorno
NODE_ENV=development
PORT=5000
```

#### Inicializar Base de Datos
```bash
npm run init-db
```

Este comando:
- ✅ Conecta a PostgreSQL
- ✅ Crea las tablas necesarias
- ✅ Configura índices optimizados
- ✅ Crea usuario administrador por defecto

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

#### Configurar Variables de Entorno
Crear archivo `.env` en `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BACKEND_URL=http://localhost:5000

# Configuración del servidor de desarrollo
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=3000
FAST_REFRESH=true
GENERATE_SOURCEMAP=false
```

### 5. Ejecutar el Sistema

#### Terminal 1 - Backend:
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## 🔑 Acceso al Sistema

### Usuario Administrador por Defecto
- **URL**: http://localhost:3000
- **Email**: admin@colegio.edu
- **Password**: admin123

⚠️ **Importante**: Cambiar esta contraseña después del primer login.

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### `users` - Usuarios del Sistema
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- role (ENUM: admin, coordinador, profesor, estudiante)
- phone (VARCHAR)
- is_active (BOOLEAN)
- last_login (TIMESTAMP)
```

#### `students` - Estudiantes
```sql
- id (UUID, PK)
- first_name, last_name (VARCHAR)
- document_number (VARCHAR, UNIQUE)
- document_type (ENUM)
- grade, section (VARCHAR)
- birth_date (DATE)
- gender (ENUM)
- parent_info (JSONB)
- medical_info (JSONB)
- registered_by_id (UUID, FK → users.id)
```

#### `incidents` - Incidentes Disciplinarios
```sql
- id (UUID, PK)
- student_id (UUID, FK → students.id)
- title, description (VARCHAR/TEXT)
- type (ENUM: 12 tipos diferentes)
- severity (ENUM: baja, media, alta, critica)
- location (VARCHAR)
- date_occurred (TIMESTAMP)
- reported_by_id (UUID, FK → users.id)
- status (ENUM: pendiente, en_proceso, resuelto, cerrado)
- sanctions (JSONB)
- follow_up (JSONB)
- attachments (JSONB)
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Iniciar servidor producción
npm run dev        # Iniciar servidor desarrollo (nodemon)
npm run init-db    # Inicializar base de datos
npm test           # Ejecutar pruebas
```

### Frontend
```bash
npm start          # Servidor desarrollo
npm run build      # Build para producción
npm test           # Ejecutar pruebas
```

## 📋 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro (solo admin)
- `GET /api/auth/profile` - Perfil del usuario actual

### Estudiantes
- `GET /api/students` - Listar estudiantes (paginado)
- `POST /api/students` - Crear estudiante
- `GET /api/students/:id` - Obtener estudiante
- `PUT /api/students/:id` - Actualizar estudiante

### Incidentes
- `GET /api/incidents` - Listar incidentes (filtros)
- `POST /api/incidents` - Crear incidente
- `GET /api/incidents/:id` - Obtener incidente
- `PUT /api/incidents/:id` - Actualizar incidente
- `POST /api/incidents/:id/sanctions` - Agregar sanción

### Reportes
- `GET /api/reports/dashboard` - Estadísticas dashboard
- `GET /api/reports/student/:id` - Reporte por estudiante
- `GET /api/reports/date-range` - Reporte por fechas
- `GET /api/reports/sanctions` - Reporte de sanciones

## 🚀 Deployment

### Preparación para Producción

1. **Variables de Entorno de Producción**
```env
NODE_ENV=production
DB_HOST=tu_host_produccion
DB_NAME=ControlDisciplina_prod
JWT_SECRET=secret_super_seguro_production
```

2. **Build del Frontend**
```bash
cd frontend
npm run build
```

3. **Inicializar BD en Producción**
```bash
cd backend
npm run init-db
```

## 🔄 Historial de Versiones

### v2.0.0 (Actual) - PostgreSQL
- ✅ Migración completa a PostgreSQL
- ✅ Optimización de consultas SQL
- ✅ Mejor rendimiento en reportes
- ✅ Relaciones de base de datos mejoradas

### v1.0.0 - MongoDB
- ✅ Versión inicial con MongoDB
- ✅ Funcionalidades básicas de gestión disciplinaria

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- 📧 Email: soporte@tuescuela.edu
- 📋 Issues: [GitHub Issues](https://github.com/kanapo854/ControlDisciplina/issues)