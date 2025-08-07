const express = require('express');
const router = express.Router();

// Importation des fonctions du contrôleur chauffeur
const {
  getAllDashboardDrivers,
  updateDriverById,
  updateDriverPassword,
  deleteDriverById,
  updateDriverSolde,
  payercommissioncomplette,
  payerpartiedecommission,
} = require('../controllers/driverController');

// Middleware pour la protection des routes
const { protect, adminOnly } = require('../middleware/authadminMiddleware');

// === Routes protégées
router.get('/alldashboarddrivers',protect, adminOnly, getAllDashboardDrivers);
router.put('/:id', protect, adminOnly, updateDriverById);
router.put('/update-password', protect, adminOnly, updateDriverPassword); // Utilisateur connecté (chauffeur)
router.delete('/:id', protect, adminOnly, deleteDriverById);
router.put('/:id/solde', protect, adminOnly, updateDriverSolde);
router.put('/:id/payercommissioncomplette', protect, adminOnly, payercommissioncomplette);
router.put('/:id/payerpartiedecommission', protect, adminOnly, payerpartiedecommission);

module.exports = router;
