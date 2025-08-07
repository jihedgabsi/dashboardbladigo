// location.routes.js

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authadminMiddleware');

// Importation des fonctions du contrôleur
// Assurez-vous que le chemin vers votre contrôleur est correct
const locationController = require('../controllers/airportport'); // Nom de fichier suggéré : locationController.js

// DÉFINITION DES ROUTES POUR LE CRUD (Create, Read, Update, Delete)

// -------------------------------------------------------------------

// @route   POST /api/locations
// @desc    Créer (ajouter) un nouvel emplacement
router.post('/locations',protect, adminOnly, locationController.addLocation);

// -------------------------------------------------------------------

// @route   GET /api/locations
// @desc    Lire (récupérer) les emplacements par mode de transport
// @access  Exemple d'URL : /api/locations?transportMode=Avion
router.get('/locations',protect, adminOnly, locationController.getLocations);

// -------------------------------------------------------------------

// @route   PUT /api/locations/:id
// @desc    Mettre à jour (Update) un emplacement via son ID
// @access  L'ID de l'emplacement à modifier est passé dans l'URL
router.put('/locations/:id', locationController.updateLocation);

// -------------------------------------------------------------------

// @route   DELETE /api/locations/:id
// @desc    Supprimer (Delete) un emplacement via son ID
// @access  L'ID de l'emplacement à supprimer est passé dans l'URL
router.delete('/locations/:id',protect, adminOnly, locationController.deleteLocation);

// -------------------------------------------------------------------


// ✅ Vous exportez bien le router pour qu'il soit utilisable dans votre application principale (app.js ou server.js)
module.exports = router;