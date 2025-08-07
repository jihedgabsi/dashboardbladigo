const express = require('express');
const path = require('path');
const cors = require('cors');
const baggageRoutes = require('./routes/baggageRoutes');
const demandeTransportRoutes = require('./routes/demandeTransportRoutes');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/db');


const userRoutes = require('./routes/user');
const driverRoutes = require('./routes/driverroute');
const trajectRoutes = require('./routes/trajectRoutes');
const adminRoutes = require('./routes/authadminRoutes');
const villeRoutes = require('./routes/villeRoutes');
const statistiquedashboard = require('./routes/dashboardstat');
const airportport = require('./routes/airportport');
const commissionRoutes = require('./routes/commissionroutes.js');
const historiquePaiementRoutes = require('./routes/historiquePaiementRoutes');





const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//Routes Whatsup
app.use('/api/whatsup', require('./routes/whatsappRoutes'));

// Routes article
app.use('/api/baggage', baggageRoutes);
app.use('/api/demandes-transport', demandeTransportRoutes);

// Routes ville
app.use('/api/ville', villeRoutes);

// Routes statistique
app.use('/api/statistiquedashboard', statistiquedashboard);

app.use('/api/airportport', airportport);

//Routes admin

app.use('/api/authadmin', adminRoutes);

// Routes user

app.use('/api/user', userRoutes);
app.use('/api/driver', driverRoutes);

// Routes trajet
app.use('/api/trajets', trajectRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/historique-paiements', historiquePaiementRoutes);


// Error handling middleware
app.use(errorHandler);

module.exports = app;
