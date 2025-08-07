import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, List, BarChart2, RefreshCw, X, Search, User } from 'lucide-react';

// --- INTERFACES ---

interface DriverInfo {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
}

interface HistoriqueItem {
  _id: string;
  id_driver: DriverInfo | null;
  montantPaye: number;
  datePaiement: string;
}

interface DriverOption {
    _id: string;
    username: string;
}

interface Statistiques {
  totalPaye: number;
  nombreTransactions: number;
  paiementMoyen: number;
}

interface ChartData {
  name: string;
  total: number;
}


const HistoriquePaiementsPage: React.FC = () => {
  // --- ETATS ---
  const [historique, setHistorique] = useState<HistoriqueItem[]>([]);
  const [filteredHistorique, setFilteredHistorique] = useState<HistoriqueItem[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState<string>(''); // Filtre général
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driverSearchTerm, setDriverSearchTerm] = useState(''); // Filtre pour la liste des transporteurs
  
  const [selectedDriverTotal, setSelectedDriverTotal] = useState<number | null>(null);
  const [isDriverListVisible, setIsDriverListVisible] = useState(false);
  const driverSearchRef = useRef<HTMLDivElement>(null);

  // --- FONCTIONS DE FETCH ---

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('adminToken');
    try {
      const [historiqueRes, driversRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/historique-paiements`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/alldashboarddrivers`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (!historiqueRes.ok) throw new Error(`Erreur historique: ${historiqueRes.status}`);
      if (!driversRes.ok) throw new Error(`Erreur transporteurs: ${driversRes.status}`);
      
      const historiqueData: HistoriqueItem[] = await historiqueRes.json();
      const driversData: DriverOption[] = await driversRes.json();

      setHistorique(historiqueData);
      setDrivers(driversData);
      
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // --- EFFETS ---

  useEffect(() => {
    fetchData();
  }, []);

  // Recalcul et filtrage lorsque les données ou les filtres changent
  useEffect(() => {
    let baseItems = [...historique];

    // 1. Filtrer par transporteur sélectionné
    if (selectedDriverId) {
      baseItems = baseItems.filter(item => item.id_driver?._id === selectedDriverId);
    }
    
    // Mettre à jour les stats et le graphique en fonction du filtre transporteur
    processDataForDashboard(baseItems);

    // Calculer le total pour le transporteur sélectionné
    const totalForDriver = selectedDriverId ? baseItems.reduce((acc, item) => acc + item.montantPaye, 0) : null;
    setSelectedDriverTotal(totalForDriver);

    // 2. Filtrer par terme de recherche général pour le tableau
    let finalItems = [...baseItems];
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      finalItems = finalItems.filter(item => {
        const driverName = item.id_driver?.username?.toLowerCase() || '';
        const driverEmail = item.id_driver?.email?.toLowerCase() || '';
        const driverPhone = item.id_driver?.phoneNumber?.toLowerCase() || '';
        const amount = item.montantPaye.toString();
        const date = new Date(item.datePaiement).toLocaleDateString('fr-FR');
        return driverName.includes(lowercasedTerm) || driverEmail.includes(lowercasedTerm) || driverPhone.includes(lowercasedTerm) || amount.includes(lowercasedTerm) || date.includes(lowercasedTerm);
      });
    }

    setFilteredHistorique(finalItems);

  }, [searchTerm, selectedDriverId, historique]);

  // Gérer le clic en dehors du composant de recherche de transporteur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (driverSearchRef.current && !driverSearchRef.current.contains(event.target as Node)) {
            setIsDriverListVisible(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- GESTIONNAIRES D'ÉVÉNEMENTS ---

  const handleDriverSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setDriverSearchTerm(newSearchTerm);
    if (selectedDriverId) {
        setSelectedDriverId('');
    }
    setIsDriverListVisible(true);
  };

  const handleDriverSelect = (driver: DriverOption) => {
    setSelectedDriverId(driver._id);
    setDriverSearchTerm(driver.username);
    setIsDriverListVisible(false);
  };

  const clearDriverSelection = () => {
    setSelectedDriverId('');
    setDriverSearchTerm('');
    setIsDriverListVisible(false);
  };
  
  // --- TRAITEMENT DE DONNÉES ---

  const filteredDriverOptions = useMemo(() => {
    if (!driverSearchTerm) return drivers;
    return drivers.filter(driver =>
        driver.username.toLowerCase().includes(driverSearchTerm.toLowerCase())
    );
  }, [driverSearchTerm, drivers]);

  const processDataForDashboard = (data: HistoriqueItem[]) => {
    const totalPaye = data.reduce((acc, item) => acc + item.montantPaye, 0);
    const nombreTransactions = data.length;
    const paiementMoyen = nombreTransactions > 0 ? totalPaye / nombreTransactions : 0;
    setStats({ totalPaye, nombreTransactions, paiementMoyen });

    const monthlyData = data.reduce((acc, item) => {
      const date = new Date(item.datePaiement);
      const monthYear = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear] += item.montantPaye;
      return acc;
    }, {} as Record<string, number>);

    const formattedChartData = Object.entries(monthlyData).map(([name, total]) => ({ name, total })).reverse();
    setChartData(formattedChartData);
  };


  // --- RENDU ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
          <span className="text-xl text-gray-600">Chargement de l'historique...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 relative rounded-md" role="alert">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-600"><X className="w-5 h-5" /></button>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Historique des Paiements</h1>
          <p className="text-gray-600 mt-1">Consultez et analysez tous les paiements effectués.</p>
        </div>
        <button onClick={fetchData} className="mt-4 md:mt-0 bg-gray-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats && <StatCard icon={DollarSign} title="Total Payé (Filtre Actif)" value={`${stats.totalPaye.toFixed(2)} €`} color="green" />}
        {stats && <StatCard icon={List} title="Transactions (Filtre Actif)" value={stats.nombreTransactions.toString()} color="blue" />}
        {selectedDriverTotal !== null && (
             <StatCard icon={User} title="Total Payé (Sélection)" value={`${selectedDriverTotal.toFixed(2)} €`} color="purple" />
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Volume des paiements par mois</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}/>
                <Legend />
                <Bar dataKey="total" fill="#ef4444" name="Total Payé (€)" />
            </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md text-gray-500 mb-1.5">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-700">Détails des transactions</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Nouveau champ de recherche pour les transporteurs */}
                <div className="relative w-full sm:w-52" ref={driverSearchRef}>
                    <input
                        type="text"
                        placeholder="Filtrer par transporteur..."
                        value={driverSearchTerm}
                        onChange={handleDriverSearchChange}
                        onFocus={() => setIsDriverListVisible(true)}
                        className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 py-2 px-3 w-full pr-8"
                    />
                    {driverSearchTerm && (
                        <button onClick={clearDriverSelection} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {isDriverListVisible && filteredDriverOptions.length > 0 && (
                        <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {filteredDriverOptions.map(driver => (
                                <li key={driver._id} onClick={() => handleDriverSelect(driver)} className="p-2 hover:bg-red-50 cursor-pointer text-sm">
                                    {driver.username}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Barre de recherche générale */}
                <div className="relative w-full sm:w-64 text-gray-500 mb-1.5">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Rechercher une transaction..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full" 
                    />
                </div>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Payé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistorique.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id_driver?.username || 'Utilisateur supprimé'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.id_driver?.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.id_driver?.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">+{item.montantPaye.toFixed(2)} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.datePaiement).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredHistorique.length === 0 && !loading && (
            <div className="text-center py-8"><p className="text-gray-500">Aucune transaction trouvée.</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string, color: string }> = ({ icon: Icon, title, value, color }) => {
    const colorClasses: { [key: string]: string } = {
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        orange: 'bg-orange-100 text-orange-700',
        purple: 'bg-purple-100 text-purple-700',
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <div className={`p-3 rounded-full ${colorClasses[color] || 'bg-gray-100 text-gray-700'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

export default HistoriquePaiementsPage;
