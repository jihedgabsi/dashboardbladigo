import React, { useState, useEffect } from 'react';
import { Ship, Search, Eye, Edit, Trash2, RefreshCw, X, Save, Plus, AlertCircle } from 'lucide-react';

// Interface pour les données brutes de l'API
interface ApiLocation {
  _id: string;
  name: string;
  transportMode: 'Avion' | 'Bateau';
}

// Interface pour les données affichées dans le composant
interface DisplayPort {
  id: string;
  nom: string;
}

const PortsPage: React.FC = () => {
  const [portsData, setPortsData] = useState<DisplayPort[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les modales
  const [editingPort, setEditingPort] = useState<DisplayPort | null>(null);
  const [viewingPort, setViewingPort] = useState<DisplayPort | null>(null);
  const [addingPort, setAddingPort] = useState<boolean>(false);
  
  const [newPort, setNewPort] = useState<{ nom: string }>({ nom: '' });
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  // URL de base de votre API
  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/airportport/locations`;

  // Transforme les données de l'API pour l'affichage
  const transformApiLocation = (apiLocation: ApiLocation): DisplayPort => ({
    id: apiLocation._id,
    nom: apiLocation.name,
  });

  // --- FONCTIONS CRUD ---

  // 1. READ: Récupérer les ports
  const fetchPorts = async () => {
    setLoading(true);
    setError(null);
    try {
        const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}?transportMode=Bateau`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) throw new Error(`Erreur réseau: ${response.statusText}`);
      const result = await response.json();
      const apiPorts: ApiLocation[] = result.data || [];
      setPortsData(apiPorts.map(transformApiLocation));
    } catch (err: any) {
      setError('Impossible de charger les ports.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. CREATE: Ajouter un nouveau port
  const addPort = async () => {
    if (!newPort.nom.trim()) return;
    setUpdateLoading(true);
    try {
        const token = localStorage.getItem('adminToken');
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
         headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: newPort.nom, transportMode: 'Bateau' }),
      });
      if (!response.ok) throw new Error("L'ajout a échoué.");
      setNewPort({ nom: '' });
      setAddingPort(false);
      await fetchPorts(); // Recharger les données
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // 3. UPDATE: Mettre à jour un port existant
  const updatePort = async () => {
    if (!editingPort || !editingPort.nom.trim()) return;
    setUpdateLoading(true);
    try {
        const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/${editingPort.id}`, {
        method: 'PUT',
         headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: editingPort.nom }),
      });
      if (!response.ok) throw new Error('La mise à jour a échoué.');
      setEditingPort(null);
      await fetchPorts(); // Recharger les données
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // 4. DELETE: Supprimer un port
  const deletePort = async (portId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce port ?')) return;
    try {
        const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/${portId}`, { method: 'DELETE', 
        
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }); 
      if (!response.ok) throw new Error('La suppression a échoué.');
      await fetchPorts(); // Recharger les données
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    fetchPorts();
  }, []);

  // Filtrer les données pour la recherche
  const filteredPorts = portsData.filter(port =>
    port.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* --- AFFICHEUR D'ERREUR --- */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold mr-2">Erreur:</strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <X className="h-6 w-6 cursor-pointer" />
          </span>
        </div>
      )}

      {/* --- EN-TÊTE DE LA PAGE --- */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Ports</h1>
          <p className="text-gray-500">Gérez tous les ports maritimes de la plateforme.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setAddingPort(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Ajouter un port</span>
          </button>
        </div>
      </div>

      {/* --- TABLEAU DE BORD --- */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="px-2 py-4 border-b flex items-center justify-between text-gray-500 mb-1.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Rechercher un port..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-80" />
          </div>
          <div className="text-sm text-gray-600">{filteredPorts.length} port(s) trouvé(s)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Port</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPorts.length > 0 ? filteredPorts.map((port) => (
                <tr key={port.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                        <Ship className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-medium text-gray-900">{port.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-4">
                      <button onClick={() => setViewingPort(port)} title="Voir"><Eye className="w-5 h-5 text-gray-500 hover:text-gray-800" /></button>
                      <button onClick={() => setEditingPort(port)} title="Modifier"><Edit className="w-5 h-5 text-blue-500 hover:text-blue-800" /></button>
                      <button onClick={() => deletePort(port.id)} title="Supprimer"><Trash2 className="w-5 h-5 text-red-500 hover:text-red-800" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">Aucun port trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALE D'AJOUT --- */}
      {addingPort && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-gray-500 mb-1.5">
            <h3 className="text-xl font-semibold mb-4">Ajouter un nouveau port</h3>
            <input type="text" placeholder="Nom du port" value={newPort.nom} onChange={(e) => setNewPort({ nom: e.target.value })} className="w-full px-3 py-2 border rounded-lg mb-4" />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setAddingPort(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Annuler</button>
              <button onClick={addPort} disabled={updateLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300">
                {updateLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE DE MODIFICATION --- */}
      {editingPort && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-500 mb-1.5">Modifier le port</h3>
            <input type="text" value={editingPort.nom} onChange={(e) => setEditingPort({ ...editingPort, nom: e.target.value })} className="w-full px-3 py-2 border rounded-lg mb-4 text-gray-500 mb-1.5" />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setEditingPort(null)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Annuler</button>
              <button onClick={updatePort} disabled={updateLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                {updateLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE DE VISUALISATION --- */}
      {viewingPort && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Ship className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{viewingPort.nom}</h3>
            <button onClick={() => setViewingPort(null)} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortsPage;