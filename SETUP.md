# Configuración de Desarrollo

Este archivo contiene instrucciones para configurar el entorno de desarrollo del proyecto Control de Disciplina.

## 🗃️ Base de Datos

### MongoDB Local

1. **Instalar MongoDB**:
   - Descargar desde: https://www.mongodb.com/try/download/community
   - Seguir instrucciones de instalación según tu sistema operativo

2. **Iniciar MongoDB**:
   ```bash
   # Windows
   mongod --dbpath "C:\data\db"
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Conectar a la base de datos**:
   ```bash
   mongo
   use control_disciplina
   ```

### MongoDB Atlas (Nube)

1. Crear cuenta en: https://www.mongodb.com/atlas
2. Crear cluster gratuito
3. Configurar IP whitelist (0.0.0.0/0 para desarrollo)
4. Crear usuario de base de datos
5. Obtener string de conexión y colocarlo en `.env`

## 👤 Usuario Inicial

Para crear el primer usuario administrador, puedes usar el siguiente script:

```javascript
// Ejecutar en MongoDB shell o usar en un script
db.users.insertOne({
  name: "Administrador",
  email: "admin@colegio.edu",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdefhFH3vPvRVD.", // password: admin123
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**Credenciales por defecto**:
- Email: `admin@colegio.edu`
- Contraseña: `admin123`

⚠️ **IMPORTANTE**: Cambiar estas credenciales en producción.

## 🔧 Variables de Entorno

### Backend (.env)
```env
# Entorno
NODE_ENV=development

# Servidor
PORT=5000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/control_disciplina
# O para Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/control_disciplina

# JWT
JWT_SECRET=mi_secreto_super_seguro_para_jwt_tokens_2024
JWT_EXPIRE=30d

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (opcional - para notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

### Frontend (.env)
```env
# API URL
REACT_APP_API_URL=http://localhost:5000/api

# Otros
REACT_APP_APP_NAME=Control de Disciplina
```

## 🚀 Comandos Útiles

### Instalación Completa
```bash
# Instalar dependencias del backend
cd backend && npm install

# Instalar dependencias del frontend
cd ../frontend && npm install
```

### Desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Producción
```bash
# Compilar frontend
cd frontend
npm run build

# Ejecutar backend en producción
cd ../backend
npm start
```

### Reiniciar Base de Datos
```bash
# Conectar a MongoDB
mongo

# Eliminar base de datos
use control_disciplina
db.dropDatabase()
```

## 📋 Lista de Verificación

### Antes de iniciar desarrollo:
- [ ] Node.js instalado (v16+)
- [ ] MongoDB instalado y ejecutándose
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (backend y frontend)
- [ ] Usuario administrador creado

### Para despliegue:
- [ ] Variables de entorno configuradas en producción
- [ ] Base de datos en la nube configurada
- [ ] Frontend compilado
- [ ] Dominio configurado
- [ ] SSL configurado

## 🔍 Solución de Problemas

### Error: "Cannot connect to MongoDB"
- Verificar que MongoDB esté ejecutándose
- Revisar la URL de conexión en `.env`
- Verificar permisos de red (si usas Atlas)

### Error: "Port 5000 already in use"
- Cambiar puerto en archivo `.env`: `PORT=5001`
- O terminar proceso que usa puerto 5000

### Error: "Module not found"
- Verificar que las dependencias estén instaladas
- Ejecutar `npm install` en backend y frontend

### Error: "Token invalid"
- Limpiar localStorage del navegador
- Reiniciar sesión

## 📚 Recursos Adicionales

- [Documentación MongoDB](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)