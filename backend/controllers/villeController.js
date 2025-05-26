const Ville = require('../models/Ville');

// GET all villes
exports.getAllVilles = async (req, res, next) => {
  try {
    const villes = await Ville.find();
    res.status(200).json({ success: true, data: villes });
  } catch (error) {
    next(error);
  }
};

// CREATE ville
exports.createVille = async (req, res, next) => {
    try {
      const { name, payer } = req.body;
  
      if (!name || !payer) {
        return res.status(400).json({ success: false, message: 'Name and Payer are required' });
      }
  
      const ville = await Ville.create({ name, payer });
  
      res.status(201).json({ success: true, data: ville });
    } catch (error) {
      next(error);
    }
  };
  

// UPDATE ville
exports.updateVille = async (req, res, next) => {
  try {
    const { name, payer } = req.body;
    const ville = await Ville.findByIdAndUpdate(
      req.params.id,
      { name, payer },
      { new: true, runValidators: true }
    );

    if (!ville) {
      return res.status(404).json({ success: false, message: 'Ville not found' });
    }

    res.status(200).json({ success: true, data: ville });
  } catch (error) {
    next(error);
  }
};

// DELETE ville
exports.deleteVille = async (req, res, next) => {
  try {
    const ville = await Ville.findByIdAndDelete(req.params.id);

    if (!ville) {
      return res.status(404).json({ success: false, message: 'Ville not found' });
    }

    res.status(200).json({ success: true, message: 'Ville deleted successfully' });
  } catch (error) {
    next(error);
  }
};
