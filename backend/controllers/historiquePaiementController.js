const HistoriquePaiement = require('../models/HistoriquePaiement');

/**
 * @desc    Récupérer tout l'historique des paiements
 * @route   GET /api/historique-paiements
 * @access  Private/Admin
 */
const getHistoriquePaiements = async (req, res) => {
  try {
    // Récupère tous les paiements, les trie par date la plus récente
    // et peuple les informations du chauffeur associé.
    const historique = await HistoriquePaiement.find({})
      .populate('id_driver', 'username email phoneNumber') // Récupère username, email, et phoneNumber du chauffeur
      .sort({ datePaiement: -1 }); // Trie pour afficher les plus récents en premier

    res.status(200).json(historique);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
    res.status(500).json({ message: 'Erreur du serveur lors de la récupération des données.' });
  }
};

module.exports = {
  getHistoriquePaiements,
};
