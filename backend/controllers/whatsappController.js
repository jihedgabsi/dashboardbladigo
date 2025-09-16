const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

let whatsappScanQR = null;
let isWhatsAppConnected = false;
let isClientInitialized = false;

// Création du client WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    }
});

// --- EVENTS ---

// QR reçu
client.on('qr', async (qr) => {
    console.log('📲 QR Code reçu');
    whatsappScanQR = await qrcode.toDataURL(qr);
});

// Client prêt
client.on('ready', () => {
    console.log('✅ WhatsApp Web connecté !');
    isWhatsAppConnected = true;
    isClientInitialized = false;
});

// Déconnecté
client.on('disconnected', (reason) => {
    console.log('❌ Déconnecté de WhatsApp:', reason);
    isWhatsAppConnected = false;
    isClientInitialized = false;
    whatsappScanQR = null;

    // Reconnexion automatique
    startWhatsApp();
});

// --- FUNCTIONS ---

const startWhatsApp = async () => {
    if (isWhatsAppConnected || isClientInitialized) {
        console.log('⚠️ WhatsApp déjà connecté ou en cours d\'initialisation.');
        return;
    }
    try {
        isClientInitialized = true;
        await client.initialize();
        console.log('🚀 WhatsApp en cours de démarrage...');
    } catch (err) {
        console.error('Erreur lors de l\'initialisation de WhatsApp:', err);
        isClientInitialized = false;
    }
};

// --- API ENDPOINTS ---

// Démarrer WhatsApp
exports.startWhatsApp = async (req, res) => {
    if (isWhatsAppConnected) {
        return res.json({ success: true, message: "✅ WhatsApp est déjà connecté." });
    }
    if (isClientInitialized) {
        return res.json({ success: true, message: "🕒 WhatsApp est en cours de connexion..." });
    }
    startWhatsApp();
    res.json({ success: true, message: "🚀 WhatsApp en cours de démarrage..." });
};

// Obtenir le QR Code
exports.getQRCode = (req, res) => {
    if (!whatsappScanQR) {
        return res.status(404).json({ error: "QR Code non disponible. Démarrez WhatsApp avec /whatsapp/start" });
    }
    res.json({ qrCode: whatsappScanQR });
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: "Numéro et message requis." });
    }
    if (!isWhatsAppConnected) {
        return res.status(403).json({ error: "WhatsApp n'est pas connecté. Veuillez scanner le QR Code." });
    }

    try {
        const cleanPhone = phone.replace(/\D/g, "");
        const chatId = ${cleanPhone}@c.us;

        const chat = await client.getChatById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat non trouvé pour ce numéro." });
        }

        await chat.sendMessage(message);
        res.json({ success: true, message: Message envoyé à ${phone} });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message. Vérifiez le numéro et la connexion." });
    }
};

// Vérifier le statut
exports.getStatus = (req, res) => {
    res.json({ isConnected: isWhatsAppConnected });
};

// Déconnexion
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
