const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const TAREAS_FILE = path.join(__dirname, '../data/tareas.json');

/**
 * Función auxiliar para leer tareas del archivo
 * Utiliza fs.promises para operaciones asíncronas sin bloquear el Event Loop
 */
async function leerTareas() {
  try {
    const data = await fs.readFile(TAREAS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('[TAREAS] Error al leer tareas, retornando array vacío');
    return [];
  }
}

/**
 * Función auxiliar para guardar tareas en el archivo
 */
async function guardarTareas(tareas) {
  await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2));
}

/**
 * GET /tareas
 * Obtiene todas las tareas (ruta protegida)
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    console.log(`[GET /tareas] Usuario: ${req.usuario.email}`);
    
    const tareas = await leerTareas();
    
    // Filtrar tareas del usuario autenticado
    const tareasUsuario = tareas.filter(t => t.usuarioId === req.usuario.id);
    
    res.json({
      total: tareasUsuario.length,
      tareas: tareasUsuario
    });
    
  } catch (error) {
    console.error('[GET /tareas] Error:', error.message);
    next(error);
  }
});

/**
 * POST /tareas
 * Crea una nueva tarea (ruta protegida)
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { titulo, descripcion } = req.body;
    
    console.log(`[POST /tareas] Usuario: ${req.usuario.email}, Título: ${titulo}`);
    
    // Validaciones
    if (!titulo || !descripcion) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        mensaje: 'Se requiere título y descripción' 
      });
    }
    
    if (titulo.trim().length === 0 || descripcion.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        mensaje: 'Título y descripción no pueden estar vacíos' 
      });
    }
    
    // Leer tareas existentes
    const tareas = await leerTareas();
    
    // Crear nueva tarea
    const nuevaTarea = {
      id: Date.now().toString(),
      usuarioId: req.usuario.id,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      completada: false,
      fechaCreacion: new Date().toISOString()
    };
    
    tareas.push(nuevaTarea);
    
    // Guardar en archivo (operación asíncrona)
    await guardarTareas(tareas);
    
    console.log(`[POST /tareas] Tarea creada con ID: ${nuevaTarea.id}`);
    
    res.status(201).json({
      mensaje: 'Tarea creada exitosamente',
      tarea: nuevaTarea
    });
    
  } catch (error) {
    console.error('[POST /tareas] Error:', error.message);
    next(error);
  }
});

/**
 * PUT /tareas/:id
 * Actualiza una tarea existente (ruta protegida)
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, completada } = req.body;
    
    console.log(`[PUT /tareas/${id}] Usuario: ${req.usuario.email}`);
    
    // Leer tareas
    const tareas = await leerTareas();
    
    // Buscar índice de la tarea
    const indice = tareas.findIndex(t => t.id === id);
    
    if (indice === -1) {
      console.log(`[PUT /tareas/${id}] Tarea no encontrada`);
      return res.status(404).json({ 
        error: 'Tarea no encontrada',
        mensaje: `No existe una tarea con ID ${id}` 
      });
    }
    
    // Verificar que la tarea pertenece al usuario
    if (tareas[indice].usuarioId !== req.usuario.id) {
      console.log(`[PUT /tareas/${id}] Usuario no autorizado`);
      return res.status(403).json({ 
        error: 'No autorizado',
        mensaje: 'No tienes permiso para modificar esta tarea' 
      });
    }
    
    // Actualizar campos (mantener los que no se envían)
    if (titulo !== undefined) {
      if (titulo.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          mensaje: 'El título no puede estar vacío' 
        });
      }
      tareas[indice].titulo = titulo.trim();
    }
    
    if (descripcion !== undefined) {
      if (descripcion.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          mensaje: 'La descripción no puede estar vacía' 
        });
      }
      tareas[indice].descripcion = descripcion.trim();
    }
    
    if (completada !== undefined) {
      tareas[indice].completada = Boolean(completada);
    }
    
    tareas[indice].fechaModificacion = new Date().toISOString();
    
    // Guardar cambios
    await guardarTareas(tareas);
    
    console.log(`[PUT /tareas/${id}] Tarea actualizada exitosamente`);
    
    res.json({
      mensaje: 'Tarea actualizada exitosamente',
      tarea: tareas[indice]
    });
    
  } catch (error) {
    console.error(`[PUT /tareas/${req.params.id}] Error:`, error.message);
    next(error);
  }
});

/**
 * DELETE /tareas/:id
 * Elimina una tarea (ruta protegida)
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log(`[DELETE /tareas/${id}] Usuario: ${req.usuario.email}`);
    
    // Leer tareas
    const tareas = await leerTareas();
    
    // Buscar índice de la tarea
    const indice = tareas.findIndex(t => t.id === id);
    
    if (indice === -1) {
      console.log(`[DELETE /tareas/${id}] Tarea no encontrada`);
      return res.status(404).json({ 
        error: 'Tarea no encontrada',
        mensaje: `No existe una tarea con ID ${id}` 
      });
    }
    
    // Verificar que la tarea pertenece al usuario
    if (tareas[indice].usuarioId !== req.usuario.id) {
      console.log(`[DELETE /tareas/${id}] Usuario no autorizado`);
      return res.status(403).json({ 
        error: 'No autorizado',
        mensaje: 'No tienes permiso para eliminar esta tarea' 
      });
    }
    
    // Eliminar tarea
    const tareaEliminada = tareas.splice(indice, 1)[0];
    
    // Guardar cambios
    await guardarTareas(tareas);
    
    console.log(`[DELETE /tareas/${id}] Tarea eliminada exitosamente`);
    
    res.json({
      mensaje: 'Tarea eliminada exitosamente',
      tarea: tareaEliminada
    });
    
  } catch (error) {
    console.error(`[DELETE /tareas/${req.params.id}] Error:`, error.message);
    next(error);
  }
});

module.exports = router;
