const jwt = require('jsonwebtoken');
const Admin = require('../models/admin'); // Changé de User à Admin

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Récupérer le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ajouter l'admin à la requête
      req.admin = await Admin.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const adminOnly = (req, res, next) => {
  if (req.admin && req.admin.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès admin requis' });
  }
};

module.exports = { protect, adminOnly };