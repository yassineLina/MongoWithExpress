// src/config/database.js - FUNZIONE SEMPLICE
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔗 Connessione a MongoDB...');
    
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI mancante in .env');
    }
    
    // Connessione SEMPLICE - SENZA OPZIONI!
    await mongoose.connect(uri);
    
    console.log('✅ Database connesso!');
    console.log(`   Nome DB: ${mongoose.connection.name}`);
    
    return mongoose.connection;
    
  } catch (error) {
    console.error('❌ Errore connessione:', error.message);
    throw error; // Rilancia l'errore
  }
};

// Esporta la funzione
module.exports = connectDB;