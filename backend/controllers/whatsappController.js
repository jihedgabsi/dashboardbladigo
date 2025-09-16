const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { chromium } = require('playwright');

let whatsappScanQR = null;
let isWhatsAppConnected = false;
let isClientInitializing = false; // Variable pour éviter les initialisations multiples

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        browserWSEndpoint: false,
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-gpu', // Désactive l'accélération matérielle pour économiser de la mémoire
            '--disable-dev-shm-usage', // Important pour les environnements de conteneurs (Docker)
            '--no-zygote',
            '--single-process' // Pour les environnements avec peu de mémoire
        ],
        browser: 'chromium' // Utilise chromium directement
    }
});

client.on('qr', async (qr) => {
    console.log('QR Code reçu:', qr);
    whatsappScanQR = await qrcode.toDataURL(qr);
});

client.on('ready', () => {
    console.log('✅ WhatsApp Web connecté !');
    isWhatsAppConnected = true;
    isClientInitializing = false;
});

client.on('disconnected', (reason) => {
    console.log('❌ Déconnecté de WhatsApp:', reason);
    isWhatsAppConnected = false;
    isClientInitializing = false;
    whatsappScanQR = null;
    
    // Tente de se reconnecter automatiquement
    console.log('Tentative de reconnexion...');
    startWhatsApp();
});

const startWhatsApp = async () => {
    if (isWhatsAppConnected || isClientInitializing) {
        console.log("WhatsApp est déjà connecté ou en cours de connexion.");
        return;
    }
    try {
        isClientInitializing = true;
        await client.initialize();
        console.log("🚀 WhatsApp en cours de démarrage...");
    } catch (err) {
        console.error("Erreur lors de l'initialisation de WhatsApp:", err);
        isClientInitializing = false;
    }
};

// Fonctions d'export (exports.startWhatsApp, exports.getQRCode, etc.)
// Les exports restent les mêmes, mais la logique de startWhatsApp a été externalisée pour la réutilisation
exports.startWhatsApp = (req, res) => {
    if (isWhatsAppConnected) {
        return res.json({ success: true, message: "✅ WhatsApp est déjà connecté." });
    }
    if (isClientInitializing) {
        return res.json({ success: true, message: "🕒 WhatsApp est en cours de connexion..." });
    }
    startWhatsApp(); // Appelle la fonction interne
    res.json({ success: true, message: "🚀 WhatsApp en cours de démarrage..." });
};

exports.getQRCode = (req, res) => {
    if (!whatsappScanQR) {
        return res.status(500).json({ error: "QR Code non disponible. Démarrez WhatsApp avec POST /whatsapp/start" });
    }
    res.json({ qrCode: whatsappScanQR });
};

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

exports.getStatus = (req, res) => {
    res.json({ isConnected: isWhatsAppConnected });
};

exports.logoutWhatsApp = async (req, res) => {
    if (!isWhatsAppConnected) {
        return res.json({ success: false, message: "WhatsApp n'est pas connecté." });
    }
    try {
        await client.logout();
        isWhatsAppConnected = false;
        isClientInitializing = false;
        whatsappScanQR = null;
        res.json({ success: true, message: "WhatsApp déconnecté avec succès." });
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        res.status(500).json({ error: "Erreur lors de la déconnexion de WhatsApp." });
    }
};
