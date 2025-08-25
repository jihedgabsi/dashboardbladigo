const Driver = require('../models/Driver');
const bcrypt = require('bcryptjs');
const HistoriquePaiement = require('../models/HistoriquePaiement');
const Commission = require('../models/Commission');

// === Obtenir tous les chauffeurs pour le dashboard
exports.getAllDashboardDrivers = async (req, res) => {
  try {
    // 1. Récupérer les chauffeurs avec les champs souhaités
    const drivers = await Driver.find({}, 'username email phoneNumber solde isVerified createdAt').lean();

    // 2. Renvoyer directement la liste des chauffeurs
    // Le champ 'solde' contient maintenant le solde réel du chauffeur, et non un montant de commission.
    res.status(200).json(drivers);

  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des chauffeurs', error: err.message });
  }
};

// === Mettre à jour un chauffeur par ID
exports.updateDriverById = async (req, res) => {
  try {
    if (req.body.password) {
      delete req.body.password;
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, select: '-password' }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    res.status(200).json(updatedDriver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === Mettre à jour le mot de passe du chauffeur connecté
exports.updateDriverPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Les deux mots de passe sont requis.' });
    }

    const driver = await Driver.findById(req.userId);
    if (!driver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    const isMatch = await driver.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    driver.password = await bcrypt.hash(newPassword, salt);
    await driver.save();

    res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === Supprimer un chauffeur par ID
exports.deleteDriverById = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    res.status(200).json({ message: 'Chauffeur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// === Mettre à jour le solde d'un chauffeur par ID
exports.updateDriverSolde = async (req, res) => {
  try {
    // Récupérer le montant de la requête. Il peut être positif (pour ajouter) ou négatif (pour retirer).
    const { amount } = req.body;
    const driverId = req.params.id;

    // Vérifier si le montant est bien un nombre
    if (typeof amount !== 'number') {
      return res.status(400).json({ message: 'Le montant fourni doit être un nombre.' });
    }

    // Utiliser findByIdAndUpdate avec l'opérateur $inc pour modifier le solde de manière atomique
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { $inc: { solde: amount } }, // $inc ajoute la valeur de 'amount' au champ 'solde'
      { new: true, select: 'username email solde' } // 'new: true' pour retourner le document mis à jour
                                                    // 'select' pour ne retourner que les champs pertinents
    );

    // Si aucun chauffeur n'est trouvé avec cet ID
    if (!updatedDriver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    // Renvoyer le chauffeur mis à jour
    res.status(200).json({ 
        message: 'Solde mis à jour avec succès.',
        driver: updatedDriver 
    });

  } catch (error) {
    // Gérer les erreurs potentielles (ex: erreur de connexion à la BDD)
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du solde.', error: error.message });
  }
};


exports.payercommissioncomplette = async (req, res) => {
  try {
    const driverId = req.params.id;

    // 1. Trouver le chauffeur pour obtenir son solde actuel
    const driver = await Driver.findById(driverId);

    const commissionDoc = await Commission.findOne().sort({ updatedAt: -1 });
    const commissionPercentage = commissionDoc ? commissionDoc.valeur : 10; // ex: 10%

    

    if (!driver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    if (driver.solde <= 0) {
      return res.status(400).json({ message: 'Le solde est déjà à zéro ou négatif. Aucun paiement n\'est nécessaire.' });
    }

    // Garder une copie du solde avant la mise à zéro
    const soldeOriginal = driver.solde;
    const commissionAmount = soldeOriginal * (commissionPercentage / 100);

    // 2. Créer et sauvegarder l'enregistrement dans l'historique
    // C'est la première opération d'écriture
    const nouvelHistorique = new HistoriquePaiement({
      id_driver: driverId,
      montantPaye: commissionAmount,
    });
    await nouvelHistorique.save();

    // 3. Mettre le solde du chauffeur à 0
    // C'est la deuxième opération d'écriture
    driver.solde = 0;
    const updatedDriver = await driver.save();
    
    // Renvoyer le chauffeur mis à jour avec un message de succès
    res.status(200).json({
      message: `Paiement de ${soldeOriginal} effectué avec succès. Le nouveau solde est 0.`,
      driver: { // On renvoie un objet propre pour l'affichage
        username: updatedDriver.username,
        email: updatedDriver.email,
        solde: updatedDriver.solde,
      },
    });

  } catch (error) {
    // Gérer les erreurs potentielles (ex: erreur de connexion à la BDD)
    res.status(500).json({ message: 'Erreur serveur lors du paiement de la commission.', error: error.message });
  }
};




exports.payerpartiedecommission = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { amount } = req.body;

    // --- 1. Validation des données d'entrée ---
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Le montant doit être un nombre positif.' });
    }

    // --- 2. Vérification du chauffeur et de son solde ---
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé.' });
    }

    if (driver.solde < amount) {
      return res.status(400).json({
        message: `Paiement refusé. Le solde (${driver.solde}) est insuffisant pour payer ${amount}.`
      });
    }

    // --- 3. Enregistrement de l'historique de paiement ---
    const nouvelHistorique = new HistoriquePaiement({
      id_driver: driverId,
      montantPaye: amount,
    });
    await nouvelHistorique.save();

    // --- 4. Mise à jour du solde du chauffeur ---
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { $inc: { solde: -amount } }, // $inc soustrait la valeur de 'amount' du solde
      { new: true, select: 'username email solde' } // 'new: true' retourne le document mis à jour
    );

    // --- 5. Réponse de succès ---
    res.status(200).json({
      message: `Paiement partiel de ${amount} effectué avec succès.`,
      driver: updatedDriver,
    });

  } catch (error) {
    // Gestion des erreurs générales
    res.status(500).json({ message: 'Erreur serveur lors du paiement.', error: error.message });
  }

};
