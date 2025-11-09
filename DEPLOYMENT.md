# 🚀 Guía de Despliegue en Producción

Esta guía detalla el proceso completo para desplegar el **Control de Disciplina Escolar** con:
- **Frontend** → Vercel
- **Backend** → Render
- **Base de Datos** → PostgreSQL en Render

---

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Configuración de la Base de Datos (Render)](#1-configuración-de-la-base-de-datos-render)
3. [Despliegue del Backend (Render)](#2-despliegue-del-backend-render)
4. [Despliegue del Frontend (Vercel)](#3-despliegue-del-frontend-vercel)
5. [Configuración Post-Despliegue](#4-configuración-post-despliegue)
6. [Verificación y Testing](#5-verificación-y-testing)
7. [Troubleshooting](#6-troubleshooting)

---

## Pre-requisitos

### Cuentas Necesarias
- ✅ Cuenta en [GitHub](https://github.com) (repositorio ya creado)
- ✅ Cuenta en [Render](https://render.com) (gratis)
- ✅ Cuenta en [Vercel](https://vercel.com) (gratis)
- ✅ Cuenta de Gmail con App Password para SMTP (MFA)

### Herramientas
```bash
# Verificar instalaciones locales
node --version    # >= 16.x
npm --version     # >= 8.x
git --version     # >= 2.x
```

### Información a Preparar
- [ ] URL del repositorio: `https://github.com/kanapo854/ControlDisciplina`
- [ ] Rama de producción: `production`
- [ ] Gmail App Password ([crear aquí](https://myaccount.google.com/apppasswords))

---

## 1. Configuración de la Base de Datos (Render)

### 1.1 Crear Base de Datos PostgreSQL

1. **Ir a Render Dashboard**
   - URL: https://dashboard.render.com/
   - Click en **"New +"** → **"PostgreSQL"**

2. **Configurar Base de Datos**
   ```
   Name: control-disciplina-db
   Database: control_disciplina
   User: admin_disciplina
   Region: Oregon (US West)
   Plan: Free
   ```

3. **Copiar Credenciales**
   Una vez creada, copiar:
   - ✅ **Internal Database URL** (¡MUY IMPORTANTE!)
   - ✅ Hostname interno
   - ✅ Port
   - ✅ Database
   - ✅ Username
   - ✅ Password

   Ejemplo de Internal Database URL:
   ```
   postgresql://admin_disciplina:xxxxx@dpg-xxxxx/control_disciplina
   ```

### 1.2 Inicializar Schema

La base de datos se inicializará automáticamente cuando se despliegue el backend (Sequelize sync).

---

## 2. Despliegue del Backend (Render)

### 2.1 Crear Web Service

1. **Ir a Render Dashboard**
   - Click en **"New +"** → **"Web Service"**

2. **Conectar Repositorio**
   - Seleccionar: **"Build and deploy from a Git repository"**
   - Conectar tu cuenta de GitHub
   - Seleccionar repositorio: `kanapo854/ControlDisciplina`
   - Branch: `production`

3. **Configurar Servicio**
   ```
   Name: control-disciplina-backend
   Region: Oregon (US West)
   Branch: production
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

### 2.2 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agregar:

#### Base de Datos
```bash
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=control_disciplina
DB_USER=admin_disciplina
DB_PASSWORD=tu_password_de_render
```

#### JWT y Seguridad
```bash
# Generar: openssl rand -base64 64
JWT_SECRET=tu_jwt_secret_minimo_64_caracteres_aqui
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Generar: openssl rand -base64 32
MFA_SECRET=tu_mfa_secret_minimo_32_caracteres_aqui
```

#### Email (SMTP)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_16_caracteres
EMAIL_FROM=Control Disciplina <noreply@controldisciplina.com>
```

#### Aplicación
```bash
NODE_ENV=production
PORT=10000
SSL_ENABLED=false
# FRONTEND_URL: Agregar después de desplegar Vercel
# CORS_ORIGIN: Agregar después de desplegar Vercel
```

### 2.3 Desplegar

1. Click en **"Create Web Service"**
2. Esperar 5-10 minutos mientras Render:
   - Clona el repositorio
   - Instala dependencias
   - Inicia el servidor
3. Una vez completado, copiar la URL del backend:
   ```
   https://control-disciplina-backend.onrender.com
   ```

### 2.4 Verificar Despliegue

```bash
# Test endpoint de salud
curl https://control-disciplina-backend.onrender.com/api/auth/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2025-11-09T..."}
```

---

## 3. Despliegue del Frontend (Vercel)

### 3.1 Crear Proyecto en Vercel

1. **Ir a Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Click en **"Add New..." → "Project"**

2. **Importar Repositorio**
   - Click en **"Import Git Repository"**
   - Conectar GitHub (si no está conectado)
   - Seleccionar: `kanapo854/ControlDisciplina`
   - Click en **"Import"**

3. **Configurar Proyecto**
   ```
   Project Name: control-disciplina-frontend
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

### 3.2 Configurar Variables de Entorno

En **"Environment Variables"**, agregar:

```bash
# URL del backend en Render
REACT_APP_API_URL=https://control-disciplina-backend.onrender.com
```

**Para todos los entornos:** Production, Preview, Development

### 3.3 Desplegar

1. Click en **"Deploy"**
2. Esperar 2-5 minutos
3. Una vez completado, Vercel proporcionará una URL:
   ```
   https://control-disciplina-frontend.vercel.app
   ```

### 3.4 Configurar Dominio (Opcional)

Si tienes un dominio personalizado:
1. Ir a **Settings** → **Domains**
2. Agregar tu dominio
3. Configurar DNS según instrucciones de Vercel

---

## 4. Configuración Post-Despliegue

### 4.1 Actualizar Variables en Render (Backend)

Ahora que tienes la URL de Vercel, actualizar en Render:

```bash
FRONTEND_URL=https://control-disciplina-frontend.vercel.app
CORS_ORIGIN=https://control-disciplina-frontend.vercel.app
```

**Guardar y esperar que Render redeploy automáticamente (~2 min)**

### 4.2 Inicializar Base de Datos

El backend inicializará automáticamente:
- ✅ Tablas (Users, Students, Incidents, Courses, etc.)
- ✅ Roles por defecto (SUPER_ADMIN, ADMIN, etc.)
- ✅ Permisos por defecto (21 permisos)
- ✅ Materias por defecto

### 4.3 Crear Usuario Administrador Inicial

**Opción A: Via API (Recomendado)**

```bash
# POST a /api/auth/register con rol SUPER_ADMIN
curl -X POST https://control-disciplina-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@colegio.edu",
    "password": "Admin2024!Secure",
    "firstName": "Super",
    "lastName": "Administrador",
    "role": "SUPER_ADMIN"
  }'
```

**Opción B: Via SQL directo en Render**

1. Ir a Render → PostgreSQL → **"Connect"** → **"PSQL Command"**
2. Ejecutar:
```sql
-- Ver el ID del rol SUPER_ADMIN
SELECT id, name FROM "Roles" WHERE name = 'SUPER_ADMIN';

-- Insertar usuario (la contraseña será hasheada por la app)
INSERT INTO "Users" (
  id, email, password, "firstName", "lastName", "roleId", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@colegio.edu',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GjGJVhN8p4CO', -- Password: Admin123!
  'Super',
  'Administrador',
  (SELECT id FROM "Roles" WHERE name = 'SUPER_ADMIN'),
  NOW(),
  NOW()
);
```

---

## 5. Verificación y Testing

### 5.1 Verificar Backend

```bash
# Health check
curl https://control-disciplina-backend.onrender.com/api/auth/health

# Login test
curl -X POST https://control-disciplina-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@colegio.edu","password":"Admin2024!Secure"}'
```

### 5.2 Verificar Frontend

1. Abrir: `https://control-disciplina-frontend.vercel.app`
2. Verificar que carga la página de login
3. Intentar login con usuario admin
4. Si MFA está habilitado, verificar recepción de email

### 5.3 Test Completo de Funcionalidad

- [ ] Login exitoso
- [ ] MFA funciona (email recibido)
- [ ] Dashboard carga correctamente
- [ ] Crear estudiante
- [ ] Crear incidente
- [ ] Ver reportes
- [ ] Gestión de roles (SUPER_ADMIN)
- [ ] Logout

---

## 6. Troubleshooting

### Problema: Backend no conecta a Base de Datos

**Síntomas:**
```
Error: Connection refused
ECONNREFUSED
```

**Solución:**
1. Verificar que usas la **Internal Database URL** (no la External)
2. Verificar credenciales en variables de entorno
3. Check logs en Render Dashboard

### Problema: CORS Error en Frontend

**Síntomas:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:**
1. Verificar `CORS_ORIGIN` en backend incluye la URL exacta de Vercel
2. No incluir trailing slash en URL
3. Verificar `FRONTEND_URL` también está configurada
4. Redeploy backend después de cambios

### Problema: MFA emails no llegan

**Síntomas:**
- Usuario no recibe código OTP

**Solución:**
1. Verificar Gmail App Password (16 caracteres, sin espacios)
2. Verificar `EMAIL_HOST=smtp.gmail.com` y `EMAIL_PORT=587`
3. Check logs en Render para errores SMTP
4. Verificar que la cuenta Gmail permite "Less secure apps" o usa App Password

### Problema: Render Free Tier "Spins Down"

**Síntomas:**
- Primera petición tarda 30-60 segundos

**Solución:**
- Esto es normal en el plan gratuito
- Render "duerme" el servicio después de 15 minutos de inactividad
- Considerar upgrade a plan de pago ($7/mes) para keep-alive

### Problema: Build Fails en Vercel

**Síntomas:**
```
npm ERR! missing script: build
```

**Solución:**
1. Verificar que `Root Directory = frontend`
2. Verificar que `Build Command = npm run build`
3. Check que `package.json` tiene script `build`

### Ver Logs

**Render:**
- Dashboard → Web Service → **"Logs"** (real-time)

**Vercel:**
- Dashboard → Project → **"Deployments"** → Click deployment → **"View Logs"**

---

## 📊 Resumen de URLs y Servicios

| Servicio | URL | Plan |
|----------|-----|------|
| **Frontend** | https://control-disciplina-frontend.vercel.app | Free |
| **Backend** | https://control-disciplina-backend.onrender.com | Free |
| **Base de Datos** | Internal URL (Render) | Free |
| **Repositorio** | https://github.com/kanapo854/ControlDisciplina | - |

---

## 🔒 Checklist de Seguridad Post-Despliegue

- [ ] JWT_SECRET único y seguro (64+ caracteres)
- [ ] MFA_SECRET único y seguro (32+ caracteres)
- [ ] Database password fuerte (16+ caracteres)
- [ ] Gmail App Password configurado (no password real)
- [ ] CORS_ORIGIN configurado correctamente
- [ ] SSL_ENABLED=false (Render maneja HTTPS automáticamente)
- [ ] Variables de entorno NO están en el código
- [ ] .env files en .gitignore
- [ ] Usuario SUPER_ADMIN inicial creado
- [ ] Passwords de usuarios de prueba cambiadas

---

## 📈 Monitoreo Continuo

### Render
- Logs en tiempo real
- Alertas de downtime
- Métricas de performance

### Vercel
- Analytics (opcional, plan de pago)
- Build logs
- Deployment previews para cada PR

---

## 🚀 Actualizaciones Futuras

### Proceso de Update

1. **Hacer cambios en rama `gestion_usuarios`**
2. **Merge a `production`**
   ```bash
   git checkout production
   git merge gestion_usuarios
   git push origin production
   ```
3. **Deploy automático**
   - Render detecta push y redeploy automáticamente
   - Vercel detecta push y redeploy automáticamente

### Rollback

Si algo sale mal:

**Render:**
1. Dashboard → Web Service → **"Events"**
2. Click en deployment anterior
3. **"Redeploy"**

**Vercel:**
1. Dashboard → Project → **"Deployments"**
2. Click en deployment anterior
3. **"Promote to Production"**

---

## 📞 Soporte

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Repositorio:** https://github.com/kanapo854/ControlDisciplina/issues

---

## ✅ Estado del Despliegue

- [ ] Base de Datos creada en Render
- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] CORS configurado
- [ ] Usuario admin creado
- [ ] Testing completo realizado
- [ ] Documentación actualizada

**¡Listo para producción! 🎉**
