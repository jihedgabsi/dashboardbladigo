const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

let whatsappScanQR = null;
let isWhatsAppConnected = false;
let isClientInitializing = false;

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "flash-driver" }), // session persistante
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--single-process'
        ]
    }
});

// 🔹 QR Code reçu
client.on('qr', async (qr) => {
    console.log('QR Code reçu:', qr);
    whatsappScanQR = await qrcode.toDataURL(qr);
});

// 🔹 Authentifié (juste après scan QR)
client.on('authenticated', () => {
    console.log('🔑 Authentifié sur WhatsApp !');
    isWhatsAppConnected = true;
    isClientInitializing = false;
});

// 🔹 Authentification échouée
client.on('auth_failure', (msg) => {
    console.error('❌ Échec d\'authentification:', msg);
    isWhatsAppConnected = false;
    isClientInitializing = false;
    whatsappScanQR = null;
});

// 🔹 Client prêt
client.on('ready', () => {
    console.log('✅ WhatsApp Web connecté et prêt !');
    isWhatsAppConnected = true;
    isClientInitializing = false;
});

// 🔹 Déconnexion
client.on('disconnected', (reason) => {
    console.log('❌ Déconnecté de WhatsApp:', reason);
    isWhatsAppConnected = false;
    isClientInitializing = false;
    whatsappScanQR = null;

    console.log('Tentative de reconnexion...');
    startWhatsApp();
});

// 🔹 Démarrage WhatsApp
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

// --- API CONTROLLER EXPORTS ---

exports.startWhatsApp = (req, res) => {
    if (isWhatsAppConnected) {
        return res.json({ success: true, message: "✅ WhatsApp est déjà connecté." });
    }
    if (isClientInitializing) {
        return res.json({ success: true, message: "🕒 WhatsApp est en cours de connexion..." });
    }
    startWhatsApp();
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
        const chatId = `${phone}@c.us`; // format international sans +
        await client.sendMessage(chatId, message, { sendSeen: false }); // ✅ fix
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

