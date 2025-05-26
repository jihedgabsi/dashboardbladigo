const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { chromium } = require('playwright');

let whatsappScanQR = null;
let isWhatsAppConnected = false;
let isClientInitialized = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        browserWSEndpoint: false,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // Fonction personnalisée pour utiliser Playwright
        async launch(options) {
            const browser = await chromium.launch({
                headless: options.headless,
                args: options.args
            });
            return browser;
        }
    }
});

client.on('qr', async (qr) => {
    console.log('QR Code reçu:', qr);
    whatsappScanQR = await qrcode.toDataURL(qr);
});

client.on('ready', () => {
    console.log('✅ WhatsApp Web connecté !');
    isWhatsAppConnected = true;
});

client.on('disconnected', (reason) => {
    console.log('❌ Déconnecté de WhatsApp:', reason);
    isWhatsAppConnected = false;
    isClientInitialized = false;
    whatsappScanQR = null;
});

// Démarrer WhatsApp Web
exports.startWhatsApp = async (req, res) => {
    if (isWhatsAppConnected) {
        return res.json({ success: true, message: "✅ WhatsApp est déjà connecté." });
    }
    if (isClientInitialized) {
        return res.json({ success: true, message: "🕒 WhatsApp est en cours de connexion..." });
    }
    try {
        client.initialize();
        isClientInitialized = true;
        res.json({ success: true, message: "🚀 WhatsApp en cours de démarrage..." });
    } catch (err) {
        console.error("Erreur lors de l'initialisation de WhatsApp:", err);
        res.status(500).json({ error: "❌ Échec de l'initialisation de WhatsApp." });
    }
};

// Obtenir le QR Code
exports.getQRCode = (req, res) => {
    if (!whatsappScanQR) {
        return res.status(500).json({ error: "QR Code non disponible. Démarrez WhatsApp avec POST /whatsapp/start" });
    }
    res.json({ qrCode: whatsappScanQR });
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
        return res.status(400).json({ error: "Numéro de téléphone et message requis." });
    }
    if (!isWhatsAppConnected) {
        return res.status(403).json({ error: "WhatsApp n'est pas connecté. Veuillez scanner le QR Code." });
    }
    try {
        await client.sendMessage(`${phone}@c.us`, message);
        res.json({ success: true, message: `Message envoyé à ${phone}` });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

// Vérifier le statut
exports.getStatus = (req, res) => {
    res.json({ isConnected: isWhatsAppConnected });
};

// Déconnexion de WhatsApp
exports.logoutWhatsApp = async (req, res) => {
    if (!isWhatsAppConnected) {
        return res.json({ success: false, message: "WhatsApp n'est pas connecté." });
    }
    try {
        await client.logout();
        isWhatsAppConnected = false;
        isClientInitialized = false;
        whatsappScanQR = null;
        res.json({ success: true, message: "WhatsApp déconnecté avec succès." });
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        res.status(500).json({ error: "Erreur lors de la déconnexion de WhatsApp." });
    }
};