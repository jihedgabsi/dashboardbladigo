const express = require("express");
const router = express.Router();
const multer = require("multer");
const baggageController = require("../controllers/baggageController");

// Middleware pour la protection des routes
const { protect, adminOnly } = require('../middleware/authadminMiddleware');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image file."), false);
    }
  },
});

// Routes
router.get("/", protect, adminOnly, baggageController.getAllBaggage);

router.get("/:id", protect, adminOnly, baggageController.getBaggage);
router.post("/", protect, adminOnly, upload.array("images", 3), baggageController.createBaggage); // Changed to upload.array and 'images'
router.put("/:id", protect, adminOnly, upload.array("images", 3), baggageController.updateBaggage); // Changed to upload.array and 'images'
router.delete("/:id", protect, adminOnly, baggageController.deleteBaggage);

module.exports = router;
