const express = require('express');
const router = express.Router();

// Importation des fonctions du contrôleur chauffeur
const {
  getAllDashboardDrivers,
  updateDriverById,
  updateDriverPassword,
  deleteDriverById,
} = require('../controllers/driverController');

// Middleware pour la protection des routes
const { protect, adminOnly } = require('../middleware/authadminMiddleware');

// === Routes protégées
router.get('/alldashboarddrivers', protect, adminOnly, getAllDashboardDrivers);
router.put('/:id', protect, adminOnly, updateDriverById);
router.put('/update-password', protect, updateDriverPassword); // Utilisateur connecté (chauffeur)
router.delete('/:id', protect, adminOnly, deleteDriverById);

module.exports = router;
