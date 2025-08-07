const express = require('express');
const router = express.Router();
const { getCommission, updateCommission } = require('../controllers/commissionController'); // Assurez-vous que le chemin est correct
const { protect, adminOnly } = require('../middleware/authadminMiddleware');
// @route   GET /api/commission
// @desc    Récupérer le paramètre de commission
router.get('/',protect, adminOnly, getCommission);

// @route   PUT /api/commission
// @desc    Mettre à jour le paramètre de commission
router.put('/',protect, adminOnly, updateCommission);

module.exports = router;