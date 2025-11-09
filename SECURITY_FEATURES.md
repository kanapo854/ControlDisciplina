# Características de Seguridad Avanzadas - Control Disciplina

## 📋 Resumen

Este documento describe las características de seguridad avanzadas implementadas en el sistema de Control Disciplina:

1. **MFA/2FA por Email** - Autenticación de dos factores mediante código OTP enviado por correo
2. **Expiración de Contraseñas** - Política de cambio obligatorio cada 90 días
3. **Historial de Contraseñas** - Prevención de reutilización de las últimas 5 contraseñas

---

## 🔐 1. MFA/2FA por Email

### Descripción
Sistema de autenticación de dos factores que envía un código de 6 dígitos al email del usuario después de un login exitoso.

### Características

- **Código OTP de 6 dígitos**: Generado aleatoriamente y único por sesión
- **Expiración de 5 minutos**: Los códigos expiran automáticamente
- **Email con formato HTML**: Mensajes profesionales y legibles
- **Reenvío de código**: Los usuarios pueden solicitar un nuevo código
- **Habilitación opcional**: Cada usuario puede activar/desactivar MFA

### Campos en la Base de Datos

```sql
-- Tabla: users
mfa_enabled BOOLEAN DEFAULT FALSE     -- Si MFA está habilitado para el usuario
mfa_secret VARCHAR(255)              -- Secret para TOTP (reservado para futuro)
```

### Flujo de Autenticación con MFA

```
1. Usuario ingresa email y contraseña
   ↓
2. Sistema valida credenciales
   ↓
3. Si MFA está habilitado:
   - Genera código OTP de 6 dígitos
   - Envía código por email
   - Retorna { mfaRequired: true, userId }
   ↓
4. Usuario ingresa código recibido
   ↓
5. Sistema valida código
   ↓
6. Si es válido: genera JWT token
   Si es inválido: retorna error
```

### Endpoints API

#### POST /api/auth/verify-mfa
Verifica el código MFA ingresado por el usuario.

**Request:**
```json
{
  "userId": "uuid-del-usuario",
  "code": "123456"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": { ...userData }
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "Código inválido o expirado"
}
```

#### POST /api/auth/resend-mfa
Reenvía un nuevo código MFA al usuario.

**Request:**
```json
{
  "userId": "uuid-del-usuario"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código reenviado a tu email"
}
```

#### PUT /api/auth/mfa-settings
Habilita o deshabilita MFA para el usuario autenticado.

**Request:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "MFA habilitado exitosamente",
  "mfaEnabled": true
}
```

### Configuración de Email

Se requiere configurar las siguientes variables de entorno en `.env`:

```env
# Configuración de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM_NAME=Control Disciplina
```

**Para Gmail:**
1. Habilita la verificación en 2 pasos en tu cuenta de Google
2. Genera una contraseña de aplicación en https://myaccount.google.com/apppasswords
3. Usa esa contraseña en `EMAIL_PASSWORD`

**Para otros proveedores:**
- **Outlook/Hotmail**: `smtp.office365.com`, puerto `587`
- **SendGrid**: `smtp.sendgrid.net`, puerto `587`
- **Mailgun**: Consulta documentación de Mailgun

---

## 🕐 2. Expiración de Contraseñas (90 días)

### Descripción
Las contraseñas deben cambiarse cada 90 días. El sistema envía advertencias por email a los 7, 3 y 1 días antes de expirar.

### Características

- **Expiración automática**: Después de 90 días desde el último cambio
- **Advertencias por email**: A los 7, 3 y 1 días antes de expirar
- **Bloqueo en login**: Si la contraseña expiró, debe cambiarse antes de continuar
- **Verificación diaria**: Un scheduler verifica expiración todos los días a las 2 AM
- **Actualización automática**: Campo `lastPasswordChange` se actualiza en cada cambio

### Campos en la Base de Datos

```sql
-- Tabla: users
last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Fecha del último cambio
password_expired BOOLEAN DEFAULT FALSE                   -- Si la contraseña está expirada
```

### Flujo de Expiración

```
Verificación Diaria (2 AM)
↓
Para cada usuario activo:
  - Calcular días desde último cambio
  - Si >= 90 días: marcar como expirada y enviar notificación
  - Si quedan 7, 3 o 1 días: enviar advertencia
```

### Login con Contraseña Expirada

```
Usuario intenta login
↓
Credenciales válidas
↓
Sistema verifica expiración
↓
Si expirada:
  - Retorna { passwordExpired: true, userId }
  - Usuario debe usar endpoint reset-expired-password
  - No se genera JWT hasta cambiar contraseña
```

### Endpoints API

#### POST /api/auth/reset-expired-password
Cambia una contraseña expirada.

**Request:**
```json
{
  "userId": "uuid-del-usuario",
  "newPassword": "NuevaContraseña123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": { ...userData },
  "message": "Contraseña actualizada exitosamente"
}
```

### Scheduler de Verificación

El scheduler se inicia automáticamente cuando arranca el servidor:

```javascript
// En server.js
startPasswordExpirationScheduler();
```

**Configuración:**
- **Hora de ejecución**: 2:00 AM (configurable en passwordExpirationService.js)
- **Frecuencia**: Diaria
- **Días de advertencia**: 7, 3, 1 (configurable en passwordExpirationService.js)

### Verificación Manual

Para ejecutar la verificación manualmente:

```bash
node src/scripts/checkPasswordExpiration.js
```

O desde código:

```javascript
const { checkPasswordExpiration } = require('./services/passwordExpirationService');
await checkPasswordExpiration();
```

---

## 📚 3. Historial de Contraseñas

### Descripción
El sistema almacena las últimas 5 contraseñas del usuario y previene su reutilización.

### Características

- **Almacenamiento seguro**: Contraseñas hasheadas con bcrypt
- **Límite de 5 contraseñas**: Solo se mantienen las últimas 5
- **Limpieza automática**: Se eliminan contraseñas antiguas al superar el límite
- **Validación en tiempo real**: Al cambiar contraseña, se verifica contra historial
- **Cascada de eliminación**: Si se elimina un usuario, se eliminan sus contraseñas históricas

### Tabla de Base de Datos

```sql
CREATE TABLE password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_history_user_id ON password_history(user_id);
CREATE INDEX idx_password_history_changed_at ON password_history(changed_at DESC);
```

### Modelo Sequelize

```javascript
// PasswordHistory.js
const PasswordHistory = sequelize.define('PasswordHistory', {
  id: { type: DataTypes.UUID, primaryKey: true },
  userId: { type: DataTypes.UUID, references: { model: 'users' } },
  passwordHash: { type: DataTypes.STRING },
  changedAt: { type: DataTypes.DATE }
});
```

### Asociaciones

```javascript
// En associations.js
User.hasMany(PasswordHistory, { foreignKey: 'userId', as: 'passwordHistory' });
PasswordHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
```

### Flujo de Validación

```
Usuario intenta cambiar contraseña
↓
Sistema valida contraseña actual
↓
Obtiene últimas 5 contraseñas del historial
↓
Para cada contraseña histórica:
  - Compara con bcrypt.compare()
  - Si coincide: rechazar cambio
↓
Si no coincide con ninguna:
  - Actualizar contraseña
  - Guardar en historial
  - Eliminar contraseñas antiguas (si > 5)
```

### Hook en User Model

```javascript
// En User.js - hooks.afterUpdate
afterUpdate: async (user) => {
  if (user.changed('password') && user.password) {
    // Guardar contraseña actual en historial
    await PasswordHistory.create({
      userId: user.id,
      passwordHash: user.password,
      changedAt: new Date()
    });
    
    // Mantener solo últimas 5
    const histories = await PasswordHistory.findAll({
      where: { userId: user.id },
      order: [['changedAt', 'DESC']],
      limit: 100
    });
    
    if (histories.length > 5) {
      const toDelete = histories.slice(5);
      await PasswordHistory.destroy({
        where: { id: toDelete.map(h => h.id) }
      });
    }
  }
}
```

### Validación en changePassword

```javascript
// Verificar contra historial
const passwordHistories = await PasswordHistory.findAll({
  where: { userId: user.id },
  order: [['changedAt', 'DESC']],
  limit: 5
});

for (const history of passwordHistories) {
  const isSame = await bcrypt.compare(newPassword, history.passwordHash);
  if (isSame) {
    return res.status(400).json({
      error: 'No puedes reutilizar una de tus últimas 5 contraseñas'
    });
  }
}
```

---

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd backend
npm install nodemailer speakeasy
```

### 2. Ejecutar Migración de Base de Datos

```bash
node src/scripts/addSecurityFeatures.js
```

Esto creará:
- Campos MFA en tabla `users`
- Campos de política de contraseñas en tabla `users`
- Tabla `password_history`
- Índices para optimización

### 3. Configurar Variables de Entorno

Agregar a `.env`:

```env
# JWT (ya existente)
JWT_SECRET=tu-secret-key-seguro-de-64-caracteres
JWT_EXPIRE=7d

# Configuración de Email (NUEVO)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-de-gmail
EMAIL_FROM_NAME=Control Disciplina

# URL del Frontend (ya existente)
FRONTEND_URL=http://localhost:3000
```

### 4. Reiniciar Servidor

```bash
npm start
```

El servidor iniciará automáticamente:
- Scheduler de verificación de contraseñas (2 AM diariamente)
- Servicios de email
- Servicios MFA

---

## 🧪 Testing

### Probar MFA

1. **Habilitar MFA para un usuario:**
```bash
curl -X PUT http://localhost:5000/api/auth/mfa-settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

2. **Intentar login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@test.com", "password": "password123"}'
```

Respuesta esperada:
```json
{
  "success": true,
  "mfaRequired": true,
  "userId": "uuid-del-usuario",
  "message": "Se ha enviado un código de verificación a tu email"
}
```

3. **Verificar código MFA:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-mfa \
  -H "Content-Type: application/json" \
  -d '{"userId": "uuid-del-usuario", "code": "123456"}'
```

### Probar Expiración de Contraseñas

1. **Ejecutar verificación manual:**
```bash
node -e "require('./src/services/passwordExpirationService').checkPasswordExpiration().then(() => process.exit())"
```

2. **Simular contraseña expirada:**
```sql
-- En PostgreSQL
UPDATE users 
SET last_password_change = NOW() - INTERVAL '91 days',
    password_expired = true
WHERE email = 'usuario@test.com';
```

3. **Intentar login:**
El sistema debe retornar `{ passwordExpired: true, userId: "..." }`

4. **Cambiar contraseña expirada:**
```bash
curl -X POST http://localhost:5000/api/auth/reset-expired-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-del-usuario",
    "newPassword": "NuevaContraseña123!"
  }'
```

### Probar Historial de Contraseñas

1. **Cambiar contraseña:**
```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "ContraseñaActual123!",
    "newPassword": "NuevaContraseña456!"
  }'
```

2. **Intentar reutilizar contraseña:**
```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "NuevaContraseña456!",
    "newPassword": "ContraseñaActual123!"
  }'
```

Respuesta esperada:
```json
{
  "success": false,
  "error": "No puedes reutilizar una de tus últimas 5 contraseñas"
}
```

3. **Ver historial en base de datos:**
```sql
SELECT u.email, ph.changed_at 
FROM password_history ph
JOIN users u ON ph.user_id = u.id
WHERE u.email = 'usuario@test.com'
ORDER BY ph.changed_at DESC;
```

---

## 🔍 Troubleshooting

### Emails no se envían

**Problema**: Los códigos MFA no llegan al email del usuario.

**Soluciones:**

1. **Verificar configuración de email en `.env`:**
   - EMAIL_USER y EMAIL_PASSWORD deben estar correctos
   - Para Gmail, usar contraseña de aplicación (no contraseña normal)

2. **Verificar logs del servidor:**
   ```
   ⚠️  Email not sent: transporter not configured
   ```
   Indica que faltan credenciales de email

3. **Probar manualmente:**
   ```javascript
   const { sendMFACode } = require('./src/services/emailService');
   await sendMFACode('test@example.com', '123456', 'Usuario Test');
   ```

4. **Verificar firewall/antivirus:**
   - Puede estar bloqueando puerto 587
   - Permitir conexiones salientes a smtp.gmail.com

### Scheduler no ejecuta

**Problema**: La verificación de contraseñas no se ejecuta automáticamente.

**Soluciones:**

1. **Verificar que el servidor esté corriendo:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Verificar logs de inicio:**
   ```
   ✅ Password expiration scheduler initialized
   ⏰ Password expiration scheduler started
      Next run: [fecha y hora]
   ```

3. **Ejecutar manualmente para testing:**
   ```bash
   node -e "require('./src/services/passwordExpirationService').checkPasswordExpiration()"
   ```

### Historial de contraseñas no funciona

**Problema**: El sistema permite reutilizar contraseñas recientes.

**Soluciones:**

1. **Verificar que la migración se ejecutó:**
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_name = 'password_history'
   );
   ```

2. **Verificar asociaciones:**
   ```javascript
   const { User, PasswordHistory } = require('./src/models');
   console.log(User.associations);
   console.log(PasswordHistory.associations);
   ```

3. **Verificar hook afterUpdate:**
   - Asegurarse que el hook en User.js está definido
   - Verificar que se está usando `user.update()` y no queries directas

---

## 📊 Métricas y Monitoreo

### Consultas SQL Útiles

**Usuarios con MFA habilitado:**
```sql
SELECT COUNT(*) as total_mfa_enabled
FROM users
WHERE mfa_enabled = true AND is_active = true;
```

**Contraseñas próximas a expirar (próximos 7 días):**
```sql
SELECT email, name, 
       90 - EXTRACT(DAY FROM NOW() - last_password_change) as days_remaining
FROM users
WHERE is_active = true
  AND password_expired = false
  AND last_password_change < NOW() - INTERVAL '83 days'
ORDER BY days_remaining;
```

**Usuarios con contraseñas expiradas:**
```sql
SELECT email, name, last_password_change
FROM users
WHERE password_expired = true AND is_active = true;
```

**Historial de cambios de contraseña por usuario:**
```sql
SELECT u.email, COUNT(*) as password_changes
FROM password_history ph
JOIN users u ON ph.user_id = u.id
GROUP BY u.id, u.email
ORDER BY password_changes DESC;
```

### Logs de Seguridad

El sistema registra eventos de seguridad en los logs:

```
📧 Warning sent to usuario@test.com (7 days remaining)
⚠️  Password expired for user: usuario@test.com
✅ MFA code sent to usuario@test.com
❌ Invalid MFA code attempt for user: uuid-del-usuario
```

Monitorear estos logs para detectar patrones sospechosos.

---

## 🚀 Próximos Pasos

### Mejoras Recomendadas

1. **Redis para OTP Storage**
   - Actualmente los códigos OTP se almacenan en memoria (Map)
   - En producción con múltiples instancias, usar Redis

2. **TOTP (Google Authenticator)**
   - Implementar alternativa a email OTP
   - Usar el campo `mfa_secret` ya existente

3. **Logs de Auditoría**
   - Registrar todos los cambios de contraseña
   - Registrar intentos de MFA fallidos
   - Tabla de auditoría con IP, user agent, etc.

4. **SMS como alternativa**
   - Integrar Twilio o similar para SMS OTP
   - Permitir al usuario elegir entre email/SMS

5. **Políticas configurables**
   - Hacer configurable los 90 días de expiración
   - Hacer configurable el límite de 5 contraseñas
   - Panel de administración para políticas

---

## 📞 Soporte

Para problemas o preguntas sobre estas características de seguridad, contactar al equipo de desarrollo o consultar:

- Documentación de Nodemailer: https://nodemailer.com/
- Documentación de Speakeasy: https://github.com/speakeasyjs/speakeasy
- Guía de seguridad OWASP: https://owasp.org/www-project-top-ten/

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0
