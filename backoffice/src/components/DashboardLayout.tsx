"use client";

import React, { useState, ReactNode, useEffect } from 'react';
import {
    Package,
    Users,
    Truck,
    Map,
    Home,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Building2,
    CreditCard,
    Plane,
    Ship,
    Percent,
    MessageCircle
} from 'lucide-react';

const NavItem = ({ icon, text, active, onClick }: {
    icon: ReactNode;
    text: string;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 mt-1 text-sm font-medium text-left transition-all duration-200 rounded-lg focus:outline-none group ${active
            ? 'bg-red-800 text-white shadow-lg'
            : 'text-red-100 hover:bg-red-600 hover:text-white hover:shadow-md'
        }`}
    >
        <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
            {icon}
        </div>
        <span className="ml-3 font-medium">{text}</span>
    </button>
);

const navLinks = [
    { view: 'dashboard', icon: <Home className="w-5 h-5" />, text: 'Tableau de bord' },
    { view: 'transporteurs', icon: <Truck className="w-5 h-5" />, text: 'Transporteurs' },
    { view: 'users', icon: <Users className="w-5 h-5" />, text: 'Utilisateurs' },
    { view: 'bagages', icon: <Package className="w-5 h-5" />, text: 'Bagages' },
    { view: 'demandes', icon: <Truck className="w-5 h-5" />, text: 'Demandes' },
    { view: 'trajets', icon: <Map className="w-5 h-5" />, text: 'Trajets' },
    { view: 'commission', icon: <CreditCard className="w-5 h-5" />, text: 'Solde Transporteurs' },
    { view: 'CommissionPage', icon: <Percent className="w-5 h-5" />, text: 'Gestion des frais' },
    { view: 'HistoriquePaiementsPage', icon: <CreditCard className="w-5 h-5" />, text: 'Historique Paiements' },
    { view: 'Airports', icon: <Plane className="w-5 h-5" />, text: 'Aéroports' },
    { view: 'ports', icon: <Ship className="w-5 h-5" />, text: 'Ports' },
    { view: 'ville', icon: <Building2 className="w-5 h-5" />, text: 'Ville' },
    { view: 'WhatsupPage', icon: <MessageCircle className="w-5 h-5" />, text: 'WhatsupPage' },
];

interface DashboardLayoutProps {
    children: ReactNode;
    onNavigate: (view: string) => void;
    currentView: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onNavigate, currentView }) => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<number>(3);

    // Fermer la sidebar quand on clique sur un élément du menu sur mobile
    const handleNavigate = (view: string) => {
        onNavigate(view);
        // Fermer automatiquement la sidebar sur mobile après navigation
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    // Empêcher le scroll du body quand la sidebar est ouverte sur mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // Nettoyer au démontage du composant
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [sidebarOpen]);

    // CSS pour cacher la scrollbar
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .scrollbar-hide {
                -ms-overflow-style: none;  /* Internet Explorer 10+ */
                scrollbar-width: none;  /* Firefox */
            }
            .scrollbar-hide::-webkit-scrollbar {
                display: none;  /* Safari and Chrome */
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-red-700 to-red-800 text-white transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } shadow-2xl lg:shadow-lg flex flex-col`}
            >
                {/* Header de la sidebar */}
                <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-red-600 bg-red-800 lg:bg-transparent">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <Truck className="w-6 h-6 text-red-700" />
                        </div>
                        <span className="text-xl font-bold">Bladi Go</span>
                    </div>
                    <button
                        className="p-2 rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-white/30 hover:bg-red-600 transition-colors duration-200"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
                    <nav className="px-3 py-4">
                        {/* Navigation principale */}
                        <div className="space-y-1 mb-6">
                            {navLinks.map((link) => (
                                <NavItem
                                    key={link.view}
                                    icon={link.icon}
                                    text={link.text}
                                    active={currentView === link.view}
                                    onClick={() => handleNavigate(link.view)}
                                />
                            ))}
                        </div>

                        {/* Séparateur et déconnexion */}
                        <div className="border-t border-red-600/50 pt-4">
                            <NavItem
                                icon={<LogOut className="w-5 h-5" />}
                                text="Déconnexion"
                                active={false}
                                onClick={() => handleNavigate('logout')}
                            />
                        </div>

                        {/* Espace de sécurité en bas pour s'assurer que tout est visible */}
                        <div className="h-8 lg:h-4"></div>
                    </nav>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                {/* Header supérieur */}
                <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200 shadow-sm z-30">
                    <div className="flex items-center min-w-0 flex-1">
                        <button
                            className="p-2 mr-3 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 lg:hidden hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        
                    </div>

                    {/* Section droite du header */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button className="relative p-2 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-gray-100 transition-colors duration-200">
                                <Bell className="w-6 h-6" />
                                {notifications > 0 && (
                                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                                        {notifications > 9 ? '9+' : notifications}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="hidden sm:flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">A</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Contenu de la page */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

