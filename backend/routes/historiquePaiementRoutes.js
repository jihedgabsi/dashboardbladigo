const express = require('express');
const router = express.Router();
const { getHistoriquePaiements } = require('../controllers/historiquePaiementController');
const { protect, adminOnly } = require('../middleware/authadminMiddleware');


// Définition de la route pour obtenir l'historique des paiements
// La route est protégée : seul un admin peut y accéder.
router.route('/').get( getHistoriquePaiements,protect, adminOnly);

module.exports = router;
