"use client";

import React, { useState, ReactNode } from 'react';
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
    MessageCircle
} from 'lucide-react';
import NavItem from '@/components/NavItem';

interface DashboardLayoutProps {
    children: ReactNode;
    onNavigate: (view: string) => void;
    currentView: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onNavigate, currentView }) => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<number>(3);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-red-700 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-red-800">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-8 h-8" />
                        <span className="text-xl font-bold">Bladi Go</span>
                    </div>
                    <button
                        className="p-1 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-5 px-2">
                    <NavItem
                        icon={<Home />}
                        text="Tableau de bord"
                        active={currentView === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <NavItem
                        icon={<Users />}
                        text="Transporteurs"
                        active={currentView === 'transporteurs'}
                        onClick={() => onNavigate('transporteurs')}
                    />
                    <NavItem
                        icon={<Users />}
                        text="Utilisateurs"
                        active={currentView === 'users'}
                        onClick={() => onNavigate('users')}
                    />
                    <NavItem
                        icon={<Package />}
                        text="Bagages"
                        active={currentView === 'bagages'}
                        onClick={() => onNavigate('bagages')}
                    />
                    <NavItem
                        icon={<Truck />}
                        text="Demandes de transport"
                        active={currentView === 'demandes'}
                        onClick={() => onNavigate('demandes')}
                    />
                    <NavItem
                        icon={<Map />}
                        text="Trajets"
                        active={currentView === 'trajets'}
                        onClick={() => onNavigate('trajets')}
                    />

                    <NavItem
                        icon={<Building2 />}
                        text="Ville"
                        active={currentView === 'ville'}
                        onClick={() => onNavigate('ville')}
                    />

                    <NavItem
                        icon={<MessageCircle />}
                        text="WhatsApp"
                        active={currentView === 'whatsapp'}
                        onClick={() => onNavigate('whatsapp')}
                    />

                    <div className="border-t border-red-800 pt-4 mt-6">
                        <NavItem
                            icon={<LogOut />}
                            text="Déconnexion"
                            onClick={() => onNavigate('logout')}
                        />
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Header */}
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
                    <div className="flex items-center">
                        <button
                            className="p-1 mr-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="py-2 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="relative mr-4">
                            <button className="relative p-1 text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500">
                                <Bell className="w-6 h-6" />
                                {notifications > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                                        {notifications}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center">
                            <span className="ml-2 font-medium text-gray-700">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
