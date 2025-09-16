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
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--single-process', // Pour améliorer la stabilité
            '--disable-gpu', // Peut aider à réduire les erreurs sur certains systèmes
        ],
    },
});

// --- EVENTS ---

// QR reçu
client.on('qr', async (qr) => {
    console.log('📲 QR Code reçu');
    whatsappScanQR = await qrcode.toDataURL(qr);
    console.log('🔗 QR Code généré en DataURL pour affichage.');
});

// Client prêt
client.on('ready', () => {
    console.log('✅ WhatsApp Web connecté !');
    isWhatsAppConnected = true;
    isClientInitialized = false;
    console.log(`ℹ️ Statut : isWhatsAppConnected=${isWhatsAppConnected}, isClientInitialized=${isClientInitialized}`);
});

// Déconnecté
client.on('disconnected', (reason) => {
    console.log('❌ Déconnecté de WhatsApp:', reason);
    isWhatsAppConnected = false;
    isClientInitialized = false;
    whatsappScanQR = null;
    console.log('🔄 Tentative de reconnexion automatique...');
    // Ajout d'un petit délai avant de tenter la reconnexion pour éviter une boucle rapide
    setTimeout(() => startWhatsApp(), 5000); 
});

// --- FUNCTIONS ---

const startWhatsApp = async () => {
    if (isWhatsAppConnected || isClientInitialized) {
        console.log('⚠️ WhatsApp déjà connecté ou en cours d\'initialisation.');
        return;
    }
    try {
        isClientInitialized = true;
        console.log('🚀 Initialisation du client WhatsApp...');
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
    console.log('📥 Requête reçue : /whatsapp/start');
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
    console.log('📥 Requête reçue : /whatsapp/qrcode');
    if (!whatsappScanQR) {
        console.log('⚠️ QR Code non disponible.');
        return res.status(404).json({ error: "QR Code non disponible. Démarrez WhatsApp avec /whatsapp/start" });
    }
    res.json({ qrCode: whatsappScanQR });
    console.log('✅ QR Code renvoyé au client.');
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
    console.log('📥 Requête reçue : /whatsapp/send');
    const { phone, message } = req.body;

    if (!phone || !message) {
        console.log('⚠️ Numéro ou message manquant.');
        return res.status(400).json({ error: "Numéro et message requis." });
    }
    if (!isWhatsAppConnected) {
        console.log('⚠️ WhatsApp non connecté.');
        return res.status(403).json({ error: "WhatsApp n'est pas connecté. Veuillez scanner le QR Code." });
    }

    try {
        // Validation et nettoyage du numéro de téléphone
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length < 8) { // Vérification de la longueur minimale d'un numéro de téléphone
            return res.status(400).json({ error: "Numéro de téléphone invalide." });
        }
        
        const chatId = `${cleanPhone}@c.us`;

        console.log(`ℹ️ Tentative d'envoi du message à ${chatId}...`);
        
        // Nouvelle méthode : vérification si le numéro est enregistré sur WhatsApp
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
            console.log(`❌ Le numéro ${phone} n'est pas un utilisateur WhatsApp valide.`);
            return res.status(404).json({ error: "Ce numéro n'est pas un utilisateur WhatsApp." });
        }
        
        await client.sendMessage(chatId, message);
        console.log(`✅ Message envoyé à ${phone}: "${message}"`);
        res.json({ success: true, message: `Message envoyé à ${phone}` });
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message. Vérifiez le numéro et la connexion." });
    }
};

// Vérifier le statut
exports.getStatus = (req, res) => {
    console.log('📥 Requête reçue : /whatsapp/status');
    res.json({ isConnected: isWhatsAppConnected });
};

// Déconnexion
exports.logoutWhatsApp = async (req, res) => {
    console.log('📥 Requête reçue : /whatsapp/logout');
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
