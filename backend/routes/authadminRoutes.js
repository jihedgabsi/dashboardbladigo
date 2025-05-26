const express = require('express');
const { check } = require('express-validator');
const { register, login, getAdminProfile } = require('../controllers/authadminController');
const { protect } = require('../middleware/authadminMiddleware');

const router = express.Router();

// Route d'enregistrement
router.post(
  '/register',
  [
    check('name', 'Le nom est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Veuillez entrer un mot de passe avec 6 caractères ou plus').isLength({ min: 6 }),
  ],
  register
);

// Route de connexion
router.post(
  '/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists(),
  ],
  login
);

// Route pour obtenir le profil administrateur
router.get('/profile', protect, getAdminProfile);

module.exports = router;
