// src/routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');
const multer = require('multer');

// Configura Multer per upload file
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo file CSV sono consentiti'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
});

// Route per CSV
router.post('/import', csvController.importCSV); 
router.post('/upload', upload.single('csvfile'), csvController.uploadAndImportCSV); 
router.get('/data', csvController.getAllData); // Lista dati
router.get('/stats', csvController.getStats); // Statistiche

module.exports = router;