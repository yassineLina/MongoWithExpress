// src/models/CSVData.js
const mongoose = require('mongoose');

const csvDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  age: {
    type: Number,
    min: 0,
    max: 150
  },
  city: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  importedAt: {
    type: Date,
    default: Date.now
  },
  sourceFile: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indici per ottimizzare le ricerche
csvDataSchema.index({ email: 1 }, { unique: true });
csvDataSchema.index({ city: 1 });
csvDataSchema.index({ isActive: 1 });

module.exports = mongoose.model('CSVData', csvDataSchema);