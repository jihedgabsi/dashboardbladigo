const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Active le mode furtif pour éviter les blocages
puppeteer.use(StealthPlugin());

let whatsappScanQR = null;
let isWhatsAppConnected = false;
let isClientInitialized = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// --- EVENTS ---

client.on('qr', async (qr) => {
    console.log('📲 QR Code reçu');
    whatsappScanQR = await qrcode.toDataURL(qr);
    console.log('🔗 QR Code généré en DataURL.');
});

client.on('ready', () => {
    console.log('✅ WhatsApp Web connecté !');
    isWhatsAppConnected = true;
    isClientInitialized = false;
    console.log(`ℹ️ Statut : isWhatsAppConnected=${isWhatsAppConnected}`);
});

client.on('disconnected', (reason) => {
    console.log('❌ Déconnecté de WhatsApp:', reason);
    isWhatsAppConnected = false;
    isClientInitialized = false;
    whatsappScanQR = null;
    console.log('🔄 Tentative de reconnexion automatique...');
    startWhatsApp();
});

// --- FUNCTIONS ---

const startWhatsApp = async () => {
    if (isWhatsAppConnected || isClientInitialized) {
        console.log('⚠️ WhatsApp déjà connecté ou en cours d\'initialisation.');
        return;
    }
    try {
        console.log('🚀 Initialisation du client WhatsApp...');
        isClientInitialized = true;
        await client.initialize();
        console.log('✅ Client WhatsApp initialisé.');
    } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation de WhatsApp:', err);
        isClientInitialized = false;
    }
};

// --- API ENDPOINTS ---

// Démarrer WhatsApp
exports.startWhatsApp = async (req, res) => {
    console.log('📥 Requête : /whatsapp/start');
    if (isWhatsAppConnected) {
        console.log('ℹ️ WhatsApp déjà connecté.');
        return res.json({ success: true, message: "✅ WhatsApp est déjà connecté." });
    }
    if (isClientInitialized) {
        console.log('ℹ️ Connexion WhatsApp en cours...');
        return res.json({ success: true, message: "🕒 WhatsApp est en cours de connexion..." });
    }
    startWhatsApp();
    res.json({ success: true, message: "🚀 WhatsApp en cours de démarrage..." });
};

// Obtenir le QR Code
exports.getQRCode = (req, res) => {
    console.log('📥 Requête : /whatsapp/qrcode');
    if (!whatsappScanQR) {
        console.log('⚠️ QR Code non disponible.');
        return res.status(500).json({ error: "QR Code non disponible. Démarrez WhatsApp avec POST /whatsapp/start" });
    }
    res.json({ qrCode: whatsappScanQR });
    console.log('✅ QR Code renvoyé au client.');
};

// Envoyer un message à un numéro
exports.sendMessage = async (req, res) => {
    console.log('📥 Requête : /whatsapp/send');
    const { phone, message } = req.body;

    if (!phone || !message) {
        console.log('⚠️ Numéro ou message manquant.');
        return res.status(400).json({ error: "Numéro de téléphone et message requis." });
    }

    if (!isWhatsAppConnected) {
        console.log('⚠️ WhatsApp non connecté.');
        return res.status(403).json({ error: "WhatsApp n'est pas connecté. Veuillez scanner le QR Code." });
    }

    try {
        console.log(`ℹ️ Envoi du message à ${phone}...`);
        await client.sendMessage(`${phone}@c.us`, message);
        console.log(`✅ Message envoyé à ${phone}: "${message}"`);
        res.json({ success: true, message: `Message envoyé à ${phone}` });
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

// Vérifier le statut
exports.getStatus = (req, res) => {
    console.log('📥 Requête : /whatsapp/status');
    res.json({ isConnected: isWhatsAppConnected });
};

// Déconnexion
exports.logoutWhatsApp = async (req, res) => {
    console.log('📥 Requête : /whatsapp/logout');
    if (!isWhatsAppConnected) {
        console.log('⚠️ WhatsApp non connecté.');
        return res.json({ success: false, message: "WhatsApp n'est pas connecté." });
    }

    try {
        await client.logout();
        console.log('✅ WhatsApp déconnecté avec succès.');
        isWhatsAppConnected = false;
        isClientInitialized = false;
        whatsappScanQR = null;
        res.json({ success: true, message: "WhatsApp déconnecté avec succès." });
    } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        res.status(500).json({ error: "Erreur lors de la déconnexion de WhatsApp." });
    }
};
