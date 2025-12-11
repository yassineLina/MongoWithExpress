// src/controllers/csvController.js - VERSIONE CORRETTA
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('csv-parse'); // <-- CORRETTO!
const CSVData = require('../models/CSVData');

// Importa CSV dal file system
exports.importCSV = async (req, res) => {
  try {
    const { filename = 'users.csv' } = req.body;
    const filePath = path.join(__dirname, '../../data/csv', filename);
    
    console.log(`📂 Tentativo di lettura: ${filePath}`);
    
    // Verifica se il file esiste
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `File ${filename} non trovato in data/csv/`
      });
    }
    
    const results = [];
    let importedCount = 0;
    let skippedCount = 0;
    
    // Leggi e processa il CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Trasforma i dati
          const transformedData = {
            name: data.name?.trim() || '',
            email: data.email?.trim().toLowerCase() || '',
            age: parseInt(data.age) || 0,
            city: data.city?.trim() || '',
            isActive: data.isActive?.toLowerCase() === 'true',
            createdAt: new Date(data.createdAt) || new Date(),
            sourceFile: filename
          };
          
          results.push(transformedData);
        })
        .on('end', async () => {
          try {
            console.log(`📊 Righe lette dal CSV: ${results.length}`);
            
            // Importa nel database
            for (const item of results) {
              try {
                // Verifica se l'email esiste già
                const existing = await CSVData.findOne({ email: item.email });
                
                if (!existing) {
                  await CSVData.create(item);
                  importedCount++;
                  console.log(`✅ Importato: ${item.email}`);
                } else {
                  skippedCount++;
                  console.log(`⏭️  Saltato (esistente): ${item.email}`);
                }
              } catch (error) {
                console.error(`❌ Errore su ${item.email}:`, error.message);
                skippedCount++;
              }
            }
            
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    res.status(200).json({
      success: true,
      message: `Importazione completata`,
      details: {
        totalRows: results.length,
        imported: importedCount,
        skipped: skippedCount,
        filename: filename,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('🔥 Errore importazione CSV:', error);
    res.status(500).json({
      success: false,
      message: `Errore durante l'importazione: ${error.message}`
    });
  }
};

// Importa CSV da payload multipart/form-data (upload file)
exports.uploadAndImportCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nessun file caricato'
      });
    }
    
    const fileContent = req.file.buffer.toString('utf8');
    
    // Usa csv-parse per parsing sincrono
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`📊 Righe lette: ${records.length}`);
    
    const results = [];
    let importedCount = 0;
    let skippedCount = 0;
    
    // Importa ogni record
    for (const record of records) {
      try {
        const data = {
          name: record.name || '',
          email: record.email?.toLowerCase() || '',
          age: parseInt(record.age) || 0,
          city: record.city || '',
          isActive: record.isActive?.toLowerCase() === 'true',
          createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
          sourceFile: req.file.originalname
        };
        
        // Verifica se esiste già
        const existing = await CSVData.findOne({ email: data.email });
        
        if (!existing) {
          await CSVData.create(data);
          importedCount++;
          console.log(`✅ Importato: ${data.email}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Saltato (esistente): ${data.email}`);
        }
        
      } catch (error) {
        console.log(`⚠️  Errore su ${record.email}: ${error.message}`);
        skippedCount++;
      }
    }
    
    res.json({
      success: true,
      message: `File ${req.file.originalname} importato con successo`,
      imported: importedCount,
      skipped: skippedCount,
      total: records.length,
      filename: req.file.originalname,
      fileSize: `${(req.file.size / 1024).toFixed(2)} KB`
    });
    
  } catch (error) {
    console.error('🔥 Errore importazione:', error);
    res.status(500).json({
      success: false,
      message: `Errore importazione: ${error.message}`
    });
  }
};

// Resto del codice rimane uguale...
exports.getAllData = async (req, res) => { /* ... */ };
exports.getStats = async (req, res) => { /* ... */ };