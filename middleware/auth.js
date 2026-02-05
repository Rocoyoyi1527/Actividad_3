const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción debería estar en variable de entorno)
const SECRET_KEY = 'mi_clave_secreta_super_segura_2024';

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido antes de permitir acceso a rutas protegidas
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('[AUTH] No se proporcionó token de autenticación');
      return res.status(401).json({ 
        error: 'No autorizado',
        mensaje: 'Token de autenticación no proporcionado' 
      });
    }

    // El formato esperado es: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('[AUTH] Formato de token inválido');
      return res.status(401).json({ 
        error: 'No autorizado',
        mensaje: 'Formato de token inválido' 
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Agregar información del usuario al request para usarla en las rutas
    req.usuario = {
      id: decoded.id,
      email: decoded.email
    };
    
    console.log(`[AUTH] Usuario autenticado: ${decoded.email}`);
    next();
    
  } catch (error) {
    console.log('[AUTH] Error al verificar token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        mensaje: 'El token ha expirado, por favor inicia sesión nuevamente' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Token inválido',
      mensaje: 'El token proporcionado no es válido' 
    });
  }
};

module.exports = { authMiddleware, SECRET_KEY };
