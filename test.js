/**
 * Script de pruebas básicas para verificar la API
 * Ejecutar con: node test.js (después de iniciar el servidor)
 */

const http = require('http');

// Configuración
const BASE_URL = 'http://localhost:3000';
let TOKEN = null;
let TAREA_ID = null;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función auxiliar para hacer peticiones HTTP
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Pruebas
async function runTests() {
  log('\n=== INICIANDO PRUEBAS DE LA API ===\n', 'blue');

  try {
    // 1. Registro
    log('1. Probando registro de usuario...', 'yellow');
    const testEmail = `test${Date.now()}@test.com`;
    const registro = await request('POST', '/register', {
      email: testEmail,
      password: '123456'
    });
    
    if (registro.statusCode === 201) {
      log('✓ Registro exitoso', 'green');
    } else {
      log('✗ Error en registro', 'red');
      console.log(registro);
    }

    // 2. Login
    log('\n2. Probando login...', 'yellow');
    const login = await request('POST', '/login', {
      email: testEmail,
      password: '123456'
    });
    
    if (login.statusCode === 200 && login.data.token) {
      TOKEN = login.data.token;
      log('✓ Login exitoso', 'green');
      log(`  Token: ${TOKEN.substring(0, 50)}...`, 'blue');
    } else {
      log('✗ Error en login', 'red');
      console.log(login);
      return;
    }

    // 3. Crear tarea
    log('\n3. Probando crear tarea...', 'yellow');
    const crearTarea = await request('POST', '/tareas', {
      titulo: 'Tarea de prueba',
      descripcion: 'Esta es una tarea creada automáticamente por el script de pruebas'
    }, TOKEN);
    
    if (crearTarea.statusCode === 201) {
      TAREA_ID = crearTarea.data.tarea.id;
      log('✓ Tarea creada exitosamente', 'green');
      log(`  ID: ${TAREA_ID}`, 'blue');
    } else {
      log('✗ Error al crear tarea', 'red');
      console.log(crearTarea);
    }

    // 4. Listar tareas
    log('\n4. Probando listar tareas...', 'yellow');
    const listarTareas = await request('GET', '/tareas', null, TOKEN);
    
    if (listarTareas.statusCode === 200) {
      log('✓ Tareas listadas correctamente', 'green');
      log(`  Total: ${listarTareas.data.total}`, 'blue');
    } else {
      log('✗ Error al listar tareas', 'red');
      console.log(listarTareas);
    }

    // 5. Actualizar tarea
    log('\n5. Probando actualizar tarea...', 'yellow');
    const actualizarTarea = await request('PUT', `/tareas/${TAREA_ID}`, {
      titulo: 'Tarea actualizada',
      completada: true
    }, TOKEN);
    
    if (actualizarTarea.statusCode === 200) {
      log('✓ Tarea actualizada exitosamente', 'green');
    } else {
      log('✗ Error al actualizar tarea', 'red');
      console.log(actualizarTarea);
    }

    // 6. Eliminar tarea
    log('\n6. Probando eliminar tarea...', 'yellow');
    const eliminarTarea = await request('DELETE', `/tareas/${TAREA_ID}`, null, TOKEN);
    
    if (eliminarTarea.statusCode === 200) {
      log('✓ Tarea eliminada exitosamente', 'green');
    } else {
      log('✗ Error al eliminar tarea', 'red');
      console.log(eliminarTarea);
    }

    // 7. Verificar autenticación (debe fallar)
    log('\n7. Probando acceso sin token (debe fallar)...', 'yellow');
    const sinAuth = await request('GET', '/tareas');
    
    if (sinAuth.statusCode === 401) {
      log('✓ Protección de rutas funciona correctamente', 'green');
    } else {
      log('✗ Error: rutas no protegidas correctamente', 'red');
      console.log(sinAuth);
    }

    log('\n=== PRUEBAS COMPLETADAS ===\n', 'blue');

  } catch (error) {
    log('\n✗ Error durante las pruebas:', 'red');
    console.error(error);
  }
}

// Ejecutar pruebas
log('Asegúrate de que el servidor esté corriendo en http://localhost:3000', 'yellow');
log('Presiona Ctrl+C para cancelar o espera 3 segundos...\n', 'yellow');

setTimeout(() => {
  runTests();
}, 3000);
