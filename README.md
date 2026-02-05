# API RESTful de Gestión de Tareas

API desarrollada con Node.js y Express.js para gestión de tareas con autenticación JWT.

## 📋 Características

- ✅ Operaciones CRUD completas sobre tareas
- 🔒 Autenticación con JWT y bcrypt
- 📁 Almacenamiento asíncrono en archivos JSON
- 🛡️ Middleware personalizado de errores
- 🔍 Debugging con `--inspect`
- 📝 Código modularizado y documentado

## 🚀 Instalación

1. Instalar dependencias:
```bash
cd "C:\Users\R-Cou\Escritorio\CLAUDE COSAS\Actividad_3"
npm install
```

2. Iniciar servidor:
```bash
npm start
```

3. Para debugging:
```bash
npm run dev
```
Luego abrir `chrome://inspect` en Chrome.

## 📡 Endpoints

### Autenticación (público)

**Registro**
```http
POST /register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Login**
```http
POST /login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

Respuesta:
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "1234567890",
    "email": "usuario@ejemplo.com"
  }
}
```

### Tareas (requiere autenticación)

**IMPORTANTE:** Incluir token en header:
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Listar tareas**
```http
GET /tareas
Authorization: Bearer TOKEN
```

**Crear tarea**
```http
POST /tareas
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "titulo": "Completar proyecto",
  "descripcion": "Terminar la API REST antes de la fecha límite"
}
```

**Actualizar tarea**
```http
PUT /tareas/1234567890
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "titulo": "Proyecto completado",
  "completada": true
}
```

**Eliminar tarea**
```http
DELETE /tareas/1234567890
Authorization: Bearer TOKEN
```

## 🧪 Pruebas con cURL

```bash
# Registro
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"123456\"}"

# Login
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"123456\"}"

# Listar tareas (reemplazar TOKEN)
curl -X GET http://localhost:3000/tareas -H "Authorization: Bearer TOKEN"

# Crear tarea
curl -X POST http://localhost:3000/tareas -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"titulo\":\"Mi tarea\",\"descripcion\":\"Descripción de la tarea\"}"
```

## 📁 Estructura del Proyecto

```
api-tareas/
├── server.js                 # Servidor principal
├── middleware/
│   ├── auth.js              # Middleware de autenticación JWT
│   └── errorHandler.js      # Manejo de errores
├── routes/
│   ├── auth.js              # Rutas de registro y login
│   └── tareas.js            # Rutas CRUD de tareas
├── data/
│   ├── tareas.json          # Almacenamiento de tareas
│   └── usuarios.json        # Almacenamiento de usuarios
├── package.json
└── README.md
```

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (10 rounds)
- Tokens JWT con expiración de 24 horas
- Validación de datos en todas las rutas
- Middleware de autenticación en rutas protegidas
- Usuarios solo pueden acceder a sus propias tareas

## 🐛 Debugging

El servidor incluye `console.log` estratégicos en:
- Todas las peticiones HTTP
- Operaciones de autenticación
- Operaciones CRUD
- Errores y excepciones

Para debugging avanzado con Chrome DevTools:
```bash
node --inspect server.js
```

## ⚠️ Notas

- La clave secreta JWT está en el código (en producción usar variables de entorno)
- Los datos se almacenan en archivos JSON (para producción usar base de datos)
- Las operaciones con archivos son completamente asíncronas (no bloquean Event Loop)
