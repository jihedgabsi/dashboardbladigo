const Location = require('../models/airportport'); // Importation du modèle
const mongoose = require('mongoose');

/**
 * @desc    Ajouter un nouvel emplacement
 * @route   POST /api/locations
 */
exports.addLocation = async (req, res) => {
  try {
    const { name, transportMode } = req.body;

    // Validation simple
    if (!name || !transportMode) {
      return res.status(400).json({ message: "Les champs 'name' et 'transportMode' sont requis." });
    }

    const newLocation = new Location({ name, transportMode });
    await newLocation.save(); // Sauvegarde le nouvel emplacement dans la base de données

    res.status(201).json({ message: "Emplacement ajouté avec succès.", location: newLocation });

  } catch (error) {
    // Gère les erreurs de validation du modèle (ex: enum non respecté)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Erreur de validation.", error: error.message });
    }
    res.status(500).json({ message: "Erreur du serveur lors de l'ajout de l'emplacement.", error: error.message });
  }
};


/**
 * @desc    Récupérer les emplacements par mode de transport
 * @route   GET /api/locations
 */
exports.getLocations = async (req, res) => {
  try {
    const { transportMode } = req.query;

    if (!transportMode) {
      return res.status(400).json({ message: "Le paramètre 'transportMode' est manquant." });
    }

    // ANCIEN CODE (à supprimer) :
    // const locations = await Location.find({ transportMode: transportMode }).select('name -_id');
    // const locationNames = locations.map(loc => loc.name);
    // res.status(200).json(locationNames); // CELA CAUSE LE PROBLÈME

    // ✅ NOUVEAU CODE CORRECT :
    // 1. On récupère les documents complets (avec _id, name, etc.)
    const locations = await Location.find({ transportMode: transportMode });

    // 2. On les renvoie dans un objet avec une clé "data"
    res.status(200).json({ data: locations });

  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur lors de la récupération des données.", error: error.message });
  }
};

/**
 * @desc    Mettre à jour un emplacement existant
 * @route   PUT /api/locations/:id
 */
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params; // Récupère l'ID de l'URL
    const { name, transportMode } = req.body; // Récupère les nouvelles données

    // Vérifie si l'ID fourni est un ObjectId MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID invalide." });
    }

    // Validation des données entrantes
    if (!name && !transportMode) {
      return res.status(400).json({ message: "Aucune donnée de mise à jour fournie." });
    }

    // Recherche l'emplacement par ID et le met à jour
    // { new: true } renvoie le document mis à jour
    // { runValidators: true } s'assure que les nouvelles données respectent le schéma
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: "Aucun emplacement trouvé avec cet ID." });
    }

    res.status(200).json({ message: "Emplacement mis à jour avec succès.", location: updatedLocation });

  } catch (error) {
    // Gère les erreurs de validation du modèle
     if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Erreur de validation.", error: error.message });
    }
    res.status(500).json({ message: "Erreur du serveur lors de la mise à jour.", error: error.message });
  }
};

/**
 * @desc    Supprimer un emplacement
 * @route   DELETE /api/locations/:id
 */
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params; // Récupère l'ID de l'URL

    // Vérifie si l'ID est un ObjectId MongoDB valide
     if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID invalide." });
    }

    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      return res.status(404).json({ message: "Aucun emplacement trouvé avec cet ID." });
    }

    res.status(200).json({ message: "Emplacement supprimé avec succès." });

  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur lors de la suppression.", error: error.message });
  }
};