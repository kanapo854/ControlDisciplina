# Control de Disciplina

Sistema web completo para la gestión de disciplina escolar construido con Node.js y React.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura cliente-servidor con patrón MVC:

- **Backend**: Node.js + Express + MongoDB (Patrón MVC)
- **Frontend**: React + React Router + Tailwind CSS
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)

## 📁 Estructura del Proyecto

```
ControlDisciplina/
├── backend/                 # Servidor Node.js
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio (Controller)
│   │   ├── models/         # Modelos de datos (Model)
│   │   ├── routes/         # Rutas de la API
│   │   ├── middleware/     # Middleware personalizado
│   │   ├── config/         # Configuración de BD
│   │   ├── services/       # Servicios auxiliares
│   │   └── server.js       # Punto de entrada
│   ├── package.json
│   └── .env.example
├── frontend/                # Cliente React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables (View)
│   │   ├── pages/          # Páginas principales (View)
│   │   ├── services/       # Comunicación con API
│   │   ├── context/        # Context API (Estado global)
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utilidades
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Características

### Backend
- ✅ API RESTful completa
- ✅ Autenticación y autorización por roles
- ✅ Modelos para usuarios, estudiantes e incidentes
- ✅ Middleware de seguridad
- ✅ Validación de datos
- ✅ Reportes y estadísticas
- ✅ Manejo de errores centralizado

### Frontend
- ✅ Interfaz responsive con Tailwind CSS
- ✅ Autenticación con Context API
- ✅ Routing protegido por roles
- ✅ Dashboard con estadísticas
- ✅ Gestión completa de estudiantes
- ✅ Sistema de notificaciones
- ✅ Componentes reutilizables

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (local o Atlas)
- Git

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd ControlDisciplina
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

Configurar variables de entorno en `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/control_disciplina
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

### 4. Iniciar los servicios

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

El backend estará en `http://localhost:5000` y el frontend en `http://localhost:3000`.

## 👥 Roles de Usuario

### Administrador
- Gestión completa de usuarios
- Acceso total a todas las funcionalidades
- Configuración del sistema

### Coordinador
- Gestión de estudiantes e incidentes
- Aplicación de sanciones
- Generación de reportes
- Gestión de usuarios (limitada)

### Profesor
- Registro de incidentes
- Consulta de estudiantes
- Seguimiento de casos

### Estudiante (futuro)
- Consulta de sus propios incidentes
- Historial disciplinario

## 📊 Funcionalidades Principales

### 1. Gestión de Estudiantes
- Registro completo con datos personales y de contacto
- Información médica y de emergencia
- Estados activo/inactivo
- Búsqueda y filtrado avanzado

### 2. Gestión de Incidentes
- Registro detallado de incidentes
- Categorización por tipo y severidad
- Sistema de sanciones
- Seguimiento y resolución
- Notificación a padres

### 3. Sistema de Reportes
- Dashboard con estadísticas generales
- Reportes por estudiante
- Análisis por fechas y filtros
- Estadísticas de sanciones

### 4. Seguridad
- Autenticación JWT
- Autorización por roles
- Validación de datos
- Protección CORS

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
npm test           # Ejecutar tests
```

### Frontend
```bash
npm start          # Desarrollo
npm run build      # Compilar para producción
npm test           # Ejecutar tests
npm run eject      # Eject de Create React App
```

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/change-password` - Cambiar contraseña

### Estudiantes
- `GET /api/students` - Listar estudiantes
- `POST /api/students` - Crear estudiante
- `GET /api/students/:id` - Obtener estudiante
- `PUT /api/students/:id` - Actualizar estudiante
- `DELETE /api/students/:id` - Desactivar estudiante

### Incidentes
- `GET /api/incidents` - Listar incidentes
- `POST /api/incidents` - Crear incidente
- `GET /api/incidents/:id` - Obtener incidente
- `PUT /api/incidents/:id` - Actualizar incidente
- `POST /api/incidents/:id/sanctions` - Agregar sanción

### Reportes
- `GET /api/reports/dashboard` - Estadísticas generales
- `GET /api/reports/student/:id` - Reporte por estudiante
- `GET /api/reports/date-range` - Reporte por fechas

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Despliegue

### Backend (Heroku/Railway)
1. Configurar variables de entorno en la plataforma
2. Conectar repositorio
3. Desplegar

### Frontend (Netlify/Vercel)
1. Compilar el proyecto: `npm run build`
2. Subir carpeta `build/`
3. Configurar redirects para SPA

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

Tu Nombre - [tu@email.com](mailto:tu@email.com)

## 🔮 Próximas Características

- [ ] Sistema de notificaciones en tiempo real
- [ ] Reportes PDF exportables
- [ ] Integración con calendario
- [ ] App móvil
- [ ] Sistema de backup automático
- [ ] Multidioma
- [ ] Temas personalizables

---

⭐ Si este proyecto te ha sido útil, ¡dale una estrella!