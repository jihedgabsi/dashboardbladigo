const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

router.post('/start', whatsappController.startWhatsApp);
router.get('/qrcode', whatsappController.getQRCode);
router.post('/send', whatsappController.sendMessage);
router.get('/status', whatsappController.getStatus);
router.post('/logout', whatsappController.logoutWhatsApp);

module.exports = router;