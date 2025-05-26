const Driver = require('../models/Driver');
const bcrypt = require('bcryptjs');

// === Obtenir tous les chauffeurs pour le dashboard
exports.getAllDashboardDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({}, 'username email phoneNumber isVerified createdAt');
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
