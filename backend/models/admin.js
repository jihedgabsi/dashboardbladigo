const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Veuillez fournir un nom'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Veuillez fournir un email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez fournir un email valide',
      ],
    },
    password: {
      type: String,
      required: [true, 'Veuillez fournir un mot de passe'],
      minlength: 6,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: true, // Par défaut, tous les utilisateurs dans ce modèle sont des administrateurs
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pour hacher le mot de passe avant de sauvegarder
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ce modèle sera stocké dans la collection 'admin'
const Admin = mongoose.model('Admin', adminSchema, 'admin');

module.exports = Admin;