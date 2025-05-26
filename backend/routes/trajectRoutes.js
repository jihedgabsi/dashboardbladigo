const express = require('express');
const router = express.Router();
const Traject = require('../models/Traject');
const { protect, adminOnly } = require('../middleware/authadminMiddleware');

// GET all trajets
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const trajets = await Traject.find()
    .populate('idChauffeur', 'username email phoneNumber') // <== SEULEMENT les champs à afficher
    .exec();
    res.status(200).json(trajets);
  } catch (error) {
    next(error);
  }
});
// GET trajets in descending order by createdAt
router.get('/recent', protect, adminOnly, async (req, res, next) => {
    try {
      const trajets = await Traject.find().sort({ dateTraject: 1 });
      res.status(200).json(trajets);
    } catch (error) {
      next(error);
    }
  });


// GET trajet by ID
router.get('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const trajet = await Traject.findById(req.params.id);
    if (!trajet) {
      return res.status(404).json({ message: 'Trajet not found' });
    }
    res.status(200).json(trajet);
  } catch (error) {
    next(error);
  }
});

// CREATE new trajet
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const newTrajet = new Traject(req.body);
    const savedTrajet = await newTrajet.save();
    res.status(201).json(savedTrajet);
  } catch (error) {
    next(error);
  }
});

// UPDATE trajet
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const updatedTrajet = await Traject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedTrajet) {
      return res.status(404).json({ message: 'Trajet not found' });
    }
    
    res.status(200).json(updatedTrajet);
  } catch (error) {
    next(error);
  }
});

// DELETE trajet
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const deletedTrajet = await Traject.findByIdAndDelete(req.params.id);
    
    if (!deletedTrajet) {
      return res.status(404).json({ message: 'Trajet not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
