# Configuración de Variables de Entorno - Control Disciplina

## 📝 Archivo .env Completo

Copia este contenido en `backend/.env`:

```env
# ==============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ==============================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=control_disciplina
DB_USER=postgres
DB_PASSWORD=tu_password_postgres

# ==============================================
# CONFIGURACIÓN DE SERVIDOR
# ==============================================
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ==============================================
# SEGURIDAD - JWT
# ==============================================
# ⚠️ IMPORTANTE: Generar un secret seguro de 64 caracteres
# Usar: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=CAMBIAR_POR_SECRET_GENERADO_DE_64_CARACTERES
JWT_EXPIRE=7d

# ==============================================
# SEGURIDAD - EMAIL PARA MFA Y NOTIFICACIONES
# ==============================================
# Configuración para Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-de-16-digitos
EMAIL_FROM_NAME=Control Disciplina

# Configuración para Outlook/Hotmail (alternativa)
# EMAIL_HOST=smtp.office365.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=tu-email@outlook.com
# EMAIL_PASSWORD=tu-password
# EMAIL_FROM_NAME=Control Disciplina

# Configuración para SendGrid (alternativa)
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=apikey
# EMAIL_PASSWORD=tu-sendgrid-api-key
# EMAIL_FROM_NAME=Control Disciplina

# ==============================================
# HTTPS/TLS (Producción)
# ==============================================
# Descomentar y configurar para producción
# USE_HTTPS=true
# SSL_KEY_PATH=./certs/privkey.pem
# SSL_CERT_PATH=./certs/fullchain.pem
```

---

## 🔑 Generar JWT_SECRET

Ejecutar en terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Esto generará algo como:
```
a1b2c3d4e5f6....(128 caracteres)....xyz
```

Copiar ese valor completo en `JWT_SECRET`

---

## 📧 Configurar Email para MFA

### Opción 1: Gmail (Desarrollo)

1. **Habilitar verificación en 2 pasos:**
   - Ve a https://myaccount.google.com/security
   - Activar "Verificación en dos pasos"

2. **Crear contraseña de aplicación:**
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Nombra "Control Disciplina"
   - Copia la contraseña de 16 caracteres (sin espacios)
    ** hqmd lsid futg zkzb
3. **Configurar en .env:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # Sin espacios: abcdefghijklmnop
   EMAIL_FROM_NAME=Control Disciplina
   ```

### Opción 2: Outlook/Hotmail

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-contraseña-normal
EMAIL_FROM_NAME=Control Disciplina
```

### Opción 3: SendGrid (Producción Recomendada)

1. **Crear cuenta en SendGrid:**
   - https://sendgrid.com/
   - Plan gratuito: 100 emails/día

2. **Crear API Key:**
   - Settings → API Keys → Create API Key
   - Copiar el key (empieza con "SG.")

3. **Configurar en .env:**
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxx
   EMAIL_FROM_NAME=Control Disciplina
   ```

4. **Verificar dominio (opcional pero recomendado):**
   - Settings → Sender Authentication
   - Verify Single Sender o Domain Authentication

### Opción 4: Mailgun (Producción)

1. **Crear cuenta en Mailgun:**
   - https://www.mailgun.com/
   - Plan gratuito: 5,000 emails/mes

2. **Obtener credenciales SMTP:**
   - Dashboard → Sending → Domain settings → SMTP credentials

3. **Configurar en .env:**
   ```env
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=postmaster@tudominio.mailgun.org
   EMAIL_PASSWORD=tu-password-smtp
   EMAIL_FROM_NAME=Control Disciplina
   ```

---

## ⚙️ Variables por Entorno

### Desarrollo (localhost)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
USE_HTTPS=false
```

### Testing/Staging

```env
NODE_ENV=staging
PORT=5000
FRONTEND_URL=https://staging.tudominio.com
DB_HOST=tu-servidor-staging
USE_HTTPS=true
SSL_KEY_PATH=./certs/staging-privkey.pem
SSL_CERT_PATH=./certs/staging-fullchain.pem
```

### Producción

```env
NODE_ENV=production
PORT=443
FRONTEND_URL=https://tudominio.com
DB_HOST=tu-servidor-produccion
USE_HTTPS=true
SSL_KEY_PATH=/etc/letsencrypt/live/tudominio.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/tudominio.com/fullchain.pem

# Usar servicio profesional de email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.tu-api-key
```

---

## ✅ Verificar Configuración

### 1. Verificar que todas las variables están configuradas:

```bash
cd backend
node -e "require('dotenv').config(); console.log({
  DB_HOST: process.env.DB_HOST ? '✅' : '❌',
  JWT_SECRET: process.env.JWT_SECRET ? '✅' : '❌',
  EMAIL_USER: process.env.EMAIL_USER ? '✅' : '❌',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✅' : '❌'
})"
```

### 2. Probar conexión a base de datos:

```bash
node -e "
const { sequelize } = require('./src/config/database');
sequelize.authenticate()
  .then(() => console.log('✅ Conexión a BD exitosa'))
  .catch(err => console.error('❌ Error de conexión:', err.message))
  .finally(() => process.exit())
"
```

### 3. Probar envío de email:

```bash
node -e "
require('dotenv').config();
const { sendEmail } = require('./src/services/emailService');
sendEmail({
  to: 'tu-email-de-prueba@gmail.com',
  subject: 'Test de Configuración',
  text: 'Si recibes este email, la configuración es correcta',
  html: '<p>Si recibes este email, la <strong>configuración es correcta</strong></p>'
}).then(result => {
  console.log(result.success ? '✅ Email enviado' : '❌ Error:', result);
  process.exit();
});
"
```

---

## 🔒 Seguridad de Variables de Entorno

### ⚠️ NUNCA hacer:

- ❌ Commitear el archivo `.env` a git
- ❌ Compartir `.env` por email o chat
- ❌ Dejar valores por defecto en producción
- ❌ Usar la misma `JWT_SECRET` en desarrollo y producción

### ✅ Buenas prácticas:

- ✅ Agregar `.env` al `.gitignore`
- ✅ Crear `.env.example` con valores de ejemplo (sin secrets reales)
- ✅ Usar diferentes secrets para dev/staging/prod
- ✅ Rotar JWT_SECRET cada 6 meses
- ✅ Usar gestores de secrets en producción (AWS Secrets Manager, Azure Key Vault, etc.)

---

## 📋 Checklist de Configuración

### Configuración Inicial

- [ ] Archivo `.env` creado en `backend/`
- [ ] Variables de base de datos configuradas
- [ ] `JWT_SECRET` generado (64 caracteres)
- [ ] Email configurado (usuario y contraseña)
- [ ] `.env` agregado a `.gitignore`
- [ ] Servidor reiniciado
- [ ] Tests de conexión ejecutados

### Verificación

- [ ] Servidor arranca sin errores
- [ ] Conexión a base de datos exitosa
- [ ] Email de prueba enviado y recibido
- [ ] JWT token se genera correctamente
- [ ] Variables de entorno no están en git

---

## 🆘 Troubleshooting

### Error: "JWT_SECRET no está configurado"

**Solución:**
```bash
# Generar secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Agregarlo al .env
echo "JWT_SECRET=el-secret-generado" >> .env
```

### Error: "Email not sent: transporter not configured"

**Solución:**
```bash
# Verificar que estén configurados
grep EMAIL_ .env

# Debe mostrar:
# EMAIL_HOST=...
# EMAIL_USER=...
# EMAIL_PASSWORD=...
```

### Error: "Connection refused" al enviar email

**Soluciones:**

1. **Verificar puerto y host:**
   ```env
   EMAIL_PORT=587  # No 465
   EMAIL_SECURE=false  # Para puerto 587
   ```

2. **Para Gmail, verificar contraseña de aplicación:**
   - Debe ser de 16 caracteres sin espacios
   - Si tiene espacios, removerlos: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

3. **Verificar firewall:**
   ```bash
   # Windows
   Test-NetConnection smtp.gmail.com -Port 587
   
   # Linux/Mac
   nc -zv smtp.gmail.com 587
   ```

### Error: "Invalid login" con Gmail

**Solución:**
- NO usar contraseña normal de Gmail
- Usar contraseña de aplicación (ver sección Gmail arriba)
- Verificar que verificación en 2 pasos esté activada

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica el `.env` contra `.env.example`
2. Revisa los logs del servidor al iniciar
3. Ejecuta los tests de verificación arriba
4. Consulta `SECURITY_FEATURES.md` para más detalles

---

**Última actualización**: Noviembre 2025
