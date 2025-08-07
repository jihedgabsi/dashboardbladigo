import React, { useState, useEffect } from 'react';
import { Wallet, User, RefreshCw, X, Search, CheckCircle, Phone } from 'lucide-react';

// Interface pour les données du chauffeur reçues de l'API
interface ApiDriver {
  _id: string;
  username: string;
  email: string;
  solde: number;
  phoneNumber?: string; // Ajout du numéro de téléphone (optionnel)
}

// Interface pour les données affichées dans le composant
interface DisplayDriver {
  id: string;
  nom: string;
  email: string;
  phoneNumber: string; // Numéro de téléphone à afficher
  solde: number;
}

const SoldeDriverPage: React.FC = () => {
  const [drivers, setDrivers] = useState<DisplayDriver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DisplayDriver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // États pour le modal de paiement
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  // Transformation des données de l'API pour l'affichage
  const transformApiDriver = (apiDriver: ApiDriver): DisplayDriver => ({
    id: apiDriver._id,
    nom: apiDriver.username,
    email: apiDriver.email,
    phoneNumber: apiDriver.phoneNumber || 'N/A', // Transformation avec une valeur par défaut
    solde: apiDriver.solde || 0,
  });

  // Fonction pour récupérer les chauffeurs depuis l'API
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/alldashboarddrivers`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const apiDrivers: ApiDriver[] = await response.json();
      const transformedDrivers = apiDrivers.map(transformApiDriver);
      setDrivers(transformedDrivers);
      setFilteredDrivers(transformedDrivers);

    } catch (err: any) {
      console.error('Erreur lors de la récupération des soldes:', err);
      setError('Impossible de charger les données des transporteurs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Mise à jour du filtre pour inclure la recherche par numéro de téléphone
  useEffect(() => {
    const results = drivers.filter(driver =>
      driver.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDrivers(results);
  }, [searchTerm, drivers]);

  const openPaymentModal = (driver: DisplayDriver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  // FONCTION UNIQUE POUR GÉRER LE PAIEMENT COMPLET
  const handlePayCommission = async () => {
    if (!selectedDriver || selectedDriver.solde <= 0) return;

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/${selectedDriver.id}/payercommissioncomplette`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Le paiement complet a échoué.');
      }
      
      await fetchDrivers(); // Rafraîchir les données
      closePaymentModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Le reste du composant (affichage de la table, etc.)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-gray-600">Chargement des soldes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 relative" role="alert">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header, barre de recherche, etc. (inchangé) */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Paiements</h1>
          <p className="text-gray-600">Payez les commissions de vos transporteurs.</p>
        </div>
        <button onClick={fetchDrivers} className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-700 transition-colors duration-200 ">
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Rechercher par nom, email, téléphone..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-80 text-gray-700 mb-1.5" 
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission à Payer</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{driver.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.phoneNumber}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${driver.solde > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {driver.solde.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => openPaymentModal(driver)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto space-x-2 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                      disabled={driver.solde <= 0}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Effectuer un Paiement</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDrivers.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun transporteur trouvé.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE PAIEMENT SIMPLIFIÉ */}
      {isModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Payer la commission de {selectedDriver.nom}</h3>
              <button onClick={closePaymentModal} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center bg-gray-100 p-3 rounded-md mb-6">
              <p className="text-sm text-gray-600">Commission totale à payer</p>
              <p className="text-2xl font-bold text-red-600">{selectedDriver.solde.toFixed(2)} €</p>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-gray-700">
                Vous allez régler la totalité de la commission due. Le solde du transporteur sera mis à zéro.
              </p>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handlePayCommission} 
                  disabled={updateLoading} 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                >
                  {updateLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmer le Paiement Complet</span>
                </button>
              </div>
            </div>

            <div className="flex justify-start mt-6 pt-4 border-t">
              <button onClick={closePaymentModal} className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoldeDriverPage;
