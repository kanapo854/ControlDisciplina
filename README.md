# Control de Disciplina

Sistema web completo para la gestión de disciplina escolar construido con Node.js, React y PostgreSQL, implementando estándares de seguridad OWASP Top 10 2021.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura cliente-servidor con patrón MVC:

- **Backend**: Node.js + Express + PostgreSQL (Patrón MVC)
- **Frontend**: React + React Router + Tailwind CSS
- **Base de datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: JWT + MFA (Multi-Factor Authentication)
- **Seguridad**: Implementación completa de OWASP Top 10 2021

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
- ✅ **Sistema de roles y permisos dinámico (RBAC)**
  - 21 permisos granulares en 5 categorías
  - Gestión completa de roles desde la UI
  - Matriz roles-permisos configurable
- ✅ **Seguridad avanzada (OWASP Top 10 2021)**
  - MFA/2FA por email (códigos OTP de 6 dígitos)
  - Política de contraseñas (12+ caracteres, complejidad, 90 días de expiración)
  - Historial de contraseñas (últimas 5 no reutilizables)
  - Bloqueo de cuenta (3 intentos fallidos = 15 min lockout)
  - Bcrypt con 12 salt rounds
  - TLS/HTTPS en producción con ciphers fuertes
- ✅ Modelos para usuarios, estudiantes, incidentes, roles y permisos
- ✅ Middleware de autenticación y autorización
- ✅ Validación con express-validator
- ✅ Reportes y estadísticas
- ✅ Manejo de errores centralizado
- ✅ Logging con Morgan
- ✅ Headers de seguridad con Helmet
- ✅ 0 vulnerabilidades en dependencias (npm audit)

### Frontend
- ✅ Interfaz responsive con Tailwind CSS
- ✅ Autenticación con Context API
- ✅ Routing protegido por roles y permisos
- ✅ Dashboard con estadísticas en tiempo real
- ✅ **Gestión completa de usuarios**
  - ABM de usuarios con validación
  - Gestión de roles y permisos desde UI
  - Vinculación de padres-estudiantes
- ✅ Gestión completa de estudiantes
- ✅ **Sistema de roles dinámico**
  - Dashboard de roles con estadísticas
  - Formularios de creación/edición de roles
  - Asignación visual de permisos (drag & drop style)
  - Detección de roles no utilizados
- ✅ Sistema de notificaciones toast
- ✅ Componentes reutilizables y optimizados

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- Git
- Cuenta de Gmail para MFA (con App Password habilitado)

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
# Servidor
NODE_ENV=development
PORT=5000

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=control_disciplina
DB_USER=postgres
DB_PASSWORD=tu_password_segura

# JWT (IMPORTANTE: usar 32+ caracteres aleatorios)
JWT_SECRET=generar_con_crypto_randomBytes_32_hex
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (Gmail SMTP para MFA)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_16_caracteres
EMAIL_FROM_NAME=Control Disciplina

# SSL/TLS (solo producción)
SSL_KEY_PATH=/ruta/a/server.key
SSL_CERT_PATH=/ruta/a/server.crt
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
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

## 👥 Sistema de Roles y Permisos (RBAC)

### Roles del Sistema (5 roles base)

#### 1. Admin Usuarios
- Gestión completa de usuarios (CRUD)
- Activar/desactivar usuarios
- Habilitar/deshabilitar MFA
- Gestión de roles y permisos
- Vinculación de padres con estudiantes
- Lectura de cursos y estudiantes

#### 2. Admin Estudiantes
- Gestión completa de estudiantes (CRUD)
- Gestión de materias y cursos
- Inscripciones de estudiantes
- Lectura de información académica

#### 3. Admin Profesores
- Gestión de profesores (CRUD)
- Asignación de materias
- Gestión de horarios

#### 4. Profesor
- Creación y edición de incidentes
- Lectura de estudiantes
- Consulta de cursos asignados

#### 5. Padre de Familia
- Lectura de incidentes de sus hijos únicamente
- Consulta de información de sus hijos

### Permisos Granulares (21 permisos)

**Usuarios**: CREATE_USER, READ_USER, UPDATE_USER, DELETE_USER, ACTIVATE_USER

**Estudiantes**: CREATE_STUDENT, READ_STUDENT, UPDATE_STUDENT, DELETE_STUDENT, MANAGE_STUDENTS

**Profesores**: CREATE_TEACHER, READ_TEACHER, UPDATE_TEACHER, DELETE_TEACHER

**Incidentes**: CREATE_INCIDENT, READ_INCIDENT, UPDATE_INCIDENT, DELETE_INCIDENT

**Especiales**: MANAGE_FAMILY_LINKS, READ_OWN_CHILDREN_INCIDENTS, READ_COURSES

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

### 4. Seguridad (OWASP Top 10 2021 Compliant)

#### A01 - Broken Access Control
- ✅ RBAC con 21 permisos granulares
- ✅ Middleware de autorización en todas las rutas
- ✅ Separación de funciones entre roles administrativos

#### A02 - Cryptographic Failures
- ✅ Bcrypt (12 salt rounds) para contraseñas
- ✅ TLS 1.2+ en producción
- ✅ JWT firmados con secret fuerte
- ✅ Datos sensibles no en texto plano

#### A03 - Injection
- ✅ Sequelize ORM con prepared statements
- ✅ Express-validator en todas las rutas
- ✅ Sanitización de inputs
- ✅ Helmet para headers XSS

#### A04 - Insecure Design
- ✅ Account lockout (3 intentos = 15 min)
- ✅ MFA obligatorio para roles sensibles
- ✅ Password expiration (90 días)
- ✅ Principio de menor privilegio

#### A05 - Security Misconfiguration
- ✅ Helmet.js configurado
- ✅ CORS restringido
- ✅ .env para secrets
- ✅ Error handler sin stack traces en producción

#### A06 - Vulnerable Components
- ✅ 0 vulnerabilidades (npm audit)
- ✅ Dependencias actualizadas
- ✅ Nodemailer 7.0.10, validator actualizado

#### A07 - Authentication Failures
- ✅ MFA por email (OTP 6 dígitos, 5 min)
- ✅ Password strength (12+ chars, complejidad)
- ✅ Password history (últimas 5)
- ✅ Session timeout (JWT 7 días)

#### A08 - Software/Data Integrity
- ✅ Sin deserialización insegura
- ✅ JWT con verificación de firma
- ✅ Sequelize previene code injection

#### A09 - Logging & Monitoring
- ✅ Morgan logging (combined mode)
- ✅ Logs de autenticación y errores
- ✅ Timestamps en operaciones críticas

#### A10 - SSRF
- ✅ Sin requests HTTP basados en input de usuario
- ✅ Email validation estricta
- ✅ Sin webhooks con URLs de usuario

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
- `POST /api/auth/login` - Iniciar sesión (retorna mfaRequired si está habilitado)
- `POST /api/auth/verify-mfa` - Verificar código MFA
- `POST /api/auth/resend-mfa` - Reenviar código MFA
- `POST /api/auth/register` - Registrar usuario (requiere permisos)
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña
- `POST /api/auth/reset-password` - Resetear contraseña con token

### Usuarios
- `GET /api/users` - Listar usuarios (con filtros)
- `GET /api/users/stats` - Estadísticas de usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `PUT /api/users/:id/status` - Activar/desactivar usuario
- `PUT /api/users/:id/unlock` - Desbloquear cuenta
- `PUT /api/users/:id/mfa` - Habilitar/deshabilitar MFA

### Roles y Permisos
- `GET /api/roles` - Listar roles
- `GET /api/roles/stats` - Estadísticas de roles
- `GET /api/roles/unused` - Roles sin usuarios asignados
- `GET /api/roles/:id` - Obtener rol con permisos
- `POST /api/roles` - Crear rol personalizado
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol (si no tiene usuarios)
- `GET /api/roles/:id/permissions` - Obtener permisos de un rol
- `POST /api/roles/:id/permissions` - Asignar múltiples permisos
- `POST /api/roles/:id/permissions/:permissionId` - Agregar permiso
- `DELETE /api/roles/:id/permissions/:permissionId` - Remover permiso
- `GET /api/permissions` - Listar todos los permisos
- `GET /api/permissions/categories` - Categorías de permisos

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

Valhery Quispe Chacon - [chaconvalhery@gmail.com]

## � Características de Seguridad Implementadas

### Autenticación Multi-Factor (MFA)
- Códigos OTP de 6 dígitos enviados por email
- Expiración de 5 minutos
- Opción de reenvío de código
- Habilitación por usuario

### Políticas de Contraseñas
- Longitud mínima: 12 caracteres
- Complejidad: mayúsculas + números + símbolos
- Expiración: 90 días con alertas (7, 3, 1 días antes)
- Historial: No reutilización de últimas 5 contraseñas

### Protección de Cuentas
- Bloqueo automático: 3 intentos fallidos
- Duración de bloqueo: 15 minutos
- Desbloqueo manual por administrador
- Scheduler de verificación de expiración de contraseñas

### Gestión de Roles Dinámica
- Creación de roles personalizados desde UI
- Asignación granular de 21 permisos
- Protección de roles del sistema (no eliminables)
- Detección de roles sin usuarios asignados
- Código de colores para identificación visual

## 📊 Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema con autenticación
- `students` - Estudiantes del colegio
- `incidents` - Incidentes disciplinarios
- `roles` - Roles dinámicos del sistema
- `permissions` - Permisos granulares
- `role_permissions` - Relación many-to-many
- `password_history` - Historial de contraseñas hasheadas
- `courses` - Cursos/grados académicos
- `subjects` - Materias por nivel
- `student_subjects` - Inscripciones

### Migraciones
Las migraciones se ejecutan automáticamente con Sequelize. Ver `backend/src/models/` para definiciones.

## 🔮 Próximas Características

- [ ] Rate limiting por IP
- [ ] Reportes PDF exportables
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Auditoría completa de cambios (audit log)
- [ ] Integración con Active Directory/LDAP
- [ ] App móvil con React Native
- [ ] Sistema de backup automático
- [ ] Dashboard de seguridad con métricas
- [ ] Integración con servicios de email transaccional

## ⚠️ Notas de Seguridad

1. **NUNCA** subir archivos `.env` al repositorio
2. Rotar secrets (JWT_SECRET, DB_PASSWORD, EMAIL_PASSWORD) después de cada exposición
3. Usar HTTPS en producción con certificados válidos
4. Mantener dependencias actualizadas (`npm audit fix`)
5. Configurar firewall y limitar acceso a PostgreSQL

