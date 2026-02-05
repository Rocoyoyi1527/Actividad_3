const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const { SECRET_KEY } = require('../middleware/auth');

const router = express.Router();
const USUARIOS_FILE = path.join(__dirname, '../data/usuarios.json');

/**
 * Función auxiliar para leer usuarios del archivo
 */
async function leerUsuarios() {
  try {
    const data = await fs.readFile(USUARIOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('[AUTH] Error al leer usuarios, retornando array vacío');
    return [];
  }
}

/**
 * Función auxiliar para guardar usuarios en el archivo
 */
async function guardarUsuarios(usuarios) {
  await fs.writeFile(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));
}

/**
 * POST /register
 * Registra un nuevo usuario con email y contraseña encriptada
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log(`[REGISTER] Intento de registro para: ${email}`);
    
    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        mensaje: 'Se requiere email y password' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Contraseña débil',
        mensaje: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Leer usuarios existentes
    const usuarios = await leerUsuarios();
    
    // Verificar si el usuario ya existe
    if (usuarios.find(u => u.email === email)) {
      console.log(`[REGISTER] Usuario ya existe: ${email}`);
      return res.status(400).json({ 
        error: 'Usuario existente',
        mensaje: 'El email ya está registrado' 
      });
    }
    
    // Encriptar contraseña con bcrypt (10 rounds de salt)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear nuevo usuario
    const nuevoUsuario = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      fechaRegistro: new Date().toISOString()
    };
    
    usuarios.push(nuevoUsuario);
    
    // Guardar en archivo (operación asíncrona)
    await guardarUsuarios(usuarios);
    
    console.log(`[REGISTER] Usuario registrado exitosamente: ${email}`);
    
    // No devolver la contraseña en la respuesta
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email
      }
    });
    
  } catch (error) {
    console.error('[REGISTER] Error:', error.message);
    next(error);
  }
});

/**
 * POST /login
 * Autentica un usuario y genera un token JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log(`[LOGIN] Intento de login para: ${email}`);
    
    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        mensaje: 'Se requiere email y password' 
      });
    }
    
    // Leer usuarios
    const usuarios = await leerUsuarios();
    
    // Buscar usuario por email
    const usuario = usuarios.find(u => u.email === email);
    
    if (!usuario) {
      console.log(`[LOGIN] Usuario no encontrado: ${email}`);
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        mensaje: 'Email o contraseña incorrectos' 
      });
    }
    
    // Verificar contraseña con bcrypt
    const passwordValido = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValido) {
      console.log(`[LOGIN] Contraseña incorrecta para: ${email}`);
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        mensaje: 'Email o contraseña incorrectos' 
      });
    }
    
    // Generar token JWT (expira en 24 horas)
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email 
      },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    console.log(`[LOGIN] Login exitoso para: ${email}`);
    
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email
      }
    });
    
  } catch (error) {
    console.error('[LOGIN] Error:', error.message);
    next(error);
  }
});

module.exports = router;
