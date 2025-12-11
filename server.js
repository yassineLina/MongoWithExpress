// // src/server.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const csvRoutes = require('./src/routes/csvRoutes');
// const multer = require('multer');
// const path = require('path');
// const mongoose = require('mongoose'); 
// const fs = require('fs');
// const csv = require('csv-parser');

// const app = express();
// const PORT = process.env.PORT || 5000;
// app.use(express.static(path.join(__dirname, 'public')));
// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use('/api/csv', csvRoutes);

// // Importa la funzione connectDB
// const connectDB = require('./src/config/database');

// // Routes
// app.get('/', (req, res) => {
//   res.json({ 
//     message: '🚀 API Express + MongoDB Funzionante!',
//     version: '1.0.0',
//     endpoints: {
//       auth: '/api/auth',
//       csv: '/api/csv',
//       docs: '/api-docs (coming soon)'
//     },
//     csvEndpoints: {
//       import: 'POST /api/csv/import',
//       upload: 'POST /api/csv/upload',
//       data: 'GET /api/csv/data',
//       stats: 'GET /api/csv/stats'
//     }
//   });
// });
// app.get('/api/recuperoFromMongoDb',async(req, res) => {
//     console.log('\n' + '='.repeat(60));
//   console.log('📊 RECUPERO DATI DA MONGODB');
//   console.log('='.repeat(60) + '\n');
  
//   try {
//     // Connessione
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('✅ Connesso a MongoDB Atlas\n');
    
//     // Schema (deve matchare quello usato per l'import)
//     const userSchema = new mongoose.Schema({
//       name: String,
//       email: String,
//       age: Number,
//       city: String,
//       isActive: Boolean,
//       createdAt: Date,
//       importedAt: Date
//     });
    
//     const User = mongoose.model('User', userSchema);
    
//     // 1. CONTA TOTALE
//     const total = await User.countDocuments();
//     console.log(`👥 UTENTI TOTALI: ${total}\n`);
    
//     if (total === 0) {
//       console.log('⚠️  Nessun utente trovato!');
//       return;
//     }
    
//     // 2. RECUPERA TUTTI GLI UTENTI
//     console.log('📋 ELENCO COMPLETO UTENTI:');
//     console.log('='.repeat(60));
    
//     const allUsers = await User.find({}).sort({ name: 1 });
    
//     allUsers.forEach((user, index) => {
//       console.log(`\n[${index + 1}] ${user.name}`);
//       console.log(`   📧 Email: ${user.email}`);
//       console.log(`   📅 Età: ${user.age} anni`);
//       console.log(`   📍 Città: ${user.city}`);
//       console.log(`   ✅ Attivo: ${user.isActive ? 'SI' : 'NO'}`);
//       console.log(`   🗓️  Assunto: ${user.createdAt.toLocaleDateString('it-IT')}`);
//     });
    
//     // 3. STATISTICHE
//     console.log('\n' + '='.repeat(60));
//     console.log('📈 STATISTICHE:');
//     console.log('='.repeat(60));
    
//     // Per città
//     const byCity = await User.aggregate([
//       { $group: { 
//         _id: "$city", 
//         count: { $sum: 1 },
//         avgAge: { $avg: "$age" }
//       }},
//       { $sort: { count: -1 } }
//     ]);
    
//     console.log('\n📍 DISTRIBUZIONE PER CITTÀ:');
//     byCity.forEach(city => {
//       console.log(`   ${city._id}: ${city.count} utenti (età media: ${city.avgAge.toFixed(1)})`);
//     });
    
//     // Per stato attivo
//     const activeStats = await User.aggregate([
//       { $group: { 
//         _id: "$isActive", 
//         count: { $sum: 1 }
//       }}
//     ]);
    
//     console.log('\n✅ STATO UTENTI:');
//     activeStats.forEach(stat => {
//       console.log(`   ${stat._id ? 'ATTIVI' : 'INATTIVI'}: ${stat.count}`);
//     });
    
//     // Età media totale
//     const totalAvgAge = await User.aggregate([
//       { $group: { _id: null, avgAge: { $avg: "$age" } } }
//     ]);
    
//     console.log(`\n📅 ETÀ MEDIA TOTALE: ${totalAvgAge[0]?.avgAge?.toFixed(1) || 0} anni`);
    
//     // 4. ESPORTA IN CSV (opzionale)
//     console.log('\n' + '='.repeat(60));
//     console.log('💾 ESPORTAZIONE CSV:');
//     console.log('='.repeat(60));
    
//     let csvContent = 'Nome,Email,Età,Città,Stato,Data Assunzione\n';
//     allUsers.forEach(user => {
//       csvContent += `"${user.name}","${user.email}",${user.age},"${user.city}","${user.isActive ? 'Attivo' : 'Inattivo'}","${user.createdAt.toISOString().split('T')[0]}"\n`;
//     });
    
//     const fs = require('fs');
//     fs.writeFileSync('exported-users.csv', csvContent);
//     console.log(`✅ CSV esportato: exported-users.csv (${allUsers.length} record)`);
    
//     // 5. CHIUDI CONNESSIONE
//     await mongoose.disconnect();
    
//     console.log('\n' + '='.repeat(60));
//     console.log('🎯 RECUPERO COMPLETATO!');
//     console.log(`📊 ${total} utenti recuperati con successo`);
//     console.log('='.repeat(60) + '\n');
    
//   } catch (error) {
//     console.error('❌ ERRORE:', error.message);
//   }
// });

// app.get('/api/storeData',async (req, res) => {
//    console.log('\n' + '='.repeat(50));
//   console.log('🚀 IMPORT CSV -> MONGODB');
//   console.log('='.repeat(50) + '\n');
  
//   try {
//     // 1. CONNESSIONE MONGODB
//     console.log('🔗 Connessione a MongoDB Atlas...');
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('✅ Connesso!\n');
    
//     // 2. SCHEMA SEMPLICE
//     const userSchema = new mongoose.Schema({
//       name: String,
//       email: { type: String, unique: true, lowercase: true },
//       age: Number,
//       city: String,
//       isActive: Boolean,
//       createdAt: Date,
//       importedAt: { type: Date, default: Date.now }
//     });
    
//     // Pulisci collezione esistente
//     await mongoose.connection.db.collection('users').deleteMany({});
//     console.log('🧹 Collezione "users" pulita\n');
    
//     const User = mongoose.model('User', userSchema);
    
//     // 3. PERCORSO FILE
//     const filePath = path.join(__dirname, 'data/csv/users.csv');
//     console.log(`📂 Lettura file: ${filePath}`);
    
//     if (!fs.existsSync(filePath)) {
//       console.log('❌ File non trovato!');
//       return;
//     }
    
//     // 4. LEGGI E IMPORT CSV
//     const results = [];
//     let imported = 0;
//     let errors = 0;
    
//     await new Promise((resolve, reject) => {
//       fs.createReadStream(filePath)
//         .pipe(csv())
//         .on('data', (row) => {
//           results.push({
//             name: row.name.trim(),
//             email: row.email.toLowerCase().trim(),
//             age: parseInt(row.age),
//             city: row.city.trim(),
//             isActive: row.isActive.toLowerCase() === 'true',
//             createdAt: new Date(row.createdAt)
//           });
//         })
//         .on('end', async () => {
//           console.log(`📊 Righe lette dal CSV: ${results.length}\n`);
          
//           // Importa ogni riga
//           for (const userData of results) {
//             try {
//               await User.create(userData);
//               imported++;
//               console.log(`✅ ${userData.name} (${userData.email})`);
//             } catch (error) {
//               errors++;
//               console.log(`⚠️  ${userData.email}: ${error.message}`);
//             }
//           }
          
//           resolve();
//         })
//         .on('error', reject);
//     });
    
//     // 5. RISULTATO FINALE
//     console.log('\n' + '='.repeat(50));
//     console.log('🎯 IMPORT COMPLETATO!');
//     console.log('='.repeat(50));
//     console.log(`✅ Importati: ${imported} utenti`);
//     console.log(`⚠️  Errori: ${errors}`);
//     console.log(`📁 Database: ${mongoose.connection.name}`);
//     console.log(`📊 Collezione: users`);
    
//     // 6. VERIFICA
//     const count = await User.countDocuments();
//     console.log(`🔍 Verifica finale: ${count} documenti nel DB\n`);
    
//     if (count > 0) {
//       const sample = await User.findOne();
//       console.log('📄 Esempio documento:');
//       console.log(JSON.stringify(sample, null, 2));
//     }
    
//     await mongoose.disconnect();
//     console.log('\n✅ Operazione completata! 🎉\n');
    
//   } catch (error) {
//     console.error('\n❌ ERRORE CRITICO:', error.message);
//     process.exit(1);
//   }
// });
// // Aggiungi questa route dopo le altre
// app.get('/api/check-data', async (req, res) => {
// try {
//     console.log('🔍 Accesso ai dati MongoDB...\n');
    
//     // Connessione SENZA gestione sessioni automatica
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       // Aggiungi queste opzioni per evitare errori session
//       autoIndex: true,
//       maxPoolSize: 10,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//       family: 4
//     });
    
//     console.log('✅ Connesso a MongoDB\n');
    
//     // 1. Conta documenti nella collezione csvdatas
//     const count = await mongoose.connection.db.collection('csvdatas').countDocuments();
//     console.log(`📊 Documenti totali in "csvdatas": ${count}\n`);
    
//     if (count === 0) {
//       console.log('⚠️  La collezione esiste ma è VUOTA!');
//       await mongoose.disconnect();
//       return;
//     }
    
//     // 2. Mostra i primi 5 documenti
//     console.log('📄 Primi 5 documenti:');
//     const docs = await mongoose.connection.db.collection('csvdatas')
//       .find({})
//       .limit(5)
//       .toArray();
    
//     docs.forEach((doc, index) => {
//       console.log(`\n--- Documento ${index + 1} ---`);
//       console.log(`ID: ${doc._id}`);
//       console.log(`Nome: ${doc.name}`);
//       console.log(`Email: ${doc.email}`);
//       console.log(`Età: ${doc.age}`);
//       console.log(`Città: ${doc.city}`);
//       console.log(`Attivo: ${doc.isActive}`);
//       console.log(`Creato: ${doc.createdAt ? new Date(doc.createdAt).toLocaleString() : 'N/A'}`);
//       console.log(`Importato: ${doc.importedAt ? new Date(doc.importedAt).toLocaleString() : 'N/A'}`);
//     });
    
//     // 3. Statistiche rapide
//     console.log('\n📈 Statistiche rapide:');
    
//     // Per città
//     const pipeline = [
//       { 
//         $group: { 
//           _id: "$city", 
//           count: { $sum: 1 },
//           avgAge: { $avg: "$age" }
//         } 
//       },
//       { $sort: { count: -1 } }
//     ];
    
//     const stats = await mongoose.connection.db.collection('csvdatas').aggregate(pipeline).toArray();
    
//     stats.forEach(stat => {
//       console.log(`📍 ${stat._id}: ${stat.count} utenti (età media: ${stat.avgAge?.toFixed(1) || 'N/A'})`);
//     });
    
//     // 4. Chiudi connessione CORRETTAMENTE
//     await mongoose.disconnect();
//     console.log('\n🎯 Operazione completata!');
    
//   } catch (error) {
//     console.error('❌ Errore:', error.message);
//     if (mongoose.connection.readyState === 1) {
//       await mongoose.disconnect();
//     }
//   }
// });


// app.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     uptime: process.uptime(),
//     timestamp: new Date().toISOString()
//   });
// });

// // 404 Handler
// app.use((req, res) => {
//   res.status(404).json({
//     error: 'Not Found',
//     message: `Route ${req.originalUrl} non trovata`
//   });
// });

// // Avvia tutto
// async function startServer() {
//   try {
//     console.log('🔧 Avvio applicazione...');
    
//     // Connessione al database
//     await connectDB(); // <- QUESTA È UNA FUNZIONE!
    
//     // Avvia server
//     app.listen(PORT, () => {
//       console.log('\n' + '='.repeat(50));
//       console.log(`🚀 Server Express in esecuzione`);
//       console.log(`📍 Porta: ${PORT}`);
//       console.log(`🔗 URL: http://localhost:${PORT}`);
//       console.log('='.repeat(50) + '\n');
//     });
    
//   } catch (error) {
//     console.error('❌ Impossibile avviare:', error.message);
//     process.exit(1);
//   }
// }

// startServer();
// server.js - VERSIONE AGGIORNATA
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/database');

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

// Servi file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (se le hai)
// app.use('/api/auth', authRoutes);
// app.use('/api/csv', csvRoutes);

// Route per la pagina web
app.get('/web', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API per ottenere utenti (nuova)
app.get('/api/users', async (req, res) => {
  try {
    const User = require('./src/models/User');
    const users = await User.find({});
    res.json({ 
      success: true, 
      count: users.length, 
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        age: u.age,
        city: u.city,
        isActive: u.isActive,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('🔥 Errore API users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API per statistiche
app.get('/api/users/stats', async (req, res) => {
  try {
    const User = require('./src/models/User');
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgAge: { $avg: "$age" },
          activeCount: { $sum: { $cond: ["$isActive", 1, 0] } },
          cities: { $addToSet: "$city" }
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      stats: stats[0] || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route di test
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API Express + MongoDB Funzionante!',
    version: '1.0.0',
    endpoints: {
      home: '/',
      web: '/web',
      api: {
        users: '/api/users',
        stats: '/api/users/stats'
      }
    }
  });
});

// Avvia server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Server attivo: http://localhost:${PORT}`);
  console.log(`🌐 Web interface: http://localhost:${PORT}/web`);
  console.log(`📁 Database: MongoDB Atlas connesso`);
  console.log('='.repeat(50) + '\n');
});