const mongoose = require('mongoose');

const villeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  payer: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

Ville = mongoose.model('Ville', villeSchema);
module.exports = Ville;