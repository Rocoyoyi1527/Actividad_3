/**
 * Middleware personalizado para manejo de errores
 * Captura todos los errores y devuelve respuestas HTTP apropiadas
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR] Se produjo un error:');
  console.error('  - Mensaje:', err.message);
  console.error('  - Stack:', err.stack);
  console.error('  - Ruta:', req.method, req.path);
  
  // Determinar el código de estado HTTP
  const statusCode = err.statusCode || 500;
  
  // Respuesta de error
  const errorResponse = {
    error: err.name || 'Error del servidor',
    mensaje: err.message || 'Ha ocurrido un error inesperado',
    timestamp: new Date().toISOString(),
    path: req.path
  };
  
  // En modo de desarrollo, incluir el stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  console.log(`[404] Ruta no encontrada: ${req.method} ${req.path}`);
  
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: `La ruta ${req.method} ${req.path} no existe`,
    timestamp: new Date().toISOString()
  });
};

module.exports = { errorHandler, notFoundHandler };
