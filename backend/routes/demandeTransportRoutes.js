const express = require('express');
const {
  createDemandeTransport,
  getAllDemandeTransports,
  getDemandeTransportById,
  updateDemandeTransport,
  deleteDemandeTransport,
} = require('../controllers/demandeTransportController');
const { protect, adminOnly } = require('../middleware/authadminMiddleware');

const router = express.Router();

// Route to create a new DemandeTransport and get all DemandeTransports
router
  .route('/')
  .post(createDemandeTransport,protect, adminOnly)
  .get(getAllDemandeTransports,protect, adminOnly);

// Route to get, update, and delete a specific DemandeTransport by ID
router
  .route('/:id')
  .get(getDemandeTransportById,protect, adminOnly)
  .put(updateDemandeTransport,protect, adminOnly)
  .delete(deleteDemandeTransport,protect, adminOnly);

module.exports = router;
