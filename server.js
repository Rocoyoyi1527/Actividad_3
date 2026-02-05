/**
 * API RESTful de Gestión de Tareas
 * 
 * Servidor Express.js con:
 * - Autenticación JWT
 * - Operaciones CRUD sobre tareas
 * - Almacenamiento en archivos JSON
 * - Middleware personalizado de errores
 * 
 * Autor: Patrón
 * Fecha: 2025
 */

const express = require('express');
const bodyParser = require('body-parser');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const tareasRoutes = require('./routes/tareas');

// Crear aplicación Express
const app = express();
const PORT = 3000;

console.log('='.repeat(60));
console.log('Iniciando API de Gestión de Tareas');
console.log('='.repeat(60));

// =====================
// MIDDLEWARE GLOBALES
// =====================

// Body parser para JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging de todas las peticiones
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// =====================
// RUTAS
// =====================

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Gestión de Tareas',
    version: '1.0.0',
    endpoints: {
      autenticacion: {
        registro: 'POST /register',
        login: 'POST /login'
      },
      tareas: {
        listar: 'GET /tareas (requiere autenticación)',
        crear: 'POST /tareas (requiere autenticación)',
        actualizar: 'PUT /tareas/:id (requiere autenticación)',
        eliminar: 'DELETE /tareas/:id (requiere autenticación)'
      }
    },
    instrucciones: {
      autenticacion: 'Incluir header: Authorization: Bearer TOKEN',
      debugging: 'Ejecutar con: node --inspect server.js'
    }
  });
});

// Rutas de autenticación (público)
app.use('/', authRoutes);

// Rutas de tareas (protegidas con authMiddleware)
app.use('/tareas', tareasRoutes);

// =====================
// MANEJO DE ERRORES
// =====================

// Ruta no encontrada (404)
app.use(notFoundHandler);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// =====================
// INICIAR SERVIDOR
// =====================

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✓ Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('');
  console.log('Endpoints disponibles:');
  console.log('  POST   /register        - Registrar nuevo usuario');
  console.log('  POST   /login           - Iniciar sesión');
  console.log('  GET    /tareas          - Listar tareas (auth)');
  console.log('  POST   /tareas          - Crear tarea (auth)');
  console.log('  PUT    /tareas/:id      - Actualizar tarea (auth)');
  console.log('  DELETE /tareas/:id      - Eliminar tarea (auth)');
  console.log('');
  console.log('Debugging:');
  console.log('  node --inspect server.js');
  console.log('  Abrir chrome://inspect en Chrome');
  console.log('='.repeat(60));
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Promesa rechazada no manejada:', reason);
  process.exit(1);
});
