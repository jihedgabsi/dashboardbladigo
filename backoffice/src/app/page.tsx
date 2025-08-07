"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHome from '../components/DashboardHome';
import UsersPage from '../components/UsersPage';
import DriverPage from '../components/DriverPage';
import BagagesPage from '../components/BagagesPage';
import DemandesPage from '../components/DemandesPage';
import TrajetsPage from '../components/TrajetsPage';
import VillePage from '../components/villePage';
import SoldeDriverPage from '../components/SoldeDriverPage';
import AirportsPage from '../components/AirportsPage';
import PortsPage from '../components/PortsPage';
import CommissionPage from '../components/gestioncomission';
import HistoriquePaiementsPage from '../components/historiquepayementPage';
import WhatsupPage  from '../components/whatsup';
import { DashboardView } from '../Types/index';

// ✅ Mapping des vues vers les composants pour un code plus propre
const viewComponents = {
  dashboard: DashboardHome,
  users: UsersPage,
  transporteurs: DriverPage,
  bagages: BagagesPage,
  demandes: DemandesPage,
  trajets: TrajetsPage,
  commission: SoldeDriverPage,
  CommissionPage: CommissionPage,
  HistoriquePaiementsPage :HistoriquePaiementsPage,
  Airports: AirportsPage,
  ports: PortsPage,
  ville: VillePage,
  WhatsupPage: WhatsupPage,
};

const validViews = Object.keys(viewComponents) as DashboardView[];

// ✅ Fonction de déconnexion
const handleLogout = () => {
    try {
        localStorage.removeItem('adminToken');
        // Important : Nettoyer aussi la vue sauvegardée lors de la déconnexion
        localStorage.removeItem('currentView');
        document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('adminTokenTimestamp');
        localStorage.removeItem('userProfile');
        console.log('✅ Déconnexion réussie - redirection vers login');
        window.location.href = '/login';
    } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        window.location.href = '/login';
    }
};


const Home: React.FC = () => {
    // 1. On initialise l'état en lisant la valeur depuis le localStorage.
    // La fonction passée à useState ne s'exécute qu'une seule fois, au chargement.
    const [currentView, setCurrentView] = useState<DashboardView>(() => {
        // On vérifie qu'on est bien côté client (navigateur)
        if (typeof window !== 'undefined') {
            const savedView = localStorage.getItem('currentView');
            // On s'assure que la vue sauvegardée est valide avant de l'utiliser
            if (savedView && validViews.includes(savedView as DashboardView)) {
                return savedView as DashboardView;
            }
        }
        // Si rien n'est sauvegardé ou si la valeur est invalide, on retourne au tableau de bord
        return 'dashboard';
    });

    // 2. On utilise useEffect pour sauvegarder la nouvelle vue dans le localStorage
    //    chaque fois que l'état `currentView` change.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentView', currentView);
        }
    }, [currentView]); // Ce code s'exécute à chaque fois que `currentView` est modifié.

    const handleNavigate = (view: string) => {
        if (view === 'logout') {
            handleLogout();
            return;
        }
        setCurrentView(view as DashboardView);
    };

    const renderContent = () => {
        const ComponentToRender = viewComponents[currentView] || viewComponents.dashboard;
        return <ComponentToRender onNavigate={handleNavigate} />;
    };

    return (
        <DashboardLayout onNavigate={handleNavigate} currentView={currentView}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default Home;
