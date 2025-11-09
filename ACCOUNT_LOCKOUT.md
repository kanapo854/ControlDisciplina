# 🔒 Sistema de Bloqueo de Cuenta - Actualización

## ✅ Implementación Completada

### Cambios realizados para mejorar la seguridad del sistema de autenticación.

---

## 📊 **Nueva Configuración de Bloqueo**

### Política actualizada:
- **Intentos permitidos:** 3 (antes 5)
- **Duración del bloqueo:** 15 minutos
- **Desbloqueo automático:** Sí
- **Desbloqueo manual:** Sí (por admin de usuarios)

---

## 🔄 **Flujo de Bloqueo Actualizado**

```
Intento 1: ❌ Contraseña incorrecta → "2 intentos restantes"
Intento 2: ❌ Contraseña incorrecta → "1 intento restante"
Intento 3: ❌ Contraseña incorrecta → 🔒 "Cuenta bloqueada por 15 minutos"

... Opciones de desbloqueo ...

Opción 1: Esperar 15 minutos → Desbloqueo automático
Opción 2: Admin desbloquea manualmente → Desbloqueo inmediato
Opción 3: Login exitoso (si ya expiró) → Contador reseteado
```

---

## 🛠️ **Cambios Técnicos**

### Backend

#### 1. authController.js
- ✅ `MAX_ATTEMPTS` reducido de 5 a 3

#### 2. userRoutes.js
- ✅ Nuevo endpoint: `PUT /api/users/:id/unlock`
- ✅ Permisos: Solo admin de usuarios
- ✅ Acción: Resetea `failedLoginAttempts` y `accountLockedUntil`

### Frontend

#### 1. api.js
- ✅ Nuevo servicio: `userService.unlockUser(id)`

#### 2. UsersList.js
- ✅ Indicador visual de cuenta bloqueada (badge naranja "🔒 Bloqueado")
- ✅ Botón de desbloqueo (icono candado abierto)
- ✅ Mutación para desbloquear usuarios
- ✅ Notificaciones de éxito/error
- ✅ Actualización automática de la lista

---

## 🎨 **Interfaz de Usuario**

### Indicadores Visuales

#### Estado del usuario:
- 🟢 **Badge Verde:** "Activo" - Usuario activo y sin bloqueos
- 🔴 **Badge Rojo:** "Inactivo" - Usuario desactivado
- 🟠 **Badge Naranja:** "🔒 Bloqueado" - Cuenta bloqueada temporalmente

### Acciones disponibles:

| Icono | Acción | Color | Permiso |
|-------|--------|-------|---------|
| ✏️ Lápiz | Editar usuario | Azul | Admin usuarios |
| 🔓 Candado abierto | Desbloquear cuenta | Naranja | Admin usuarios |
| ✅ Check | Activar usuario | Verde | Admin usuarios |
| ❌ X | Desactivar usuario | Rojo | Admin usuarios |

---

## 📝 **Instrucciones de Uso**

### Para el Admin de Usuarios:

#### Ver usuarios bloqueados:
1. Ir a "Gestión de Usuarios"
2. Buscar usuarios con badge naranja "🔒 Bloqueado"

#### Desbloquear un usuario:
1. Localizar el usuario bloqueado en la lista
2. Hacer clic en el icono de candado abierto 🔓
3. Confirmar la acción
4. El usuario queda desbloqueado inmediatamente

#### Respuestas esperadas:
- ✅ **Éxito:** "Usuario desbloqueado exitosamente"
- ❌ **Error:** "Error al desbloquear usuario" (con detalles)

---

## 🔍 **Testing**

### Test 1: Bloqueo por intentos fallidos

```bash
# Terminal 1: Intentar login 3 veces con contraseña incorrecta
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'

# Respuesta intento 1:
# {"success":false,"error":"Credenciales inválidas","remainingAttempts":2}

# Respuesta intento 2:
# {"success":false,"error":"Credenciales inválidas","remainingAttempts":1}

# Respuesta intento 3:
# {"success":false,"error":"Cuenta bloqueada por 15 minutos...","lockedUntil":"..."}
```

### Test 2: Desbloqueo manual

```bash
# Como admin, desbloquear usuario
curl -X PUT http://localhost:5000/api/users/USER_ID/unlock \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Respuesta esperada:
# {"success":true,"message":"Cuenta desbloqueada exitosamente","data":{...}}
```

### Test 3: Verificar en UI
1. Login fallido 3 veces
2. Verificar que aparece badge "🔒 Bloqueado"
3. Hacer clic en botón de desbloqueo
4. Verificar que desaparece el badge
5. Intentar login nuevamente (debe funcionar)

---

## 📊 **Respuestas de la API**

### Login fallido - Con intentos restantes:
```json
{
  "success": false,
  "error": "Credenciales inválidas",
  "remainingAttempts": 2
}
```

### Login fallido - Cuenta bloqueada:
```json
{
  "success": false,
  "error": "Cuenta bloqueada por 15 minutos debido a múltiples intentos fallidos",
  "lockedUntil": "2025-11-09T14:30:00.000Z"
}
```

### Desbloqueo exitoso:
```json
{
  "success": true,
  "message": "Cuenta desbloqueada exitosamente",
  "data": {
    "id": "uuid",
    "name": "Usuario",
    "email": "user@example.com",
    "failedLoginAttempts": 0,
    "accountLockedUntil": null,
    ...
  }
}
```

---

## 🚨 **Códigos HTTP**

| Código | Situación | Descripción |
|--------|-----------|-------------|
| 200 | Login exitoso | Usuario autenticado correctamente |
| 401 | Credenciales inválidas | Email o contraseña incorrecta |
| 423 | Locked | Cuenta bloqueada temporalmente |
| 403 | Forbidden | Sin permisos para desbloquear |
| 404 | Not Found | Usuario no encontrado |

---

## 🔐 **Seguridad**

### Mejoras implementadas:
1. ✅ **Menos intentos:** De 5 a 3 (75% más restrictivo)
2. ✅ **Control administrativo:** Admin puede intervenir
3. ✅ **Visibilidad:** Indicadores claros de estado
4. ✅ **Auditoría:** Logs de intentos fallidos
5. ✅ **Auto-recuperación:** Desbloqueo automático tras 15 min

### Cumplimiento OWASP:
- ✅ **A07:2021** – Identification and Authentication Failures
- ✅ Prevención de ataques de fuerza bruta
- ✅ Protección de cuentas de usuario
- ✅ Control de acceso administrativo

---

## 📚 **Logs y Auditoría**

### Eventos registrados:
- 🔴 Intento de login fallido
- 🔒 Cuenta bloqueada
- 🔓 Cuenta desbloqueada (manual)
- ⏰ Cuenta desbloqueada (automático)
- ✅ Login exitoso con reseteo de contador

### Campos en BD:
```sql
-- Campos agregados a tabla users
failed_login_attempts INTEGER DEFAULT 0
account_locked_until TIMESTAMP NULL
```

---

## 💡 **Recomendaciones**

### Para usuarios finales:
1. Usar contraseñas seguras
2. No compartir credenciales
3. Contactar admin si quedan bloqueados

### Para administradores:
1. Revisar usuarios bloqueados regularmente
2. Investigar bloqueos frecuentes
3. Considerar activar MFA para usuarios sensibles
4. Educar usuarios sobre seguridad

### Para desarrollo futuro:
1. ⚠️ Implementar MFA/2FA
2. ⚠️ Notificaciones por email de bloqueo
3. ⚠️ Dashboard de intentos fallidos
4. ⚠️ Lista negra de IPs sospechosas
5. ⚠️ CAPTCHA tras primer intento fallido

---

## 🐛 **Troubleshooting**

### "No aparece el botón de desbloqueo"
- **Causa:** Usuario no tiene rol de admin de usuarios
- **Solución:** Verificar permisos del usuario actual

### "Error al desbloquear usuario"
- **Causa:** Pérdida de conexión o permisos insuficientes
- **Solución:** Verificar conexión a backend y permisos

### "Badge de bloqueado no desaparece"
- **Causa:** Caché del navegador
- **Solución:** Refrescar página (F5)

---

## 📞 **Soporte**

Si tienes problemas o preguntas:
1. Consulta este documento
2. Revisa los logs del servidor
3. Verifica la consola del navegador
4. Contacta al equipo de desarrollo

---

**Implementado:** Noviembre 2025  
**Versión:** 2.0  
**Cumplimiento:** OWASP A07:2021  
**Autor:** Sistema Control Disciplina
