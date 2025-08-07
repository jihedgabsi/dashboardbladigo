const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Driver = require('../models/Driver');
const DemandeTransport = require('../models/DemandeTransport');
const Traject = require('../models/Traject');
const Baggage = require('../models/Baggage');
const { protect, adminOnly } = require('../middleware/authadminMiddleware');

/**
 * @route   GET /api/dashboard/chart-data
 * @desc    Get chart data for dashboard statistics over time
 */
router.get('/chart-data',protect, adminOnly, async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 7;
    if (![7, 14, 30].includes(period)) {
      return res.status(400).json({ success: false, message: 'Période invalide. Utilisez 7, 14 ou 30.' });
    }

    const chartData = [];
    const today = new Date();
    
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(23, 59, 59, 999);

      const [usersCount, driversCount, demandsCount, tripsCount] = await Promise.all([
        User.countDocuments({ createdAt: { $lte: date } }),
        Driver.countDocuments({ createdAt: { $lte: date } }),
        DemandeTransport.countDocuments({ createdAt: { $lte: date } }),
        Traject.countDocuments({ createdAt: { $lte: date } })
      ]);

      chartData.push({
        date: date.toISOString(),
        users_count: usersCount,
        drivers_count: driversCount,
        demands_count: demandsCount,
        trips_count: tripsCount,
        utilisateurs: usersCount,
        transporteurs: driversCount,
        demandes: demandsCount,
        trajets: tripsCount
      });
    }

    res.json({ success: true, data: chartData, period });
  } catch (error) {
    console.error('Erreur chart-data:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 */
router.get('/stats',protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalDrivers, demandesTransport, trajetsActifs] = await Promise.all([
      User.countDocuments(),
      Driver.countDocuments(),
      DemandeTransport.countDocuments(),
      Traject.countDocuments({ dateTraject: { $gte: new Date() } })
    ]);

    // Calcul des tendances (mois précédent)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [lastMonthUsers, lastMonthDrivers, lastMonthDemandes, lastMonthTrajets] = await Promise.all([
      User.countDocuments({ createdAt: { $lt: lastMonth } }),
      Driver.countDocuments({ createdAt: { $lt: lastMonth } }),
      DemandeTransport.countDocuments({ createdAt: { $lt: lastMonth } }),
      Traject.countDocuments({ createdAt: { $lt: lastMonth } })
    ]);

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = [
      {
        title: "Total Utilisateurs",
        value: totalUsers.toLocaleString(),
        trend: calculateTrend(totalUsers, lastMonthUsers) >= 0 ? "up" : "down",
        trendValue: `${Math.abs(calculateTrend(totalUsers, lastMonthUsers))}%`,
        type: "users"
      },
      {
        title: "Total Transporteurs",
        value: totalDrivers.toLocaleString(),
        trend: calculateTrend(totalDrivers, lastMonthDrivers) >= 0 ? "up" : "down",
        trendValue: `${Math.abs(calculateTrend(totalDrivers, lastMonthDrivers))}%`,
        type: "drivers"
      },
      {
        title: "Demandes de Transport",
        value: demandesTransport.toString(),
        trend: calculateTrend(demandesTransport, lastMonthDemandes) >= 0 ? "up" : "down",
        trendValue: `${Math.abs(calculateTrend(demandesTransport, lastMonthDemandes))}%`,
        type: "demandes"
      },
      {
        title: "Trajets Actifs",
        value: trajetsActifs.toString(),
        trend: calculateTrend(trajetsActifs, lastMonthTrajets) >= 0 ? "up" : "down",
        trendValue: `${Math.abs(calculateTrend(trajetsActifs, lastMonthTrajets))}%`,
        type: "trajets"
      }
    ];

    res.json({
      success: true,
      data: stats,
      summary: { totalUsers, totalDrivers, totalUsersAndDrivers: totalUsers + totalDrivers, demandesTransport, trajetsActifs }
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/dashboard/recent-demands
 * @desc    Get recent transport demands
 */
router.get('/recent-demands',protect, adminOnly, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const recentDemands = await DemandeTransport.find()
      .populate('id_user', 'username email')
      .populate('id_traject', 'portDepart portDarriver dateTraject')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const statusMapping = {
      'pending': 'en_attente',
      'accepted': 'confirme',
      'in_progress': 'en_cours',
      'completed': 'termine',
      'cancelled': 'annule',
      'rejected': 'annule'
    };

    const formattedDemands = recentDemands.map(demand => ({
      id: demand._id,
      client: demand.id_user?.username || 'Utilisateur inconnu',
      depart: demand.pointRamasage || demand.id_traject?.portDepart || 'Non défini',
      destination: demand.pointLivrison || demand.id_traject?.portDarriver || 'Non défini',
      date: demand.createdAt.toLocaleDateString('fr-FR'),
      statut: statusMapping[demand.statutsDemande] || demand.statutsDemande,
      prixProposer: demand.prixProposer,
      poisColieTotal: demand.poisColieTotal
    }));

    res.json({ success: true, data: formattedDemands });
  } catch (error) {
    console.error('Erreur recent-demands:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/dashboard/alerts
 * @desc    Get recent alerts/notifications
 */
router.get('/alerts', protect, adminOnly, async (req, res) => {
  try {
    const alerts = [];
    
    const formatTimeAgo = (date) => {
      const now = new Date();
      const timeDiff = now.getTime() - new Date(date).getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const weeksAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
      const monthsAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
      
      if (monthsAgo > 0) return `Il y a ${monthsAgo} mois`;
      if (weeksAgo > 0) return `Il y a ${weeksAgo} semaine${weeksAgo > 1 ? 's' : ''}`;
      if (daysAgo > 0) return `Il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`;
      if (hoursAgo > 0) return `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`;
      if (minutesAgo > 0) return `Il y a ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''}`;
      return "À l'instant";
    };

    // Nouveaux transporteurs non vérifiés
    const unverifiedDrivers = await Driver.find({ isVerified: false }).sort({ createdAt: -1 }).limit(3);
    unverifiedDrivers.forEach(driver => {
      alerts.push({
        title: "Nouveau transporteur inscrit",
        message: `${driver.username} s'est inscrit et attend validation.`,
        time: formatTimeAgo(driver.createdAt),
        type: "info",
        createdAt: driver.createdAt
      });
    });

    // Demandes urgentes (24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const urgentDemands = await DemandeTransport.find({
      statutsDemande: 'pending',
      createdAt: { $gte: yesterday }
    }).populate('id_user', 'username').sort({ createdAt: -1 }).limit(2);

    urgentDemands.forEach(demand => {
      alerts.push({
        title: "Demande urgente",
        message: `Demande de ${demand.id_user?.username || 'Utilisateur'} de ${demand.pointRamasage} à ${demand.pointLivrison}.`,
        time: formatTimeAgo(demand.createdAt),
        type: "warning",
        createdAt: demand.createdAt
      });
    });

    // Nouveaux trajets (3 jours)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const recentTrajects = await Traject.find({
      createdAt: { $gte: threeDaysAgo }
    }).populate('idChauffeur', 'username').sort({ createdAt: -1 }).limit(2);

    recentTrajects.forEach(traject => {
      alerts.push({
        title: "Nouveau trajet",
        message: `${traject.idChauffeur?.username || 'Un transporteur'} a publié ${traject.portDepart} → ${traject.portDarriver}.`,
        time: formatTimeAgo(traject.createdAt),
        type: "info",
        createdAt: traject.createdAt
      });
    });

    // Exemple par défaut si vide
    if (alerts.length === 0) {
      const now = new Date();
      alerts.push({
        title: "Système actif",
        message: "Tous les services fonctionnent normalement.",
        time: "Il y a 5 minutes",
        type: "info",
        createdAt: new Date(now.getTime() - 5 * 60 * 1000) // Il y a 5 minutes réellement
      });
    }

    alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: alerts.slice(0, 5), total: alerts.length });

  } catch (error) {
    console.error('Erreur alerts:', error);
    const defaultAlerts = [{
      title: "Système actif",
      message: "Tous les services fonctionnent normalement.",
      time: "Il y a 5 minutes",
      type: "info"
    }];
    res.status(500).json({ success: false, message: 'Erreur serveur', data: defaultAlerts });
  }
});

/**
 * @route   GET /api/dashboard/demand/:id
 * @desc    Get specific transport demand details
 */
router.get('/demand/:id', protect, adminOnly, async (req, res) => {
  try {
    const demand = await DemandeTransport.findById(req.params.id)
      .populate('id_user', 'username email phoneNumber')
      .populate('id_driver', 'username email phoneNumber')
      .populate('id_traject')
      .populate('id_bagages');

    if (!demand) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée' });
    }

    res.json({ success: true, data: demand });
  } catch (error) {
    console.error('Erreur demand details:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get complete dashboard overview
 */
router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const [stats, demands, alerts] = await Promise.all([
      getStatsData(),
      getRecentDemandsData(5),
      getAlertsData()
    ]);

    res.json({
      success: true,
      data: { stats, recentDemands: demands, alerts }
    });
  } catch (error) {
    console.error('Erreur overview:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Fonctions helper
async function getStatsData() {
  const [totalUsers, totalDrivers, demandesTransport, trajetsActifs] = await Promise.all([
    User.countDocuments(),
    Driver.countDocuments(),
    DemandeTransport.countDocuments(),
    Traject.countDocuments({ dateTraject: { $gte: new Date() } })
  ]);

  return [
    { title: "Total Utilisateurs", value: (totalUsers + totalDrivers).toLocaleString(), trend: "up", trendValue: "12%" },
    { title: "Demandes de Transport", value: demandesTransport.toString(), trend: "up", trendValue: "8%" },
    { title: "Trajets Actifs", value: trajetsActifs.toString(), trend: "up", trendValue: "5%" }
  ];
}

async function getRecentDemandsData(limit = 5) {
  const recentDemands = await DemandeTransport.find()
    .populate('id_user', 'username')
    .populate('id_traject', 'portDepart portDarriver')
    .sort({ createdAt: -1 })
    .limit(limit);

  return recentDemands.map(demand => ({
    id: demand._id,
    client: demand.id_user?.username || 'Utilisateur inconnu',
    depart: demand.pointRamasage || demand.id_traject?.portDepart || 'Non défini',
    destination: demand.pointLivrison || demand.id_traject?.portDarriver || 'Non défini',
    date: demand.createdAt.toLocaleDateString('fr-FR'),
    statut: demand.statutsDemande === 'pending' ? 'en_attente' : demand.statutsDemande
  }));
}

async function getAlertsData() {
  const unverifiedDrivers = await Driver.find({ isVerified: false }).sort({ createdAt: -1 }).limit(3);
  
  const formatTimeAgo = (date) => {
    const now = new Date();
    const timeDiff = now.getTime() - new Date(date).getTime();
    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));
    
    if (daysAgo > 0) return `Il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`;
    if (hoursAgo > 0) return `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`;
    if (minutesAgo > 0) return `Il y a ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''}`;
    return "À l'instant";
  };
  
  return unverifiedDrivers.map(driver => ({
    title: "Nouveau transporteur",
    message: `${driver.username} attend validation.`,
    time: formatTimeAgo(driver.createdAt),
    type: "info"
  })).slice(0, 5);
}

module.exports = router;