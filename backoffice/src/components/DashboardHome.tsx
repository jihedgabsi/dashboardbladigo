import React, { useState, useEffect } from 'react';
import { Users, Truck, Package, Map, FileText, RefreshCw, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';
import RecentAlert from './RecentAlert';
import { Stat, Alert } from '../Types/index';

// --- INTERFACES ---

interface DashboardHomeProps {
  onNavigate: (view: string) => void;
}

interface ApiResponse {
  success: boolean;
  data: Stat[];
  summary: {
    totalUsers: number;
    totalDrivers: number;
    totalUsersAndDrivers: number;
    demandesTransport: number;
    trajetsActifs: number;
  };
  message?: string;
}

interface ChartData {
  date: string;
  utilisateurs: number;
  transporteurs: number;
  demandes: number;
  trajets: number;
}

// Interface pour les données de l'historique des paiements
interface HistoriqueItem {
    _id: string;
    montantPaye: number;
    datePaiement: string;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stat[]>([]);
  // Nouvel état pour les stats de paiement
  const [historiqueStats, setHistoriqueStats] = useState<{ totalPaye: number } | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    chart: true,
    alerts: true,
    historique: true, // Ajout du loading pour l'historique
  });
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

  // --- FONCTIONS DE FETCH ---

  const fetchStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await fetch(`${API_BASE_URL}/statistiquedashboard/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` }
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        const statsWithIcons = result.data.map((stat: any) => ({
          ...stat,
          icon: getIconForStat(stat.type),
        }));
        setStats(statsWithIcons);
        if (result.summary) setSummary(result.summary);
      } else {
        throw new Error(result.message || 'Erreur API');
      }
    } catch (error) {
      console.error('Erreur fetchStats:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchChartData = async () => {
    try {
        setLoading(prev => ({ ...prev, chart: true }));
        const response = await fetch(`${API_BASE_URL}/statistiquedashboard/chart-data?period=7`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` }
        });
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const result = await response.json();
        setChartData(result.success ? result.data : generateDefaultChartData());
    } catch (error) {
        console.error('Erreur fetchChartData:', error);
        setChartData(generateDefaultChartData());
    } finally {
        setLoading(prev => ({ ...prev, chart: false }));
    }
  };

  const fetchAlerts = async () => {
     try {
        setLoading(prev => ({ ...prev, alerts: true }));
        const response = await fetch(`${API_BASE_URL}/statistiquedashboard/alerts`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` }
        });
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const result = await response.json();
        setAlerts(result.success ? result.data : []);
    } catch (error) {
        console.error('Erreur fetchAlerts:', error);
        setAlerts([]);
    } finally {
        setLoading(prev => ({ ...prev, alerts: false }));
    }
  };

  // NOUVELLE FONCTION pour récupérer et traiter l'historique des paiements
  const fetchHistoriqueStats = async () => {
    try {
        setLoading(prev => ({...prev, historique: true}));
        const response = await fetch(`${API_BASE_URL}/historique-paiements`, {
             headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` }
        });
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data: HistoriqueItem[] = await response.json();
        
        const totalPaye = data.reduce((acc, item) => acc + item.montantPaye, 0);
        setHistoriqueStats({ totalPaye });

    } catch (error) {
        console.error('Erreur fetchHistoriqueStats:', error);
        // En cas d'erreur, on peut mettre une valeur par défaut
        setHistoriqueStats({ totalPaye: 0 });
    } finally {
        setLoading(prev => ({...prev, historique: false}));
    }
  };

  // --- GESTION DES DONNÉES ---

  const refreshAllData = async () => {
    setLastUpdated(new Date());
    await Promise.all([
      fetchStats(),
      fetchChartData(),
      fetchAlerts(),
      fetchHistoriqueStats() // Appel de la nouvelle fonction
    ]);
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getIconForStat = (type: string) => {
    switch (type) {
      case 'users': return <Users className="w-5 h-5" />;
      case 'drivers': return <Truck className="w-5 h-5" />;
      case 'demandes': return <FileText className="w-5 h-5" />;
      case 'trajets': return <Map className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const generateDefaultChartData = (): ChartData[] => {
    const data: ChartData[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        utilisateurs: Math.floor(Math.random() * 10) + 5,
        transporteurs: Math.floor(Math.random() * 5) + 2,
        demandes: Math.floor(Math.random() * 15) + 10,
        trajets: Math.floor(Math.random() * 8) + 3
      });
    }
    return data;
  };

  const isLoading = loading.stats || loading.chart || loading.alerts || loading.historique;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-gray-600">Bienvenue sur le tableau de bord de Bladi Go Transport</p>
            <p className="text-sm text-gray-500">Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-FR')}</p>
          </div>
          <button onClick={refreshAllData} disabled={isLoading} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <strong>Erreur de connexion:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - 5 cartes maintenant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendValue={stat.trendValue} isLoading={loading.stats} />
          ))}
          {/* Nouvelle carte pour le total des paiements */}
          <StatCard 
            title="Total des Paiements"
            value={historiqueStats ? `${historiqueStats.totalPaye.toFixed(2)} €` : '...'}
            icon={<DollarSign className="w-5 h-5" />}
            trend="up" // Vous pouvez ajuster la tendance si vous avez des données comparatives
            trendValue=""
            isLoading={loading.historique}
          />
        </div>

        {/* Layout à deux colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Évolution des statistiques</h2>
                <span className="text-sm text-gray-500">7 derniers jours</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="utilisateurs" stroke="#3b82f6" strokeWidth={2} name="Utilisateurs" />
                  <Line type="monotone" dataKey="transporteurs" stroke="#10b981" strokeWidth={2} name="Transporteurs" />
                  <Line type="monotone" dataKey="demandes" stroke="#f59e0b" strokeWidth={2} name="Demandes" />
                  <Line type="monotone" dataKey="trajets" stroke="#ef4444" strokeWidth={2} name="Trajets" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alertes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Notifications récentes</h2>
              <button onClick={() => onNavigate('notifications')} className="text-sm text-red-600 hover:text-red-800">Voir tout</button>
            </div>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alerte, index) => (
                  <RecentAlert key={index} title={alerte.title} message={alerte.message} time={alerte.time} type={alerte.type} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune notification</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
