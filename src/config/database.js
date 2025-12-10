// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Tentativo di connessione a MongoDB Atlas...');
    
    // Nascondi la password nei log per sicurezza
    const maskedURI = process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
    console.log(`📡 URI: ${maskedURI}`);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 secondi per Atlas
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Connection pool per Atlas
      minPoolSize: 2,
    };

    console.log('⏳ Connessione in corso...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`\n✅ SUCCESSO! MongoDB Atlas Connected!`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Atlas Cluster: ${conn.connection.client.s.url}`);
    
    // Event listeners
    mongoose.connection.on('connected', () => {
      console.log('📊 Mongoose connected to Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected from Atlas');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB Atlas connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`\n❌ CONNESSIONE FALLITA!`);
    console.error(`   Error: ${error.message}`);
    
    console.log('\n🔧 Soluzioni possibili per MongoDB Atlas:');
    console.log('   1. Verifica la password nell\'URI');
    console.log('   2. Controlla che l\'IP sia whitelisted su Atlas');
    console.log('   3. Verifica la connessione internet');
    console.log('   4. Assicurati che il database esista su Atlas');
    console.log('   5. Controlla le impostazioni di rete su Atlas');
    
    console.log('\n📋 Per whitelistare il tuo IP su Atlas:');
    console.log('   1. Vai su https://cloud.mongodb.com');
    console.log('   2. Seleziona il tuo cluster');
    console.log('   3. Clicca su "Network Access"');
    console.log('   4. Aggiungi il tuo IP corrente o 0.0.0.0/0 (per testing)');
    
    process.exit(1);
  }
};

module.exports = connectDB