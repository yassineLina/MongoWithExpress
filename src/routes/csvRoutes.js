// src/routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');
const multer = require('multer');

// Configurazione MULTER corretta
const storage = multer.memoryStorage(); // Salva file in memoria come buffer

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limite massimo
    files: 1 // Massimo 1 file per upload
  },
  fileFilter: (req, file, callback) => {
    // Accetta solo file CSV
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    const isCSV = allowedTypes.includes(file.mimetype) || 
                  file.originalname.toLowerCase().endsWith('.csv');
    
    if (isCSV) {
      callback(null, true);
    } else {
      callback(new Error('Solo file CSV sono consentiti (.csv)'), false);
    }
  }
});

// Gestione errori multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Errore specifico di Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File troppo grande. Dimensione massima: 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Troppi file caricati. Massimo 1 file per volta'
      });
    }
  } else if (err) {
    // Altri errori
    return res.status(400).json({
      success: false,
      message: err.message || 'Errore durante il caricamento del file'
    });
  }
  next();
};

// Route per CSV
router.post('/import', csvController.importCSV); // Importa da file esistente
router.post('/upload', upload.single('csvfile'), handleMulterError, csvController.uploadAndImportCSV); // Upload nuovo file
router.get('/data', csvController.getAllData); // Lista dati
router.get('/stats', csvController.getStats); // Statistiche

module.exports = router;