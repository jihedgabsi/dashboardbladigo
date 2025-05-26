const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Admin = require('../models/admin'); // Changé de User à Admin

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Enregistrer un administrateur
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Vérifier si l'admin existe
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer un nouvel admin
    const admin = await Admin.create({
      name,
      email,
      password,
      // isAdmin est true par défaut dans le schéma
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: 'Données invalides' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Authentifier un administrateur
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Vérifier si l'admin existe
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir le profil administrateur
// @route   GET /api/auth/profile
// @access  Private
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'Administrateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = { register, login, getAdminProfile };