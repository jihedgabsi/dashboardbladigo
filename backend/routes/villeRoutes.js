const express = require('express');
const router = express.Router();
const villeController = require('../controllers/villeController');
const { protect, adminOnly } = require('../middleware/authadminMiddleware');

// GET all villes
router.get('/', protect, adminOnly, villeController.getAllVilles);

// CREATE ville
router.post('/', protect, adminOnly,villeController.createVille);

// UPDATE ville
router.put('/:id',protect, adminOnly, villeController.updateVille);

// DELETE ville
router.delete('/:id',protect, adminOnly, villeController.deleteVille);

module.exports = router;
