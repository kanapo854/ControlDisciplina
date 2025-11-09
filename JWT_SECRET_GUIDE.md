# Guía de Seguridad: JWT_SECRET

## 🔐 Generar JWT_SECRET Seguro

El `JWT_SECRET` es crítico para la seguridad de tu aplicación. Nunca uses valores predecibles o de ejemplo en producción.

---

## ✅ Métodos para generar un JWT_SECRET seguro

### Método 1: Node.js (Recomendado)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Salida ejemplo:
```
a8f5f167f44f4964e6c998dee827110c03e7a5f6d5f6c5d5f5f5f5f5f5f5f5f5
```

### Método 2: OpenSSL

```bash
openssl rand -base64 64
```

### Método 3: Python

```bash
python3 -c "import secrets; print(secrets.token_hex(64))"
```

### Método 4: Generador Online (Usar con precaución)

Solo si no tienes acceso a las herramientas anteriores:
- https://randomkeygen.com/
- Seleccionar "CodeIgniter Encryption Keys" o similar

---

## 📝 Configurar en tu proyecto

### 1. Generar el secret

```bash
# Generar y copiar al portapapeles (en Linux/Mac)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" | pbcopy

# En Windows con PowerShell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" | Set-Clipboard
```

### 2. Actualizar archivo .env

```env
# ❌ MAL - No usar valores de ejemplo
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# ✅ BIEN - Usar valor generado aleatoriamente
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c03e7a5f6d5f6c5d5f5f5f5f5f5f5f5f5f5f5a8f5f167f44f4964e6c998dee827110c

# También configurar expiración apropiada
JWT_EXPIRE=7d
```

### 3. NUNCA commitear el archivo .env

```bash
# Verificar que .env esté en .gitignore
echo ".env" >> .gitignore

# Verificar que no esté trackeado
git status

# Si aparece, removerlo del seguimiento
git rm --cached .env
```

---

## ⚠️ Buenas Prácticas

### ✅ Hacer:
- Usar mínimo 32 caracteres (recomendado 64+)
- Usar caracteres aleatorios
- Usar diferente secret para desarrollo y producción
- Guardar el secret de producción de forma segura (gestores de contraseñas, vaults)
- Rotar el secret periódicamente (cada 3-6 meses)

### ❌ No hacer:
- Usar palabras del diccionario
- Usar valores de ejemplo o tutoriales
- Compartir el secret en código fuente
- Usar el mismo secret en múltiples ambientes
- Hardcodear el secret en el código

---

## 🔄 Rotar JWT_SECRET

Si necesitas cambiar el JWT_SECRET (por seguridad o compromiso):

### 1. Preparar el cambio

```env
# Agregar nuevo secret (temporal)
JWT_SECRET_NEW=nuevo_secret_generado_aleatoriamente
```

### 2. Notificar a usuarios

Opcionalmente, avisar que habrá una breve interrupción de sesión.

### 3. Actualizar secret

```env
# Reemplazar el secret antiguo
JWT_SECRET=nuevo_secret_generado_aleatoriamente
```

### 4. Reiniciar servidor

```bash
pm2 restart control-disciplina-backend
```

### 5. Efecto

Todos los tokens existentes serán invalidados. Los usuarios deberán hacer login nuevamente.

---

## 🔍 Verificar seguridad del secret actual

```bash
# Verificar longitud
node -e "console.log('Longitud:', process.env.JWT_SECRET.length)"

# Debería ser >= 32, idealmente 64+
```

---

## 🚨 ¿Qué hacer si el secret fue comprometido?

### Pasos inmediatos:

1. **Generar nuevo secret inmediatamente**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Actualizar .env y reiniciar servidor**
   ```bash
   # Actualizar JWT_SECRET en .env
   pm2 restart all
   ```

3. **Invalidar todos los tokens existentes**
   - Esto sucede automáticamente al cambiar el secret
   - Todos los usuarios deberán hacer login nuevamente

4. **Investigar el alcance del compromiso**
   - Revisar logs de acceso
   - Verificar actividad sospechosa
   - Notificar a usuarios si es necesario

5. **Implementar medidas adicionales**
   - Activar MFA si no está habilitado
   - Revisar otras credenciales
   - Auditar permisos de acceso

---

## 📚 Referencias

- [OWASP - Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)

---

**Última actualización:** Noviembre 2025
