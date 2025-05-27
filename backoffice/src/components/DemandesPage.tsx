import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, Clock, X, Edit, Trash2 } from 'lucide-react';


interface DemandesPageProps {
  onNavigate: (view: string) => void;
}


const DemandesPage: React.FC<DemandesPageProps> = ({ onNavigate }) => => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [editingDemande, setEditingDemande] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/demandes-transport');
        const data = await response.json();
        if (data.success) setDemandes(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'accepted': 'Accepté',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  };

  const showImages = (bagages) => {
    const allImages = bagages?.flatMap(b => b.imageUrls || []) || [];
    setSelectedImages(allImages);
    setShowModal(true);
  };

  const deleteDemande = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/demandes-transport/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDemandes(demandes.filter(d => d._id !== id));
        alert('Demande supprimée avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const editDemande = (demande) => {
    setEditingDemande({
      ...demande,
      pointRamasage: demande.pointRamasage,
      pointLivrison: demande.pointLivrison,
      poisColieTotal: demande.poisColieTotal,
      prixProposer: demande.prixProposer,
      statutsDemande: demande.statutsDemande
    });
    setShowEditModal(true);
  };

  const updateDemande = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/demandes-transport/${editingDemande._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pointRamasage: editingDemande.pointRamasage,
          pointLivrison: editingDemande.pointLivrison,
          poisColieTotal: editingDemande.poisColieTotal,
          prixProposer: editingDemande.prixProposer,
          statutsDemande: editingDemande.statutsDemande
        }),
      });

      if (response.ok) {
        // Récupérer toutes les demandes à nouveau pour avoir les données complètes
        const allDemandesResponse = await fetch('http://localhost:8000/api/demandes-transport');
        const allDemandesData = await allDemandesResponse.json();
        
        if (allDemandesData.success) {
          setDemandes(allDemandesData.data);
        }
        
        setShowEditModal(false);
        setEditingDemande(null);
        alert('Demande modifiée avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch = demande._id.includes(searchTerm) ||
      demande.id_user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || demande.statutsDemande === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    enAttente: demandes.filter(d => d.statutsDemande === 'pending').length,
    accepte: demandes.filter(d => d.statutsDemande === 'accepted').length,
    enCours: demandes.filter(d => d.statutsDemande === 'in_progress').length,
    termine: demandes.filter(d => d.statutsDemande === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Demandes de transport</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow flex items-center">
          <Clock className="text-yellow-600 mr-2" />
          <div><p className="text-sm">En attente</p><p className="font-bold">{stats.enAttente}</p></div>
        </div>
        <div className="bg-white p-4 rounded shadow flex items-center">
          <CheckCircle className="text-blue-600 mr-2" />
          <div><p className="text-sm">Acceptées</p><p className="font-bold">{stats.accepte}</p></div>
        </div>
        <div className="bg-white p-4 rounded shadow flex items-center">
          <CheckCircle className="text-purple-600 mr-2" />
          <div><p className="text-sm">En cours</p><p className="font-bold">{stats.enCours}</p></div>
        </div>
        <div className="bg-white p-4 rounded shadow flex items-center">
          <CheckCircle className="text-green-600 mr-2" />
          <div><p className="text-sm">Terminées</p><p className="font-bold">{stats.termine}</p></div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded shadow mb-4 flex items-center justify-between">
        <div className="flex-1 relative mr-4">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="accepted">Accepté</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
          <option value="rejected">Rejeté</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-xs uppercase text-gray-500">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Transporteur</th>
              <th className="px-6 py-3">Trajet</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Bagages</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3">Prix</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredDemandes.map((demande, index) => (
              <tr key={index} className="border-t">
                <td className="px-6 py-3">DT-{demande._id.slice(-6)}</td>
                <td className="px-6 py-3">
                  <div className="font-medium">{demande.id_user?.username || 'Client inconnu'}</div>
                  <div className="text-xs text-gray-500">{demande.id_user?.phoneNumber}</div>
                </td>
                <td className="px-6 py-3">
                  <div className="font-medium">{demande.id_driver?.username || 'Non assigné'}</div>
                  <div className="text-xs text-gray-500">{demande.id_driver?.phoneNumber}</div>
                </td>
                <td className="px-6 py-3">
                  <div>{demande.pointRamasage} → {demande.pointLivrison}</div>
                  <div className="text-xs text-gray-500">{demande.id_traject?.modetransport}</div>
                </td>
                <td className="px-6 py-3">{new Date(demande.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-6 py-3">{demande.id_bagages?.length || 0}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(demande.statutsDemande)}`}>
                    {getStatusLabel(demande.statutsDemande)}
                  </span>
                </td>
                <td className="px-6 py-3">{demande.prixProposer} DT</td>
                <td className="px-6 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => showImages(demande.id_bagages)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir les images"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => editDemande(demande)}
                      className="text-green-600 hover:text-green-800"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteDemande(demande._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour images */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-600 hover:text-red-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Images des bagages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedImages.map((url, idx) => (
                <div key={idx} className="relative border rounded">
                  <img
                    src={url}
                    alt={`Bagage ${idx + 1}`}
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-48 items-center justify-center bg-gray-200 rounded text-sm text-gray-600 hidden">
                    Image non disponible
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal pour modification */}
      {showEditModal && editingDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Modifier la demande</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Point de ramassage</label>
                <input
                  type="text"
                  value={editingDemande.pointRamasage}
                  onChange={(e) => setEditingDemande({...editingDemande, pointRamasage: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Point de livraison</label>
                <input
                  type="text"
                  value={editingDemande.pointLivrison}
                  onChange={(e) => setEditingDemande({...editingDemande, pointLivrison: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Poids total (kg)</label>
                <input
                  type="number"
                  value={editingDemande.poisColieTotal}
                  onChange={(e) => setEditingDemande({...editingDemande, poisColieTotal: Number(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Prix proposé (DT)</label>
                <input
                  type="number"
                  value={editingDemande.prixProposer}
                  onChange={(e) => setEditingDemande({...editingDemande, prixProposer: Number(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={editingDemande.statutsDemande}
                  onChange={(e) => setEditingDemande({...editingDemande, statutsDemande: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pending">En attente</option>
                  <option value="accepted">Accepté</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={updateDemande}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesPage;
