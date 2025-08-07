import React, { useState, useEffect } from 'react';
import { PlaneTakeoff, Search, Eye, Edit, Trash2, RefreshCw, X, Save, Plus, AlertCircle } from 'lucide-react';

// Interface pour les données brutes de l'API
interface ApiAirport {
  _id: string;
  name: string;
  transportMode: 'Avion' | 'Bateau'; // Le modèle autorise les deux
  createdAt: string;
  updatedAt: string;
}

// Interface pour les données affichées dans le composant
interface DisplayAirport {
  id: string;
  nom: string;
}

const AirportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [airportsData, setAirportsData] = useState<DisplayAirport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAirport, setEditingAirport] = useState<DisplayAirport | null>(null);
  const [viewingAirport, setViewingAirport] = useState<DisplayAirport | null>(null);
  const [addingAirport, setAddingAirport] = useState<boolean>(false);
  const [newAirport, setNewAirport] = useState<{ nom: string }>({ nom: '' });
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  // Fonction pour transformer les données de l'API en format d'affichage
  const transformApiAirport = (apiAirport: ApiAirport): DisplayAirport => {
    return {
      id: apiAirport._id,
      nom: apiAirport.name,
    };
  };

  // Récupérer les aéroports depuis l'API
  const fetchAirports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      // On filtre directement les emplacements de type 'Avion' via les paramètres de l'URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/airportport/locations?transportMode=Avion`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const result = await response.json();
      // L'API renvoie un tableau de noms, il faut l'adapter
      const apiAirports: ApiAirport[] = result.data || []; 
      const transformedAirports = apiAirports.map(transformApiAirport);

      setAirportsData(transformedAirports);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des aéroports:', err);
      setError('Impossible de charger les aéroports. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un nouvel aéroport
  const addAirport = async () => {
    if (!newAirport.nom) return;
    
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/airportport/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: newAirport.nom,
          transportMode: 'Avion' // Toujours 'Avion' pour cette page
        })
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchAirports();
      setAddingAirport(false);
      setNewAirport({ nom: '' });
    } catch (err: any) {
      console.error("Erreur lors de l'ajout:", err);
      setError("Impossible d'ajouter l'aéroport.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Mettre à jour un aéroport
  const updateAirport = async (airportId: string, updateData: { name: string }) => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/airportport/locations/${airportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchAirports();
      setEditingAirport(null);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      setError("Impossible de mettre à jour l'aéroport.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Supprimer un aéroport
  const deleteAirport = async (airportId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet aéroport ?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/airportport/locations/${airportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchAirports();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError("Impossible de supprimer l'aéroport.");
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  const filteredAirports = airportsData.filter(airport =>
    airport.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveEdit = () => {
    if (!editingAirport) return;
    updateAirport(editingAirport.id, { name: editingAirport.nom });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-gray-600">Chargement des aéroports...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center">
             <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
             <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* En-tête de la page */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Aéroports</h1>
          <p className="text-gray-600">Gérez tous les aéroports de la plateforme.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setAddingAirport(true)} 
            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un aéroport</span>
          </button>
          <button 
            onClick={fetchAirports} 
            className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>
      
      {/* Statistiques simplifiées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow col-span-1">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <PlaneTakeoff className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total aéroports</p>
              <p className="text-lg font-semibold text-gray-900">{airportsData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des aéroports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher un aéroport..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-64" 
              />
            </div>
            <div className="text-sm text-gray-500">{filteredAirports.length} aéroport(s) trouvé(s)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aéroport</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAirports.map((airport) => (
                <tr key={airport.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                         <PlaneTakeoff className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{airport.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button onClick={() => setViewingAirport(airport)} title="Voir" className="text-red-600 hover:text-red-900"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setEditingAirport(airport)} title="Modifier" className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteAirport(airport.id)} title="Supprimer" className="text-gray-600 hover:text-gray-900"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAirports.length === 0 && (
          <div className="text-center py-8 text-gray-500">Aucun aéroport trouvé.</div>
        )}
      </div>

      {/* Modal de visualisation */}
      {viewingAirport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-500 mb-1.5">Détails de l'aéroport</h3>
              <button onClick={() => setViewingAirport(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <PlaneTakeoff className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">{viewingAirport.nom}</h4>
            </div>
             <div className="flex justify-end mt-6">
               <button onClick={() => setViewingAirport(null)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingAirport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4 text-gray-500 mb-1.5">
              <h3 className="text-lg font-semibold">Modifier l'aéroport</h3>
              <button onClick={() => setEditingAirport(null)}><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'aéroport</label>
              <input 
                type="text" 
                value={editingAirport.nom} 
                onChange={(e) => setEditingAirport({...editingAirport, nom: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-400 mb-1.5" 
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setEditingAirport(null)} className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-500 mb-1.5">Annuler</button>
              <button onClick={handleSaveEdit} disabled={updateLoading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50">
                {updateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{updateLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {addingAirport && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 text-gray-500 mb-1.5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ajouter un aéroport</h3>
              <button onClick={() => setAddingAirport(false)}><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'aéroport</label>
              <input 
                type="text" 
                value={newAirport.nom} 
                onChange={(e) => setNewAirport({nom: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Aéroport Tunis-Carthage"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setAddingAirport(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Annuler</button>
              <button onClick={addAirport} disabled={updateLoading || !newAirport.nom} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50">
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

export default AirportsPage;