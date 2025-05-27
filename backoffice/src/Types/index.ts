// Types pour les utilisateurs
export interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    role: 'admin' | 'transporteur' | 'client';
    statut: 'actif' | 'inactif' | 'en_attente';
    dateInscription: string;
    avatar?: string;
  }
  
  // Types pour les bagages
  export interface Bagage {
    id: string;
    expediteur: string;
    destinataire: string;
    poids: string;
    dimensions?: string;
    description?: string;
    statut: 'en_attente' | 'en_transit' | 'livre' | 'annule';
    trajet: string;
    dateCreation: string;
    dateLivraison?: string;
    prix?: number;
  }
  
  // Types pour les demandes de transport
  export interface DemandeTransport {
    id: string;
    client: string;
    clientId: string;
    depart: string;
    destination: string;
    date: string;
    heureDepart?: string;
    statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
    nombreBagages?: number;
    poidsTotal?: string;
    prix?: number;
    transporteur?: string;
    transporteurId?: string;
  }
  
  // Types pour les trajets
  export interface Trajet {
    id: string;
    transporteur: string;
    transporteurId: string;
    depart: string;
    destination: string;
    distance: string;
    duree?: string;
    prix: string;
    statut: 'actif' | 'complet' | 'suspendu' | 'termine';
    placesDisponibles?: number;
    placesTotal?: number;
    dateDepart?: string;
    heureDepart?: string;
  }
  
  // Types pour les statistiques
  export interface Stat {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: 'up' | 'down';
    trendValue: string;
  }
  
  // Types pour les alertes
  export interface Alert {
    id?: string;
    title: string;
    message: string;
    time: string;
    type?: 'warning' | 'error' | 'info' | 'success';
    read?: boolean;
  }
  
  // Types pour les colonnes de tableau
  export interface TableColumn {
    header: string;
    accessor: string;
    render?: (row: any) => React.ReactNode;
  }
  
  // ✅ Types pour les vues du dashboard - CORRIGÉ avec toutes les valeurs utilisées
  export type DashboardView = 
    | 'dashboard' 
    | 'users' 
    | 'transporteurs'  // ✅ Ajouté - utilisé dans DashboardLayout
    | 'bagages' 
    | 'demandes' 
    | 'trajets' 
    | 'ville'          // ✅ Ajouté - utilisé dans DashboardLayout
    | 'logout';
  
  // Types pour les filtres
  export interface Filter {
    field: string;
    value: string;
    operator?: 'equals' | 'contains' | 'greater' | 'less';
  }
  
  // Types pour la pagination
  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  
  // Types pour les réponses API
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: Pagination;
  }
  
  // Types pour les actions de formulaire
  export interface FormAction {
    type: 'create' | 'edit' | 'delete' | 'view';
    data?: any;
  }
  
  // Types pour les notifications
  export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
    userId?: string;
  }
