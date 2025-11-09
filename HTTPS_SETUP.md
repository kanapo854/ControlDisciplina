# Configuración de HTTPS/TLS (SSL)

## 🔒 Seguridad OWASP A02: Fallas Criptográficas

Este documento describe cómo configurar HTTPS/TLS para el servidor backend en producción.

---

## 📋 Requisitos

### Certificados SSL
Necesitas obtener certificados SSL válidos. Hay varias opciones:

#### Opción 1: Let's Encrypt (GRATUITO - Recomendado)
```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot

# Obtener certificado para tu dominio
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com

# Los certificados se guardarán en:
# /etc/letsencrypt/live/tudominio.com/privkey.pem  (clave privada)
# /etc/letsencrypt/live/tudominio.com/fullchain.pem (certificado)
```

#### Opción 2: Certificado Auto-firmado (Solo para desarrollo/testing)
```bash
# Generar certificado auto-firmado
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes

# Ubicar en el proyecto
mkdir -p certs
mv server.key certs/
mv server.crt certs/
```

#### Opción 3: Certificado Comercial
Comprar un certificado de autoridades como DigiCert, GlobalSign, etc.

---

## ⚙️ Configuración

### 1. Variables de Entorno

Crear/actualizar el archivo `.env`:

```env
# Modo de ejecución
NODE_ENV=production

# Puerto HTTPS (443 es el estándar)
PORT=443

# Puerto HTTP para redirección (80 es el estándar)
HTTP_PORT=80

# Rutas a los certificados SSL
SSL_KEY_PATH=/etc/letsencrypt/live/tudominio.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/tudominio.com/fullchain.pem

# Opcional: Certificate Authority (CA)
# SSL_CA_PATH=/etc/letsencrypt/live/tudominio.com/chain.pem

# JWT Secret (IMPORTANTE: cambiar en producción)
JWT_SECRET=tu_secret_super_seguro_minimo_32_caracteres_aleatorios_2024
JWT_EXPIRE=7d

# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/control_disciplina

# Frontend URL
FRONTEND_URL=https://tudominio.com
```

### 2. Permisos de archivos

Los certificados deben tener permisos apropiados:

```bash
# Dar permisos de lectura al usuario que ejecuta Node.js
sudo chmod 644 /etc/letsencrypt/live/tudominio.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/tudominio.com/privkey.pem

# Asegurar que el usuario de Node.js tenga acceso
sudo chown node:node /etc/letsencrypt/live/tudominio.com/*
```

### 3. Firewall

Abrir puertos necesarios:

```bash
# Puerto HTTPS (443)
sudo ufw allow 443/tcp

# Puerto HTTP (80) para redirección
sudo ufw allow 80/tcp

# Verificar estado
sudo ufw status
```

---

## 🚀 Ejecución en Producción

### Con Node.js directo

```bash
# Asegurarse de tener variables de entorno configuradas
export NODE_ENV=production
export PORT=443
export SSL_KEY_PATH=/ruta/a/privkey.pem
export SSL_CERT_PATH=/ruta/a/fullchain.pem

# Ejecutar con privilegios (necesario para puerto 443)
sudo -E npm start
```

### Con PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo de configuración PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'control-disciplina-backend',
    script: 'src/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 443,
      HTTP_PORT: 80,
      SSL_KEY_PATH: '/etc/letsencrypt/live/tudominio.com/privkey.pem',
      SSL_CERT_PATH: '/etc/letsencrypt/live/tudominio.com/fullchain.pem'
    }
  }]
};
EOF

# Iniciar con PM2
sudo pm2 start ecosystem.config.js

# Ver logs
sudo pm2 logs

# Configurar inicio automático
sudo pm2 startup
sudo pm2 save
```

### Con Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Copiar certificados SSL
COPY certs/ /etc/ssl/

EXPOSE 443 80

CMD ["node", "src/server.js"]
```

```bash
# Construir imagen
docker build -t control-disciplina-backend .

# Ejecutar contenedor
docker run -d \
  --name backend \
  -p 443:443 \
  -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -e NODE_ENV=production \
  -e SSL_KEY_PATH=/etc/letsencrypt/live/tudominio.com/privkey.pem \
  -e SSL_CERT_PATH=/etc/letsencrypt/live/tudominio.com/fullchain.pem \
  control-disciplina-backend
```

---

## 🔄 Renovación Automática de Certificados (Let's Encrypt)

Los certificados de Let's Encrypt expiran cada 90 días. Configurar renovación automática:

```bash
# Agregar tarea cron para renovación
sudo crontab -e

# Agregar esta línea (renovar cada día a las 2:00 AM)
0 2 * * * certbot renew --quiet --deploy-hook "pm2 restart control-disciplina-backend"
```

---

## ✅ Verificación

### 1. Verificar que el servidor esté corriendo

```bash
# Ver logs
sudo pm2 logs control-disciplina-backend

# Debería mostrar:
# ✅ Servidor HTTPS seguro ejecutándose en puerto 443
# 🔒 TLS habilitado con ciphers fuertes
# ↪️  Servidor HTTP en puerto 80 redirigiendo a HTTPS
```

### 2. Probar endpoint

```bash
# Probar HTTPS
curl https://tudominio.com/api/health

# Probar redirección HTTP -> HTTPS
curl -I http://tudominio.com/api/health
# Debería retornar: HTTP/1.1 301 Moved Permanently
# Location: https://tudominio.com/api/health
```

### 3. Verificar certificado SSL

```bash
# Verificar certificado con OpenSSL
openssl s_client -connect tudominio.com:443 -servername tudominio.com

# O usar herramienta online:
# https://www.ssllabs.com/ssltest/
```

---

## 🛡️ Características de Seguridad Implementadas

- ✅ **TLS 1.2 y TLS 1.3** - Protocolos seguros habilitados
- ✅ **TLS 1.0 y TLS 1.1** - Deshabilitados (inseguros)
- ✅ **Ciphers fuertes** - Solo algoritmos seguros permitidos
- ✅ **Perfect Forward Secrecy** - Mediante ECDHE
- ✅ **Redirección HTTP → HTTPS** - Forzar conexiones seguras
- ✅ **HSTS** - Configurado en Helmet middleware
- ✅ **Certificados válidos** - De autoridad confiable

---

## ⚠️ Troubleshooting

### Error: "EACCES: permission denied, bind"
```bash
# Solución: Ejecutar con privilegios
sudo -E npm start
# O usar authbind/setcap
```

### Error: "Certificados SSL no encontrados"
```bash
# Verificar que existan los archivos
ls -la /etc/letsencrypt/live/tudominio.com/

# Verificar variables de entorno
echo $SSL_KEY_PATH
echo $SSL_CERT_PATH
```

### Error: "self signed certificate"
```bash
# Normal en desarrollo con certificados auto-firmados
# En producción, usar certificados de CA confiable (Let's Encrypt)
```

---

## 📚 Referencias

- [OWASP A02:2021 – Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)

---

## 🔐 Seguridad Adicional

Para mejorar aún más la seguridad, considera:

1. **Usar un proxy reverso** (Nginx/Apache) delante de Node.js
2. **Implementar rate limiting** en el proxy
3. **Configurar CORS** apropiadamente
4. **Habilitar HTTP/2** para mejor rendimiento
5. **Configurar CAA DNS records** para tu dominio
6. **Monitorear certificados** con herramientas como SSL Monitor

---

**Última actualización:** Noviembre 2025
**Mantenido por:** Equipo de Desarrollo - Control Disciplina
