const Commission = require("../models/Commission"); // Assurez-vous que le chemin est correct

/**
 * @desc    Récupérer les paramètres de la commission
 * @route   GET /api/commission
 * @access  Privé/Admin
 */
exports.getCommission = async (req, res) => {
    try {
        // On cherche le premier (et unique) document de commission
        let commission = await Commission.findOne();

        // Si aucune commission n'existe, on en crée une avec les valeurs par défaut
        if (!commission) {
            commission = new Commission(); // Utilise les valeurs par défaut du schéma (valeur: 10)
            await commission.save();
        }

        res.status(200).json(commission);
    } catch (error) {
        res.status(500).json({ message: "Erreur du serveur lors de la récupération de la commission.", error: error.message });
    }
};

/**
 * @desc    Mettre à jour les paramètres de la commission
 * @route   PUT /api/commission
 * @access  Privé/Admin
 */
exports.updateCommission = async (req, res) => {
    try {
        const { valeur, comissionmin } = req.body;

        // Prépare les données à mettre à jour
        const updateData = {
            updatedAt: Date.now() // Met à jour manuellement la date
        };
        if (valeur !== undefined) updateData.valeur = valeur;
        if (comissionmin !== undefined) updateData.comissionmin = comissionmin;

        // findOneAndUpdate avec l'option { upsert: true } est idéal ici :
        // - Il met à jour le premier document qu'il trouve.
        // - S'il ne trouve aucun document, il en crée un (upsert: true).
        // - { new: true } renvoie le document après la mise à jour.
        const updatedCommission = await Commission.findOneAndUpdate(
            {}, // Filtre vide pour correspondre au seul document existant
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            message: "Commission mise à jour avec succès.",
            commission: updatedCommission
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur du serveur lors de la mise à jour de la commission.", error: error.message });
    }
};