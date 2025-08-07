import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, Eye, Edit, Trash2, RefreshCw, X, Save, Plus } from 'lucide-react';

interface ApiCity {
  _id: string;
  name: string;
  payer: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface DisplayCity {
  id: string;
  nom: string;
  pays: string;
}

interface CitiesPageProps {
  onNavigate: (view: string) => void;
}

const CitiesPage: React.FC<CitiesPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [citiesData, setCitiesData] = useState<DisplayCity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCity, setEditingCity] = useState<DisplayCity | null>(null);
  const [viewingCity, setViewingCity] = useState<DisplayCity | null>(null);
  const [addingCity, setAddingCity] = useState<boolean>(false);
  const [newCity, setNewCity] = useState<{ nom: string; pays: string }>({ nom: '', pays: '' });
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  // Liste des pays disponibles
  const availableCountries = [
    'France',
    'Tunisie',
    'Algérie',
    'Maroc',
    'Espagne',
    'Italie',
    'Allemagne',
    'Belgique',
    'Suisse',
    'Canada',
    'États-Unis'
  ];

  const transformApiCity = (apiCity: ApiCity): DisplayCity => {
    return {
      id: apiCity._id,
      nom: apiCity.name,
      pays: apiCity.payer
    };
  };

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ville`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const result = await response.json();
      const apiCities: ApiCity[] = result.data || [];
      const transformedCities = apiCities.map(transformApiCity);
      setCitiesData(transformedCities);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des villes:', err);
      setError('Impossible de charger les villes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const addCity = async () => {
    if (!newCity.nom || !newCity.pays) return;
    
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ville`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: newCity.nom,
          payer: newCity.pays
        })
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchCities();
      setAddingCity(false);
      setNewCity({ nom: '', pays: '' });
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout:', err);
      setError('Impossible d\'ajouter la ville.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const updateCity = async (cityId: string, updateData: any) => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ville/${cityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchCities();
      setEditingCity(null);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      setError('Impossible de mettre à jour la ville.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteCity = async (cityId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette ville ?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ville/${cityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchCities();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer la ville.');
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const uniqueCountries = [...new Set(citiesData.map(city => city.pays))];

  const filteredCities = citiesData.filter(city => {
    const matchesSearch = city.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         city.pays.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || city.pays === filterCountry;
    return matchesSearch && matchesCountry;
  });

  const handleCityAction = (action: string, city: DisplayCity) => {
    switch(action) {
      case 'view':
        setViewingCity(city);
        break;
      case 'edit':
        setEditingCity(city);
        break;
      case 'delete':
        deleteCity(city.id);
        break;
    }
  };

  const handleSaveEdit = () => {
    if (!editingCity) return;
    const updateData = {
      name: editingCity.nom,
      payer: editingCity.pays
    };
    updateCity(editingCity.id, updateData);
  };

  const getCountryColor = (pays: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ];
    const index = pays.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const stats = {
    total: citiesData.length,
    countries: uniqueCountries.length,
    mostCommonCountry: uniqueCountries.length > 0 ? 
      uniqueCountries.reduce((a, b) => 
        citiesData.filter(city => city.pays === a).length > 
        citiesData.filter(city => city.pays === b).length ? a : b
      ) : 'N/A'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-gray-600">Chargement des villes...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Erreur</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center text-gray-400 mb-1.5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des villes</h1>
          <p className="text-gray-600">Gérez toutes les villes de la plateforme</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setAddingCity(true)} 
            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-red-700 transition-colors duration-200 text-gray-400 mb-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une ville</span>
          </button>
          <button 
            onClick={fetchCities} 
            className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-700 transition-colors duration-200 text-gray-400 mb-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total villes</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <Filter className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pays différents</p>
              <p className="text-lg font-semibold text-gray-900">{stats.countries}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pays principal</p>
              <p className="text-lg font-semibold text-gray-900">{stats.mostCommonCountry}</p>
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
                  placeholder="Rechercher une ville..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-64 text-gray-400 mb-1.5" 
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={filterCountry} 
                  onChange={(e) => setFilterCountry(e.target.value)} 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-400 mb-1.5"
                >
                  <option value="all">Tous les pays</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">{filteredCities.length} ville(s) trouvée(s)</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCities.map((city) => (
                <tr key={city.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{city.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getCountryColor(city.pays)}`}>
                      {city.pays}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-red-600 hover:text-red-900 transition-colors duration-200" 
                        onClick={() => handleCityAction('view', city)} 
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200" 
                        onClick={() => handleCityAction('edit', city)} 
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200" 
                        onClick={() => handleCityAction('delete', city)} 
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCities.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune ville trouvée.</p>
          </div>
        )}
      </div>

      {/* Modal de visualisation */}
      {viewingCity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Détails de la ville</h3>
              <button onClick={() => setViewingCity(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div className="text-center mb-4">
                <h4 className="text-xl font-semibold text-gray-900">{viewingCity.nom}</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Pays</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCountryColor(viewingCity.pays)}`}>
                    {viewingCity.pays}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setViewingCity(null)} 
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingCity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifier la ville</h3>
              <button onClick={() => setEditingCity(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la ville</label>
                <input 
                  type="text" 
                  value={editingCity.nom} 
                  onChange={(e) => setEditingCity({...editingCity, nom: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <select 
                  value={editingCity.pays} 
                  onChange={(e) => setEditingCity({...editingCity, pays: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Sélectionnez un pays</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setEditingCity(null)} 
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={updateLoading} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50"
              >
                {updateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{updateLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {addingCity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-400 mb-1.5">
          <div className="bg-white p-6 rounded-lg w-96 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ajouter une ville</h3>
              <button onClick={() => setAddingCity(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la ville</label>
                <input 
                  type="text" 
                  value={newCity.nom} 
                  onChange={(e) => setNewCity({...newCity, nom: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-400 mb-1.5" 
                  placeholder="Entrez le nom de la ville"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <select 
                  value={newCity.pays} 
                  onChange={(e) => setNewCity({...newCity, pays: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-400 mb-1.5"
                >
                  <option value="">Sélectionnez un pays</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setAddingCity(false)} 
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={addCity} 
                disabled={updateLoading || !newCity.nom || !newCity.pays} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50"
              >
                {updateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{updateLoading ? 'Ajout...' : 'Ajouter'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitiesPage;