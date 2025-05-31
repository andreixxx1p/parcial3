import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chatRoutes from './routes/chatRoutes.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Verificar configuración de OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  ADVERTENCIA: No se encontró la variable OPENAI_API_KEY');
  console.log('\x1b[36m%s\x1b[0m', 'Para configurar la API key de OpenAI:');
  console.log('1. Crea un archivo .env en la carpeta backend');
  console.log('2. Añade la línea: OPENAI_API_KEY=tu-api-key-de-openai');
  console.log('3. Reinicia el servidor\n');
  
  // Verificar si existe el archivo .env
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('\x1b[31m%s\x1b[0m', 'No se encontró el archivo .env');
  }
}

const app = express();
const PORT = 5000; // Puerto fijo 5000

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3002',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];
    // Permite solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️ Origen bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400 // Cache preflight por 24 horas
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Middleware para logging de errores
app.use((err, req, res, next) => {
  console.error('❌ Error en la aplicación:', err);
  console.error('📝 Detalles de la petición:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Middleware para logging de peticiones
app.use((req, res, next) => {
  console.log('📨 Nueva petición:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: No se encontró la variable MONGODB_URI');
  console.log('📝 Para configurar MongoDB:');
  console.log('1. Asegúrate de tener un archivo .env');
  console.log('2. Añade la línea: MONGODB_URI=tu-url-de-mongodb');
  console.log('3. Reinicia el servidor');
  process.exit(1);
}

console.log('🔍 Intentando conectar a MongoDB...');
console.log('📡 URL de conexión:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')); // Oculta las credenciales en el log

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout después de 5 segundos
})
  .then(() => {
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📦 Base de datos: ${MONGODB_URI.includes('localhost') ? 'Local' : 'Atlas'}`);
    console.log('🔌 Estado de la conexión:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    if (MONGODB_URI.includes('mongodb.net')) {
      console.log('\n⚠️  Si estás usando MongoDB Atlas:');
      console.log('1. Verifica que tu IP esté en la lista blanca de MongoDB Atlas');
      console.log('2. Asegúrate de que la URL de conexión sea correcta');
      console.log('3. Verifica que el usuario y contraseña sean correctos');
      console.log('\n🔗 Para agregar tu IP a la lista blanca:');
      console.log('1. Ve a MongoDB Atlas (https://cloud.mongodb.com)');
      console.log('2. Selecciona tu cluster');
      console.log('3. Ve a "Network Access"');
      console.log('4. Haz clic en "Add IP Address"');
      console.log('5. Agrega esta IP: 190.121.139.122');
    } else {
      console.log('\n⚠️  Si estás usando MongoDB local:');
      console.log('1. Asegúrate de tener MongoDB instalado');
      console.log('2. Verifica que el servicio de MongoDB esté corriendo');
      console.log('3. Intenta ejecutar: mongod --version');
    }
  });

// Rutas
app.use('/api/chat', chatRoutes);

// Ruta para probar el servidor
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Asistente Explicador funcionando correctamente',
    status: 'OpenAI configurado y listo para explicar conceptos',
    endpoints: {
      chat: '/api/chat',
      history: '/api/chat/history',
      userHistory: '/api/chat/history/:userId'
    }
  });
});

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: 'La ruta solicitada no existe'
  });
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`🌐 CORS habilitado para: http://localhost:3002`);
});
