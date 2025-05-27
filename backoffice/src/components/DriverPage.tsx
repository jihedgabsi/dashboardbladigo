import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, Eye, Edit, Trash2, RefreshCw, X, Save, User } from 'lucide-react';

interface ApiUser {
  _id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: string;
}

interface DisplayUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  statut: string;
  dateInscription: string;
  avatar?: string;
  isVerified: boolean;
}

interface DriverPageProps {
  onNavigate: (view: string) => void;
}

const DriverPage: React.FC<DriverPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [usersData, setUsersData] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<DisplayUser | null>(null);
  const [viewingUser, setViewingUser] = useState<DisplayUser | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  const transformApiUser = (apiUser: ApiUser): DisplayUser => {
    return {
      id: apiUser._id,
      nom: apiUser.username,
      prenom: '',
      email: apiUser.email,
      telephone: apiUser.phoneNumber || 'N/A',
      role: 'transporteur',
      statut: apiUser.isVerified ? 'actif' : 'en_attente',
      dateInscription: new Date(apiUser.createdAt).toLocaleDateString('fr-FR'),
      isVerified: apiUser.isVerified
    };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/driver/alldashboarddrivers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const apiUsers: ApiUser[] = await response.json();
      const transformedUsers = apiUsers.map(transformApiUser);
      setUsersData(transformedUsers);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des transporteurs:', err);
      setError('Impossible de charger les transporteurs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updateData: any) => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/driver/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      setError('Impossible de mettre à jour le transporteur.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce transporteur ?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://vokkkokcowo0wgsok88844wo.82.112.242.233.sslip.io/api/driver/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer le transporteur.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.statut === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = (action: string, user: DisplayUser) => {
    switch(action) {
      case 'view':
        setViewingUser(user);
        break;
      case 'edit':
        setEditingUser(user);
        break;
      case 'delete':
        deleteUser(user.id);
        break;
    }
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    const updateData = {
      username: editingUser.nom,
      email: editingUser.email,
      phoneNumber: editingUser.telephone
    };
    updateUser(editingUser.id, updateData);
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'transporteur': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-red-100 text-red-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch(statut) {
      case 'actif': return 'Vérifié';
      case 'inactif': return 'Inactif';
      case 'en_attente': return 'En attente de vérification';
      default: return statut;
    }
  };

  const stats = {
    total: usersData.length,
    verified: usersData.filter(u => u.isVerified).length,
    pending: usersData.filter(u => !u.isVerified).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-gray-600">Chargement des transporteurs...</span>
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

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des transporteurs</h1>
          <p className="text-gray-600">Gérez tous les transporteurs de la plateforme</p>
        </div>
        <button onClick={fetchUsers} className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-700 transition-colors duration-200">
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total transporteurs</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Transporteurs vérifiés</p>
              <p className="text-lg font-semibold text-gray-900">{stats.verified}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <Filter className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-lg font-semibold text-gray-900">{stats.pending}</p>
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
                <input type="text" placeholder="Rechercher un transporteur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-64" />
              </div>
              <div className="flex gap-2">
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="all">Tous les rôles</option>
                  <option value="transporteur">Transporteur</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Vérifié</option>
                  <option value="en_attente">En attente</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">{filteredUsers.length} transporteur(s) trouvé(s)</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.telephone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>Transporteur</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.statut)}`}>{getStatusLabel(user.statut)}</span>
                      {user.isVerified && <div className="ml-2 text-green-500" title="Compte vérifié">✓</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.dateInscription}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-red-600 hover:text-red-900 transition-colors duration-200" onClick={() => handleUserAction('view', user)} title="Voir les détails">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200" onClick={() => handleUserAction('edit', user)} title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={() => handleUserAction('delete', user)} title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun transporteur trouvé.</p>
          </div>
        )}
      </div>

      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Détails du transporteur</h3>
              <button onClick={() => setViewingUser(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              <div className="text-center mb-4">
                <h4 className="text-xl font-semibold text-gray-900">{viewingUser.nom}</h4>
                <p className="text-sm text-gray-500">ID: {viewingUser.id}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-gray-900">{viewingUser.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone</label>
                  <p className="text-gray-900">{viewingUser.telephone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Rôle</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(viewingUser.role)}`}>Transporteur</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Statut de vérification</label>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(viewingUser.statut)}`}>
                      {getStatusLabel(viewingUser.statut)}
                    </span>
                    {viewingUser.isVerified && (
                      <div className="ml-2 text-green-500" title="Compte vérifié">✓</div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date d'inscription</label>
                  <p className="text-gray-900">{viewingUser.dateInscription}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewingUser(null)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifier le transporteur</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" value={editingUser.nom} onChange={(e) => setEditingUser({...editingUser, nom: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" value={editingUser.telephone || ''} onChange={(e) => setEditingUser({...editingUser, telephone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Annuler</button>
              <button onClick={handleSaveEdit} disabled={updateLoading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50">
                {updateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{updateLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPage;