require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');

// Inizializza app Express
const app = express();

// Connessione al database
connectDB();

// Middleware
app.use(helmet()); 
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Route di test
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Benvenuto nella API Express + MongoDB!',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      docs: '/api-docs (coming soon)',
      health: '/health',
      api: '/api/v1'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Gestione errori 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Gestione errori generici
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Avvia server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 Server is running!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`=================================\n`);
});