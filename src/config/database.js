const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Tentativo di connessione a MongoDB...');
    console.log(`📡 URI: ${process.env.MONGODB_URI}`);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`✅ MongoDB Connected!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
    
    // Gestione errori di connessione
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected - Tentativo di riconnessione...');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.log('\n🔧 Soluzioni possibili:');
    console.log('   1. Assicurati che MongoDB sia installato');
    console.log('   2. Avvia MongoDB con: mongod (Windows) o sudo systemctl start mongod (Linux)');
    console.log('   3. Verifica che il processo MongoDB sia in esecuzione');
    console.log('   4. Controlla la URI in .env');
    process.exit(1);
  }
};

module.exports = connectDB;