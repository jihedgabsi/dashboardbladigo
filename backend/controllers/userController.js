const User = require('../models/User');
const bcrypt = require('bcryptjs');

// === Obtenir tous les utilisateurs pour le dashboard
exports.getAllDashboardUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username email phoneNumber isVerified createdAt');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: err.message });
  }
};

// === Mettre à jour un utilisateur par ID
exports.updateUserById = async (req, res) => {
  try {
    if (req.body.password) {
      delete req.body.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === Mettre à jour le mot de passe de l'utilisateur connecté
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Les deux mots de passe sont requis.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === Supprimer un utilisateur par ID
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
