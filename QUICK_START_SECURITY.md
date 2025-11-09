# 🚀 Guía Rápida de Activación - Características de Seguridad

Esta guía te permite activar rápidamente las nuevas características de seguridad implementadas.

---

## ⏱️ Tiempo estimado: 10 minutos

---

## 📋 Paso 1: Instalar Dependencias (2 min)

Abrir terminal en la carpeta del backend:

```bash
cd backend
npm install
```

Esto instalará:
- `nodemailer` - Para envío de emails
- `speakeasy` - Para códigos OTP

---

## 📧 Paso 2: Configurar Email (3 min)

### Para Gmail (desarrollo/testing):

1. **Ve a tu cuenta de Google**: https://myaccount.google.com/security

2. **Activa verificación en 2 pasos** (si no está activada)

3. **Crea contraseña de aplicación**:
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro"
   - Nombra "Control Disciplina"
   - **Copia la contraseña de 16 caracteres**

4. **Edita el archivo `backend/.env`** y agrega:

```env
# Configuración de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=la-contraseña-de-16-digitos-sin-espacios
EMAIL_FROM_NAME=Control Disciplina
```

**⚠️ IMPORTANTE**: La contraseña NO es tu contraseña normal de Gmail, es la contraseña de aplicación de 16 dígitos.

### Verificar configuración:

```bash
node -e "require('dotenv').config(); console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅' : '❌', '\nEMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅' : '❌')"
```

---

## 🗄️ Paso 3: Ejecutar Migración de Base de Datos (2 min)

```bash
cd backend
node src/scripts/addSecurityFeatures.js
```

**Salida esperada:**

```
🔄 Ejecutando migración de características de seguridad...
✅ Migración completada exitosamente
   - Campos MFA agregados a la tabla users
   - Campos de política de contraseñas agregados
   - Tabla password_history creada
   - Índices creados para mejor rendimiento
```

---

## 🔄 Paso 4: Reiniciar Servidor (1 min)

```bash
cd backend
npm start
```

**Busca en los logs:**

```
✅ Password expiration scheduler initialized
⏰ Password expiration scheduler started
   Next run: [fecha y hora]
```

Si ves estos mensajes, ¡todo está funcionando! 🎉

---

## ✅ Paso 5: Probar las Características (2 min)

### Opción A: Prueba rápida con cURL

**1. Habilitar MFA para tu usuario:**

```bash
curl -X PUT http://localhost:5000/api/auth/mfa-settings \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"enabled\": true}"
```

**2. Cerrar sesión e intentar login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"tu-email@gmail.com\", \"password\": \"tu-contraseña\"}"
```

**Respuesta esperada:**

```json
{
  "success": true,
  "mfaRequired": true,
  "userId": "...",
  "message": "Se ha enviado un código de verificación a tu email"
}
```

**3. Revisar tu email** y buscar el código de 6 dígitos.

**4. Verificar el código:**

```bash
curl -X POST http://localhost:5000/api/auth/verify-mfa \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"el-uuid-de-respuesta-anterior\", \"code\": \"123456\"}"
```

### Opción B: Probar desde el frontend

1. Inicia sesión en la aplicación
2. Ve a tu perfil
3. Busca la opción "Habilitar autenticación de dos factores"
4. Actívala
5. Cierra sesión e intenta iniciar sesión nuevamente
6. El sistema debe pedirte el código que envió a tu email

---

## 🎯 ¿Qué acabas de activar?

### ✅ MFA/2FA por Email
- Códigos de 6 dígitos enviados por email
- Los usuarios pueden activar/desactivar MFA
- Códigos expiran en 5 minutos

### ✅ Expiración de Contraseñas (90 días)
- Las contraseñas expiran automáticamente cada 90 días
- Advertencias por email a los 7, 3 y 1 días antes
- Verificación diaria automática a las 2 AM

### ✅ Historial de Contraseñas
- No se pueden reutilizar las últimas 5 contraseñas
- Validación automática al cambiar contraseña
- Almacenamiento seguro con bcrypt

---

## 🐛 Problemas Comunes

### ❌ "Email not sent: transporter not configured"

**Causa**: Falta configuración de email en `.env`

**Solución**:
```bash
# Verificar que estén configuradas
grep EMAIL backend/.env

# Debe mostrar:
# EMAIL_HOST=smtp.gmail.com
# EMAIL_USER=tu-email@gmail.com
# EMAIL_PASSWORD=tu-contraseña-app
```

### ❌ "Invalid login" con Gmail

**Causa**: No estás usando contraseña de aplicación

**Solución**:
- NO uses tu contraseña normal de Gmail
- Crea una contraseña de aplicación en https://myaccount.google.com/apppasswords
- Usa esa contraseña de 16 dígitos en `EMAIL_PASSWORD`

### ❌ El código MFA no llega

**Soluciones**:

1. **Verifica spam/correo no deseado**
2. **Revisa los logs del servidor**:
   ```bash
   # Busca:
   ✅ Email sent: [message-id]
   # o
   ❌ Error sending email: [error]
   ```
3. **Prueba manualmente el envío**:
   ```bash
   node -e "
   require('dotenv').config();
   const { sendEmail } = require('./src/services/emailService');
   sendEmail({
     to: 'tu-email@gmail.com',
     subject: 'Test',
     text: 'Test message',
     html: '<p>Test message</p>'
   }).then(r => console.log(r)).finally(() => process.exit());
   "
   ```

### ❌ La migración falla

**Solución**:
```bash
# Verificar conexión a la base de datos
node -e "
const { sequelize } = require('./src/config/database');
sequelize.authenticate()
  .then(() => console.log('✅ Conexión OK'))
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => process.exit());
"

# Si funciona, reintentar migración
node src/scripts/addSecurityFeatures.js
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

- **SECURITY_FEATURES.md** - Documentación técnica completa
- **IMPLEMENTATION_SUMMARY.md** - Resumen de implementación
- **ENV_CONFIGURATION.md** - Guía de variables de entorno
- **HTTPS_SETUP.md** - Configuración SSL/TLS para producción

---

## 🎓 Próximos Pasos

1. ✅ **Configurar email en producción**: Usar SendGrid o Mailgun en lugar de Gmail
2. ✅ **Implementar UI frontend**: Páginas para MFA, cambio de contraseña, etc.
3. ✅ **Configurar Redis**: Para almacenar códigos OTP en producción
4. ✅ **Agregar rate limiting**: Limitar intentos de MFA
5. ✅ **Documentar para usuarios finales**: Guías de uso de MFA

---

## 🆘 ¿Necesitas Ayuda?

1. Revisa la sección "Troubleshooting" arriba
2. Consulta los logs del servidor: busca ✅, ⚠️ y ❌
3. Verifica que todas las variables de entorno estén configuradas
4. Revisa la documentación completa en SECURITY_FEATURES.md

---

**¡Listo!** Las características de seguridad están activadas y funcionando 🎉

Ahora puedes:
- Habilitar MFA para cualquier usuario
- Las contraseñas expirarán automáticamente cada 90 días
- Los usuarios no pueden reutilizar contraseñas recientes

---

**Fecha**: Noviembre 2025  
**Versión**: 1.0.0
