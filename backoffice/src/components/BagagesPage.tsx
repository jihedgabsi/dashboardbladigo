import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, MapPin, Package, Calendar, Image as ImageIcon } from 'lucide-react';

interface BagageAPI {
  _id: string;
  description: string;
  imageUrls: string[];
  createdAt: string;
  __v: number;
}

interface BagagesPageProps {
  onNavigate: (view: string) => void;
}

const BagagesPage: React.FC<BagagesPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [bagages, setBagages] = useState<BagageAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Composant SVG pour image placeholder
  const ImagePlaceholder = () => (
    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
      <svg 
        className="w-4 h-4 text-gray-400"
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );

  // Charger les bagages depuis l'API
  useEffect(() => {
    fetchBagages();
  }, []);

  const fetchBagages = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/baggage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBagages(result.data);
      } else {
        setError('Erreur lors du chargement des bagages');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les bagages
  const filteredBagages = bagages.filter(bagage => {
    const matchesSearch = bagage._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bagage.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleBagageAction = (action: string, bagage: BagageAPI) => {
    switch(action) {
     
      case 'delete':
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bagage ?')) {
          deleteBagage(bagage._id);
        }
        break;
      default:
        break;
    }
  };

  const deleteBagage = async (id: string) => {
    try {

        const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/baggage/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        // Recharger les bagages
        fetchBagages();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur de connexion');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Statistiques rapides
  const stats = {
    total: bagages.length,
    avecImages: bagages.filter(b => b.imageUrls && b.imageUrls.length > 0).length,
    sansImages: bagages.filter(b => !b.imageUrls || b.imageUrls.length === 0).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchBagages}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des bagages</h1>
          <p className="text-gray-600">Gérez tous les bagages enregistrés</p>
        </div>
        
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-md">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total bagages</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avec images</p>
              <p className="text-lg font-semibold text-gray-900">{stats.avecImages}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sans images</p>
              <p className="text-lg font-semibold text-gray-900">{stats.sansImages}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Rechercher par ID ou description..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-64"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredBagages.length} bagage(s) trouvé(s)
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBagages.map((bagage) => (
                <tr key={bagage._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {bagage._id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{bagage.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {bagage.imageUrls && bagage.imageUrls.length > 0 ? (
                        <>
                          <div className="flex -space-x-2">
                            {bagage.imageUrls.slice(0, 3).map((url, index) => {
                              const imageKey = `${bagage._id}-${index}`;
                              const hasError = imageErrors[imageKey];
                              
                              return (
                                <div key={index} className="relative">
                                  {!hasError ? (
                                    <img
                                      src={url}
                                      alt={`Image ${index + 1}`}
                                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                      onError={() => {
                                        setImageErrors(prev => ({ ...prev, [imageKey]: true }));
                                      }}
                                    />
                                  ) : (
                                    <ImagePlaceholder />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-sm text-gray-500">
                            {bagage.imageUrls.length} image(s)
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Aucune image</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(bagage.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      
                      <button 
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        onClick={() => handleBagageAction('delete', bagage)}
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBagages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun bagage trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BagagesPage;