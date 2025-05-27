import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, MapPin, Users, Clock, Truck, Ship, Plane, Trash2, X } from 'lucide-react';

interface Chauffeur {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
}

interface TrajetAPI {
  _id: string;
  idChauffeur: Chauffeur;
  prixParKilo: number;
  prixParPiece: number;
  modetransport: string;
  dateTraject: string;
  portDepart: string;
  portDarriver: string;
  pointRamasage: string[];
  pointLivraison: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TrajetsPageProps {
  onNavigate?: (view: string) => void;
}

const TrajetsPage: React.FC<TrajetsPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTransport, setFilterTransport] = useState<string>('all');
  const [trajetsData, setTrajetsData] = useState<TrajetAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // États pour les modals
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedTrajet, setSelectedTrajet] = useState<TrajetAPI | null>(null);
  const [editForm, setEditForm] = useState<Partial<TrajetAPI>>({});

  // Fonction pour récupérer les données de l'API
  const fetchTrajets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/trajets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des trajets');
      }
      const data = await response.json();
      setTrajetsData(data);
      setError('');
    } catch (err) {
      setError('Impossible de charger les trajets');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour un trajet
  const updateTrajet = async (id: string, data: Partial<TrajetAPI>) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/trajets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      await fetchTrajets(); // Recharger les données
      setShowEditModal(false);
      setSelectedTrajet(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Erreur lors de la mise à jour du trajet');
    }
  };

  // Fonction pour supprimer un trajet
  const deleteTrajet = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/trajets/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      await fetchTrajets(); // Recharger les données
      setShowDeleteModal(false);
      setSelectedTrajet(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression du trajet');
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, []);

  // Filtrer les trajets
  const filteredTrajets = trajetsData.filter(trajet => {
    const matchesSearch = trajet._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trajet.idChauffeur?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trajet.portDepart.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trajet.portDarriver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trajet.pointRamasage.some(point => point.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         trajet.pointLivraison.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTransport = filterTransport === 'all' || trajet.modetransport === filterTransport;
    
    return matchesSearch && matchesTransport;
  });

  const handleTrajetAction = (action: string, trajet: TrajetAPI) => {
    switch(action) {
      case 'view':
        console.log('Voir trajet:', trajet);
        break;
      case 'edit':
        setSelectedTrajet(trajet);
        setEditForm({
          prixParKilo: trajet.prixParKilo,
          prixParPiece: trajet.prixParPiece,
          modetransport: trajet.modetransport,
          dateTraject: trajet.dateTraject.split('T')[0], // Format date pour input
          portDepart: trajet.portDepart,
          portDarriver: trajet.portDarriver,
          pointRamasage: trajet.pointRamasage,
          pointLivraison: trajet.pointLivraison,
        });
        setShowEditModal(true);
        break;
      case 'delete':
        setSelectedTrajet(trajet);
        setShowDeleteModal(true);
        break;
      default:
        break;
    }
  };

  const handleEditSubmit = () => {
    if (selectedTrajet) {
      updateTrajet(selectedTrajet._id, editForm);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedTrajet) {
      deleteTrajet(selectedTrajet._id);
    }
  };

  const getTransportIcon = (transport: string) => {
    switch(transport.toLowerCase()) {
      case 'avion':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'bateau':
        return <Ship className="w-4 h-4 text-green-600" />;
      case 'camion':
      case 'voiture':
        return <Truck className="w-4 h-4 text-orange-600" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransportColor = (transport: string) => {
    switch(transport.toLowerCase()) {
      case 'avion':
        return 'bg-blue-100 text-blue-800';
      case 'bateau':
        return 'bg-green-100 text-green-800';
      case 'camion':
      case 'voiture':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Statistiques rapides
  const stats = {
    total: trajetsData.length,
    avion: trajetsData.filter(t => t.modetransport === 'Avion').length,
    bateau: trajetsData.filter(t => t.modetransport === 'Bateau').length,
    terrestre: trajetsData.filter(t => !['Avion', 'Bateau'].includes(t.modetransport)).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchTrajets}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des trajets</h1>
          <p className="text-gray-600">Gérez tous les trajets de transport</p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-md">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avion</p>
              <p className="text-lg font-semibold text-gray-900">{stats.avion}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <Ship className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Bateau</p>
              <p className="text-lg font-semibold text-gray-900">{stats.bateau}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-md">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Terrestre</p>
              <p className="text-lg font-semibold text-gray-900">{stats.terrestre}</p>
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
                  placeholder="Rechercher un trajet..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={filterTransport}
                onChange={(e) => setFilterTransport(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Tous les transports</option>
                <option value="Avion">Avion</option>
                <option value="Bateau">Bateau</option>
                <option value="Camion">Camion</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredTrajets.length} trajet(s) trouvé(s)
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Trajet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chauffeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Itinéraire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points de ramassage/livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrajets.map((trajet) => (
                <tr key={trajet._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTransportIcon(trajet.modetransport)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{trajet._id.slice(-8)}</div>
                        <div className="text-sm text-gray-500">#{trajet._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trajet.idChauffeur?.username || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{trajet.idChauffeur?.phoneNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trajet.portDepart}</div>
                    <div className="text-sm text-gray-500">→ {trajet.portDarriver}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="mb-1">
                        <span className="font-medium">Ramassage:</span> {trajet.pointRamasage.join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Livraison:</span> {trajet.pointLivraison.join(', ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(trajet.dateTraject)}</div>
                    <div className="text-sm text-gray-500">{formatTime(trajet.dateTraject)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trajet.prixParKilo} DT/kg</div>
                    <div className="text-sm text-gray-500">{trajet.prixParPiece} DT/pièce</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTransportColor(trajet.modetransport)}`}>
                      {trajet.modetransport}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        onClick={() => handleTrajetAction('view', trajet)}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        onClick={() => handleTrajetAction('edit', trajet)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        onClick={() => handleTrajetAction('delete', trajet)}
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

        {filteredTrajets.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun trajet trouvé.</p>
          </div>
        )}
      </div>

      {/* Modal de modification */}
      {showEditModal && selectedTrajet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifier le trajet</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix/kg (DT)</label>
                  <input
                    type="number"
                    value={editForm.prixParKilo || ''}
                    onChange={(e) => setEditForm({...editForm, prixParKilo: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix/pièce (DT)</label>
                  <input
                    type="number"
                    value={editForm.prixParPiece || ''}
                    onChange={(e) => setEditForm({...editForm, prixParPiece: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode de transport</label>
                <select
                  value={editForm.modetransport || ''}
                  onChange={(e) => setEditForm({...editForm, modetransport: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                >
                  <option value="Avion">Avion</option>
                  <option value="Bateau">Bateau</option>
                  <option value="Camion">Camion</option>
                  <option value="Voiture">Voiture</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date du trajet</label>
                <input
                  type="date"
                  value={editForm.dateTraject || ''}
                  onChange={(e) => setEditForm({...editForm, dateTraject: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port de départ</label>
                  <input
                    type="text"
                    value={editForm.portDepart || ''}
                    onChange={(e) => setEditForm({...editForm, portDepart: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port d'arrivée</label>
                  <input
                    type="text"
                    value={editForm.portDarriver || ''}
                    onChange={(e) => setEditForm({...editForm, portDarriver: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedTrajet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Confirmer la suppression</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce trajet ? Cette action est irréversible.
            </p>
            
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm">
                <strong>Trajet:</strong> {selectedTrajet.portDepart} → {selectedTrajet.portDarriver}<br/>
                <strong>Chauffeur:</strong> {selectedTrajet.idChauffeur.username}<br/>
                <strong>Date:</strong> {formatDate(selectedTrajet.dateTraject)}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrajetsPage;