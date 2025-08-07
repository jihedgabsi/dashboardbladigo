import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle, Clock, X, Edit, Trash2, Ship, Plane } from 'lucide-react';

const DemandesPage = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [editingDemande, setEditingDemande] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Correction: Utilisation de useCallback pour définir fetchData
  // pour qu'elle puisse être appelée après la mise à jour sans causer de re-render inutile.
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demandes-transport`);
      const data = await response.json();
      if (data.success) {
        setDemandes(data.data);
      } else {
        console.error("Erreur de l'API:", data.message);
        setDemandes([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  }, []); // Le tableau de dépendances vide signifie que la fonction n'est créée qu'une seule fois.

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const getLivraisonStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gray-200 text-gray-800',
      'payé': 'bg-cyan-100 text-cyan-800',
      'collecté': 'bg-indigo-100 text-indigo-800',
      'aéroport_depart': 'bg-purple-100 text-purple-800',
      'aéroport_arrivée': 'bg-pink-100 text-pink-800',
      'en livraison': 'bg-orange-100 text-orange-800',
      'livré': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLivraisonStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'payé': 'Payé',
      'collecté': 'Collecté',
      'aéroport_depart': 'Aéroport Départ',
      'aéroport_arrivée': 'Aéroport Arrivée',
      'en livraison': 'En Livraison',
      'livré': 'Livré',
    };
    return labels[status] || status;
  };


  const showImages = (bagages) => {
    const allImages = bagages?.flatMap(b => b.imageUrls || []) || [];
    setSelectedImages(allImages);
    setShowModal(true);
  };

  const deleteDemande = async (id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demandes-transport/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDemandes(demandes.filter(d => d._id !== id));
        console.log('Demande supprimée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const editDemande = (demande) => {
    setEditingDemande({ ...demande });
    setShowEditModal(true);
  };

  const updateDemande = async () => {
    if (!editingDemande) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demandes-transport/${editingDemande._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointRamasage: editingDemande.pointRamasage,
          pointLivrison: editingDemande.pointLivrison,
          prixProposer: editingDemande.prixProposer,
          statutsDemande: editingDemande.statutsDemande,
          statusLivraison: editingDemande.statusLivraison,
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingDemande(null);
        console.log('Demande modifiée avec succès. Rafraîchissement des données...');
        // Correction: Re-fetch des données pour garantir la cohérence de l'UI.
        await fetchData();
      } else {
        const errorData = await response.json();
        console.error("La mise à jour a échoué:", errorData.message || "Erreur inconnue du serveur");
      }
    } catch (error) {
      console.error('Erreur réseau lors de la modification:', error);
    }
  };

  const filteredDemandes = demandes.filter(demande => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (demande._id && demande._id.toLowerCase().includes(searchTermLower)) ||
      (demande.id_user?.username && demande.id_user.username.toLowerCase().includes(searchTermLower)) ||
      (demande.id_driver?.username && demande.id_driver.username.toLowerCase().includes(searchTermLower)) ||
      (demande.pointRamasage && demande.pointRamasage.toLowerCase().includes(searchTermLower)) ||
      (demande.pointLivrison && demande.pointLivrison.toLowerCase().includes(searchTermLower));
      
    const matchesStatus = filterStatus === 'all' || demande.statutsDemande === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Demandes</h1>
        <p className="text-gray-600 mt-1">Suivez et gérez toutes les demandes de transport.</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-1/2 lg:w-1/3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par ID, nom, lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-400 mb-1.5"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-400 mb-1.5"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="accepted">Accepté</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
          <option value="rejected">Rejeté</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr className="text-left text-xs font-semibold uppercase text-gray-600">
              <th className="px-6 py-4">ID Demande</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Transporteur</th>
              <th className="px-6 py-4">Trajet & Ports</th>
              <th className="px-6 py-4">Statut Demande</th>
              <th className="px-6 py-4">Statut Livraison</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {filteredDemandes.map((demande) => (
              <tr key={demande._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs">DT-{demande._id.slice(-6)}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{demande.id_user?.username || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{demande.id_user?.phoneNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{demande.id_driver?.username || 'Non assigné'}</div>
                  <div className="text-xs text-gray-500">{demande.id_driver?.phoneNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold">{demande.pointRamasage} → {demande.pointLivrison}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    {demande.id_traject?.modetransport === 'Avion' ? <Plane size={14}/> : <Ship size={14}/>}
                    {demande.id_traject?.portDepart || 'N/A'} → {demande.id_traject?.portDarriver || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(demande.statutsDemande)}`}>
                    {getStatusLabel(demande.statutsDemande)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLivraisonStatusColor(demande.statusLivraison)}`}>
                    {getLivraisonStatusLabel(demande.statusLivraison)}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold">{demande.prixProposer} DT</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => showImages(demande.id_bagages)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Voir les images"><Eye className="w-5 h-5" /></button>
                    <button onClick={() => editDemande(demande)} className="text-green-600 hover:text-green-800 transition-colors" title="Modifier"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => deleteDemande(demande._id)} className="text-red-600 hover:text-red-800 transition-colors" title="Supprimer"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
             {filteredDemandes.length === 0 && (
                <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-500">
                        Aucune demande trouvée.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal pour images */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition-colors"><X className="w-7 h-7" /></button>
            <h2 className="text-xl font-semibold mb-4">Images des bagages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedImages.length > 0 ? selectedImages.map((url, idx) => (
                <div key={idx} className="relative border rounded-lg overflow-hidden">
                  <img src={url} alt={`Bagage ${idx + 1}`} className="w-full h-56 object-cover" onError={(e) => e.target.src='https://placehold.co/400x300/e2e8f0/4a5568?text=Image+invalide'}/>
                </div>
              )) : <p className="text-gray-500">Aucune image disponible.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Modal pour modification */}
      {showEditModal && editingDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-1.5">Modifier la demande</h2>
              <button onClick={() => setShowEditModal(false)} className="mb-1.5 text-gray-800 hover:text-red-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Point de ramassage</label>
                <input  type="text" value={editingDemande.pointRamasage} onChange={(e) => setEditingDemande({...editingDemande, pointRamasage: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500 mb-1.5"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Point de livraison</label>
                <input type="text" value={editingDemande.pointLivrison} onChange={(e) => setEditingDemande({...editingDemande, pointLivrison: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500 mb-1.5"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Prix proposé (DT)</label>
                <input type="number" value={editingDemande.prixProposer} onChange={(e) => setEditingDemande({...editingDemande, prixProposer: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500 mb-1.5"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Statut de la Demande</label>
                <select value={editingDemande.statutsDemande} onChange={(e) => setEditingDemande({...editingDemande, statutsDemande: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500 mb-1.5">
                  <option value="pending">En attente</option>
                  <option value="accepted">Accepté</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Statut de la Livraison</label>
                <select value={editingDemande.statusLivraison} onChange={(e) => setEditingDemande({...editingDemande, statusLivraison: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500 mb-1.5">
                    <option value="pending">En attente</option>
                    <option value="payé">Payé</option>
                    <option value="collecté">Collecté</option>
                    <option value="aéroport_depart">Aéroport de départ</option>
                    <option value="aéroport_arrivée">Aéroport d'arrivée</option>
                    <option value="en livraison">En livraison</option>
                    <option value="livré">Livré</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg hover:bg-gray-300 font-semibold transition-colors">Annuler</button>
              <button onClick={updateDemande} className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-800 font-semibold transition-colors">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesPage;
