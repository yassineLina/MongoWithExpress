// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Importa la funzione connectDB
const connectDB = require('./src/config/database');

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Express + MongoDB',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} non trovata`
  });
});

// Avvia tutto
async function startServer() {
  try {
    console.log('🔧 Avvio applicazione...');
    
    // Connessione al database
    await connectDB(); // <- QUESTA È UNA FUNZIONE!
    
    // Avvia server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Server Express in esecuzione`);
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log('='.repeat(50) + '\n');
    });
    
  } catch (error) {
    console.error('❌ Impossibile avviare:', error.message);
    process.exit(1);
  }
}

startServer();