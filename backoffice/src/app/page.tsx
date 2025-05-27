"use client";

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHome from '../components/DashboardHome';
import UsersPage from '../components/UsersPage';
import DriverPage from '../components/DriverPage';
import BagagesPage from '../components/BagagesPage';
import DemandesPage from '../components/DemandesPage';
import TrajetsPage from '../components/TrajetsPage';
import VillePage from '../components/villePage';
import { DashboardView } from '../Types/index';

// ✅ Fonction de déconnexion
const handleLogout = () => {
  try {
    // Supprimer le token du localStorage
    localStorage.removeItem('adminToken');
    
    // Supprimer le cookie adminToken
    document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Supprimer autres données de session si nécessaire
    localStorage.removeItem('adminTokenTimestamp');
    localStorage.removeItem('userProfile');
    
    console.log('✅ Déconnexion réussie - redirection vers login');
    
    // Redirection vers la page de login
    window.location.href = '/login';
    
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    // Forcer la redirection même en cas d'erreur
    window.location.href = '/login';
  }
};

const Home: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');

  const handleNavigate = (view: string) => {
    // ✅ Gérer la déconnexion
    if (view === 'logout') {
      handleLogout();
      return; // Arrêter l'exécution après déconnexion
    }
    
    setCurrentView(view as DashboardView);
  };

  const renderContent = () => {
    switch(currentView) {
      case 'users':
        return <UsersPage onNavigate={handleNavigate} />;
      case 'transporteurs':
        return <DriverPage onNavigate={handleNavigate} />;
      case 'bagages':
        return <BagagesPage onNavigate={handleNavigate} />;
      case 'demandes':
        return <DemandesPage onNavigate={handleNavigate} />;
      case 'trajets':
        return <TrajetsPage onNavigate={handleNavigate} />;
      case 'ville':
        return <VillePage onNavigate={handleNavigate} />;
      case 'dashboard':
      default:
        return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <DashboardLayout onNavigate={handleNavigate} currentView={currentView}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Home;
