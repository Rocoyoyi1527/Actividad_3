# GUÍA DE PRUEBAS - API de Gestión de Tareas

## Flujo completo de pruebas

### 1. REGISTRO DE USUARIO

**Endpoint:** POST http://localhost:3000/register

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "patron@test.com",
  "password": "123456"
}
```

**Respuesta esperada (201):**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": "1738706424000",
    "email": "patron@test.com"
  }
}
```

---

### 2. LOGIN

**Endpoint:** POST http://localhost:3000/login

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "patron@test.com",
  "password": "123456"
}
```

**Respuesta esperada (200):**
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzg3MDY0MjQwMDAiLCJlbWFpbCI6InBhdHJvbkB0ZXN0LmNvbSIsImlhdCI6MTczODcwNjQyNCwiZXhwIjoxNzM4NzkyODI0fQ.abc123...",
  "usuario": {
    "id": "1738706424000",
    "email": "patron@test.com"
  }
}
```

**⚠️ IMPORTANTE:** Copiar el token de la respuesta para las siguientes peticiones.

---

### 3. CREAR TAREA

**Endpoint:** POST http://localhost:3000/tareas

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body (JSON):**
```json
{
  "titulo": "Completar proyecto de Node.js",
  "descripcion": "Desarrollar API REST con autenticación JWT y operaciones CRUD"
}
```

**Respuesta esperada (201):**
```json
{
  "mensaje": "Tarea creada exitosamente",
  "tarea": {
    "id": "1738706500000",
    "usuarioId": "1738706424000",
    "titulo": "Completar proyecto de Node.js",
    "descripcion": "Desarrollar API REST con autenticación JWT y operaciones CRUD",
    "completada": false,
    "fechaCreacion": "2025-02-05T12:00:00.000Z"
  }
}
```

---

### 4. LISTAR TAREAS

**Endpoint:** GET http://localhost:3000/tareas

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta esperada (200):**
```json
{
  "total": 1,
  "tareas": [
    {
      "id": "1738706500000",
      "usuarioId": "1738706424000",
      "titulo": "Completar proyecto de Node.js",
      "descripcion": "Desarrollar API REST con autenticación JWT y operaciones CRUD",
      "completada": false,
      "fechaCreacion": "2025-02-05T12:00:00.000Z"
    }
  ]
}
```

---

### 5. ACTUALIZAR TAREA

**Endpoint:** PUT http://localhost:3000/tareas/1738706500000

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body (JSON):**
```json
{
  "titulo": "Proyecto completado ✓",
  "completada": true
}
```

**Respuesta esperada (200):**
```json
{
  "mensaje": "Tarea actualizada exitosamente",
  "tarea": {
    "id": "1738706500000",
    "usuarioId": "1738706424000",
    "titulo": "Proyecto completado ✓",
    "descripcion": "Desarrollar API REST con autenticación JWT y operaciones CRUD",
    "completada": true,
    "fechaCreacion": "2025-02-05T12:00:00.000Z",
    "fechaModificacion": "2025-02-05T12:10:00.000Z"
  }
}
```

---

### 6. ELIMINAR TAREA

**Endpoint:** DELETE http://localhost:3000/tareas/1738706500000

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta esperada (200):**
```json
{
  "mensaje": "Tarea eliminada exitosamente",
  "tarea": {
    "id": "1738706500000",
    "usuarioId": "1738706424000",
    "titulo": "Proyecto completado ✓",
    "descripcion": "Desarrollar API REST con autenticación JWT y operaciones CRUD",
    "completada": true,
    "fechaCreacion": "2025-02-05T12:00:00.000Z",
    "fechaModificacion": "2025-02-05T12:10:00.000Z"
  }
}
```

---

## CASOS DE ERROR

### Sin autenticación
```http
GET http://localhost:3000/tareas
```
**Respuesta (401):**
```json
{
  "error": "No autorizado",
  "mensaje": "Token de autenticación no proporcionado"
}
```

### Token inválido
```http
GET http://localhost:3000/tareas
Authorization: Bearer token_invalido
```
**Respuesta (401):**
```json
{
  "error": "Token inválido",
  "mensaje": "El token proporcionado no es válido"
}
```

### Datos incompletos
```http
POST http://localhost:3000/tareas
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "titulo": "Sin descripción"
}
```
**Respuesta (400):**
```json
{
  "error": "Datos incompletos",
  "mensaje": "Se requiere título y descripción"
}
```

### Tarea no encontrada
```http
DELETE http://localhost:3000/tareas/999999
Authorization: Bearer TOKEN
```
**Respuesta (404):**
```json
{
  "error": "Tarea no encontrada",
  "mensaje": "No existe una tarea con ID 999999"
}
```

### Intentar modificar tarea de otro usuario
**Respuesta (403):**
```json
{
  "error": "No autorizado",
  "mensaje": "No tienes permiso para modificar esta tarea"
}
```

---

## COMANDOS CURL PARA TERMINAL

```bash
# 1. Registro
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"patron@test.com","password":"123456"}'

# 2. Login (guardar el token que devuelve)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patron@test.com","password":"123456"}'

# 3. Crear tarea (reemplazar TOKEN)
curl -X POST http://localhost:3000/tareas \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Mi tarea","descripcion":"Descripción de la tarea"}'

# 4. Listar tareas
curl -X GET http://localhost:3000/tareas \
  -H "Authorization: Bearer TOKEN"

# 5. Actualizar tarea (reemplazar ID)
curl -X PUT http://localhost:3000/tareas/ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completada":true}'

# 6. Eliminar tarea (reemplazar ID)
curl -X DELETE http://localhost:3000/tareas/ID \
  -H "Authorization: Bearer TOKEN"
```
