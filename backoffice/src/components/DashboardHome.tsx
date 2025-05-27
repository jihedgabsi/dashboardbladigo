import React, { useState, useEffect } from 'react';
import { Users, Truck, Package, Map, FileText, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';
import RecentAlert from './RecentAlert';
import { Stat, Alert } from '../Types/index';

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

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    chart: true,
    alerts: true
  });
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const API_BASE_URL = 'http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/statistiquedashboard';

  // Fonction pour récupérer les statistiques
  const fetchStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(null);

      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        // Ajouter les icônes aux statistiques reçues de l'API
        const statsWithIcons = result.data.map((stat: any) => {
          let icon;
          switch (stat.type) {
            case 'users':
              icon = <Users className="w-5 h-5" />;
              break;
            case 'drivers':
              icon = <Truck className="w-5 h-5" />;
              break;
            case 'bagages':
              icon = <Package className="w-5 h-5" />;
              break;
            case 'demandes':
              icon = <FileText className="w-5 h-5" />;
              break;
            case 'trajets':
              icon = <Map className="w-5 h-5" />;
              break;
            default:
              icon = <Users className="w-5 h-5" />;
          }
          
          return {
            ...stat,
            icon
          };
        });
        
        setStats(statsWithIcons);
        if (result.summary) {
          setSummary(result.summary);
        }
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des statistiques');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      
      // Données par défaut en cas d'erreur
      setStats([
        { 
          title: "Total Utilisateurs", 
          value: "--", 
          icon: <Users className="w-5 h-5" />, 
          trend: "up", 
          trendValue: "--%" 
        },
        { 
          title: "Total Transporteurs", 
          value: "--", 
          icon: <Truck className="w-5 h-5" />, 
          trend: "up", 
          trendValue: "--%" 
        },
        { 
          title: "Demandes de Transport", 
          value: "--", 
          icon: <FileText className="w-5 h-5" />, 
          trend: "down", 
          trendValue: "--%" 
        },
        { 
          title: "Trajets Actifs", 
          value: "--", 
          icon: <Map className="w-5 h-5" />, 
          trend: "up", 
          trendValue: "--%" 
        },
      ]);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fonction pour récupérer les données du graphique
  const fetchChartData = async () => {
    try {
      setLoading(prev => ({ ...prev, chart: true }));

      const response = await fetch(`${API_BASE_URL}/chart-data?period=7`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setChartData(result.data);
      } else {
        // Données par défaut pour démonstration
        const defaultData = generateDefaultChartData();
        setChartData(defaultData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du graphique:', error);
      // Générer des données par défaut en cas d'erreur
      const defaultData = generateDefaultChartData();
      setChartData(defaultData);
    } finally {
      setLoading(prev => ({ ...prev, chart: false }));
    }
  };

  // Fonction pour générer des données par défaut
  const generateDefaultChartData = (): ChartData[] => {
    const data: ChartData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        utilisateurs: Math.floor(Math.random() * 50) + 100 + i * 5,
        transporteurs: Math.floor(Math.random() * 20) + 30 + i * 2,
        demandes: Math.floor(Math.random() * 30) + 40 + i * 3,
        trajets: Math.floor(Math.random() * 25) + 35 + i * 2
      });
    }
    
    return data;
  };

  // Fonction pour récupérer les alertes
  const fetchAlerts = async () => {
    try {
      setLoading(prev => ({ ...prev, alerts: true }));

      const response = await fetch(`${API_BASE_URL}/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAlerts(result.data);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      setAlerts([]);
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }));
    }
  };

  // Fonction pour rafraîchir toutes les données
  const refreshAllData = async () => {
    setLastUpdated(new Date());
    await Promise.all([
      fetchStats(),
      fetchChartData(),
      fetchAlerts()
    ]);
  };

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    refreshAllData();
    
    // Rafraîchissement automatique toutes les 5 minutes
    const interval = setInterval(refreshAllData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const isLoading = loading.stats || loading.chart || loading.alerts;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec bouton de rafraîchissement */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-gray-600">
              Bienvenue sur le tableau de bord de Bladi Go Transport
            </p>
            <p className="text-sm text-gray-500">
              Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          
          <button
            onClick={refreshAllData}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
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
                <p className="text-sm mt-1">
                  Vérifiez que l'API est accessible à l'adresse: {API_BASE_URL}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - 4 cartes maintenant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="relative">
              {loading.stats && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
              <StatCard 
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                trendValue={stat.trendValue}
              />
            </div>
          ))}
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique des statistiques */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Évolution des statistiques</h2>
                </div>
                <div className="flex items-center gap-3">
                  {loading.chart && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  <span className="text-sm text-gray-500">7 derniers jours</span>
                </div>
              </div>
              
              <div className="p-4">
                {chartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="utilisateurs" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                          name="Utilisateurs"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="transporteurs" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                          name="Transporteurs"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="demandes" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                          name="Demandes"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="trajets" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                          name="Trajets"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune donnée disponible</p>
                    <p className="text-sm mt-1">Les données du graphique seront affichées ici</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Notifications récentes</h2>
                <div className="flex items-center gap-3">
                  {loading.alerts && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  <button 
                    onClick={() => onNavigate('notifications')}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    Voir tout
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alerte, index) => (
                      <RecentAlert 
                        key={index}
                        title={alerte.title}
                        message={alerte.message}
                        time={alerte.time}
                        type={alerte.type}
                      />
                    ))}
                  </div>
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
    </div>
  );
};

export default DashboardHome;