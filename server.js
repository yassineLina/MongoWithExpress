// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const csvRoutes = require('./src/routes/csvRoutes');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose'); 
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/csv', csvRoutes);

// Importa la funzione connectDB
const connectDB = require('./src/config/database');

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API Express + MongoDB Funzionante!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      csv: '/api/csv',
      docs: '/api-docs (coming soon)'
    },
    csvEndpoints: {
      import: 'POST /api/csv/import',
      upload: 'POST /api/csv/upload',
      data: 'GET /api/csv/data',
      stats: 'GET /api/csv/stats'
    }
  });
});

app.get('/api/storeData',async (req, res) => {
   console.log('\n' + '='.repeat(50));
  console.log('🚀 IMPORT CSV -> MONGODB');
  console.log('='.repeat(50) + '\n');
  
  try {
    // 1. CONNESSIONE MONGODB
    console.log('🔗 Connessione a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connesso!\n');
    
    // 2. SCHEMA SEMPLICE
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true, lowercase: true },
      age: Number,
      city: String,
      isActive: Boolean,
      createdAt: Date,
      importedAt: { type: Date, default: Date.now }
    });
    
    // Pulisci collezione esistente
    await mongoose.connection.db.collection('users').deleteMany({});
    console.log('🧹 Collezione "users" pulita\n');
    
    const User = mongoose.model('User', userSchema);
    
    // 3. PERCORSO FILE
    const filePath = path.join(__dirname, 'data/csv/users.csv');
    console.log(`📂 Lettura file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File non trovato!');
      return;
    }
    
    // 4. LEGGI E IMPORT CSV
    const results = [];
    let imported = 0;
    let errors = 0;
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          results.push({
            name: row.name.trim(),
            email: row.email.toLowerCase().trim(),
            age: parseInt(row.age),
            city: row.city.trim(),
            isActive: row.isActive.toLowerCase() === 'true',
            createdAt: new Date(row.createdAt)
          });
        })
        .on('end', async () => {
          console.log(`📊 Righe lette dal CSV: ${results.length}\n`);
          
          // Importa ogni riga
          for (const userData of results) {
            try {
              await User.create(userData);
              imported++;
              console.log(`✅ ${userData.name} (${userData.email})`);
            } catch (error) {
              errors++;
              console.log(`⚠️  ${userData.email}: ${error.message}`);
            }
          }
          
          resolve();
        })
        .on('error', reject);
    });
    
    // 5. RISULTATO FINALE
    console.log('\n' + '='.repeat(50));
    console.log('🎯 IMPORT COMPLETATO!');
    console.log('='.repeat(50));
    console.log(`✅ Importati: ${imported} utenti`);
    console.log(`⚠️  Errori: ${errors}`);
    console.log(`📁 Database: ${mongoose.connection.name}`);
    console.log(`📊 Collezione: users`);
    
    // 6. VERIFICA
    const count = await User.countDocuments();
    console.log(`🔍 Verifica finale: ${count} documenti nel DB\n`);
    
    if (count > 0) {
      const sample = await User.findOne();
      console.log('📄 Esempio documento:');
      console.log(JSON.stringify(sample, null, 2));
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Operazione completata! 🎉\n');
    
  } catch (error) {
    console.error('\n❌ ERRORE CRITICO:', error.message);
    process.exit(1);
  }
});
// Aggiungi questa route dopo le altre
app.get('/api/check-data', async (req, res) => {
try {
    console.log('🔍 Accesso ai dati MongoDB...\n');
    
    // Connessione SENZA gestione sessioni automatica
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Aggiungi queste opzioni per evitare errori session
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log('✅ Connesso a MongoDB\n');
    
    // 1. Conta documenti nella collezione csvdatas
    const count = await mongoose.connection.db.collection('csvdatas').countDocuments();
    console.log(`📊 Documenti totali in "csvdatas": ${count}\n`);
    
    if (count === 0) {
      console.log('⚠️  La collezione esiste ma è VUOTA!');
      await mongoose.disconnect();
      return;
    }
    
    // 2. Mostra i primi 5 documenti
    console.log('📄 Primi 5 documenti:');
    const docs = await mongoose.connection.db.collection('csvdatas')
      .find({})
      .limit(5)
      .toArray();
    
    docs.forEach((doc, index) => {
      console.log(`\n--- Documento ${index + 1} ---`);
      console.log(`ID: ${doc._id}`);
      console.log(`Nome: ${doc.name}`);
      console.log(`Email: ${doc.email}`);
      console.log(`Età: ${doc.age}`);
      console.log(`Città: ${doc.city}`);
      console.log(`Attivo: ${doc.isActive}`);
      console.log(`Creato: ${doc.createdAt ? new Date(doc.createdAt).toLocaleString() : 'N/A'}`);
      console.log(`Importato: ${doc.importedAt ? new Date(doc.importedAt).toLocaleString() : 'N/A'}`);
    });
    
    // 3. Statistiche rapide
    console.log('\n📈 Statistiche rapide:');
    
    // Per città
    const pipeline = [
      { 
        $group: { 
          _id: "$city", 
          count: { $sum: 1 },
          avgAge: { $avg: "$age" }
        } 
      },
      { $sort: { count: -1 } }
    ];
    
    const stats = await mongoose.connection.db.collection('csvdatas').aggregate(pipeline).toArray();
    
    stats.forEach(stat => {
      console.log(`📍 ${stat._id}: ${stat.count} utenti (età media: ${stat.avgAge?.toFixed(1) || 'N/A'})`);
    });
    
    // 4. Chiudi connessione CORRETTAMENTE
    await mongoose.disconnect();
    console.log('\n🎯 Operazione completata!');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
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