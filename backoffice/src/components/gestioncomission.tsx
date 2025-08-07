"use client"; // Indique que c'est un composant client

import React, { useState, useEffect, FormEvent } from 'react';
import { Save, AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';

// Interface pour typer les données de la commission
interface CommissionData {
    valeur: number;
    comissionmin: string;
}

const CommissionPage: React.FC = () => {
    // État pour stocker les données de la commission
    const [commission, setCommission] = useState<CommissionData>({
        valeur: 0,
        comissionmin: ''
    });

    // États pour gérer le chargement et les messages à l'utilisateur
    const [loading, setLoading] = useState<boolean>(true);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // URL de votre API
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/commission`;

    // 1. Fonction pour récupérer les données de la commission au chargement
    useEffect(() => {
        const fetchCommission = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
                if (!response.ok) {
                    throw new Error("Impossible de récupérer les données de la commission.");
                }
                const data = await response.json();
                setCommission({
                    valeur: data.valeur,
                    comissionmin: data.comissionmin || ''
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCommission();
    }, []); // Le tableau vide [] assure que cette fonction ne s'exécute qu'une seule fois

    // 2. Fonction pour gérer les changements dans les champs du formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCommission(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // 3. Fonction pour soumettre les mises à jour
    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault(); // Empêche le rechargement de la page
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
                body: JSON.stringify(commission),
            });

            if (!response.ok) {
                throw new Error("La mise à jour a échoué. Veuillez réessayer.");
            }

            const result = await response.json();
            setCommission(result.commission); // Met à jour l'état local avec la réponse du serveur
            setSuccessMessage("La commission a été mise à jour avec succès !");

            // Fait disparaître le message de succès après 3 secondes
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Affichage pendant le chargement initial
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoaderCircle className="w-8 h-8 animate-spin text-gray-500" />
                <span className="ml-3 text-gray-600">Chargement de la commission...</span>
            </div>
        );
    }

    // Affichage principal de la page
    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion de la Commission ⚙️</h1>
                <p className="text-gray-500 mb-6">Modifiez la commission globale et le seuil minimum de l'application.</p>

                <form onSubmit={handleUpdate}>
                    <div className="space-y-6">
                        {/* Champ pour la valeur de la commission */}
                        <div>
                            <label htmlFor="valeur" className="block text-sm font-medium text-gray-700 mb-1">
                                Taux de commission (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="valeur"
                                    name="valeur"
                                    value={commission.valeur}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500 mb-1.5"
                                    placeholder="Ex: 10"
                                />
                            </div>
                        </div>

                        {/* Champ pour la commission minimum */}
                        <div>
                            <label htmlFor="comissionmin" className="block text-sm font-medium text-gray-700 mb-1">
                                Commission minimum (en dinar ou devise)
                            </label>
                            <input
                                type="text"
                                id="comissionmin"
                                name="comissionmin"
                                value={commission.comissionmin}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500 mb-1.5"
                                placeholder="Ex: 1 TND"
                            />
                        </div>
                    </div>

                    {/* Affichage des messages d'erreur ou de succès */}
                    <div className="mt-6 h-8">
                        {error && (
                            <div className="flex items-center text-sm text-red-600">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="flex items-center text-sm text-green-600">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                {successMessage}
                            </div>
                        )}
                    </div>
                    
                    {/* Bouton de soumission */}
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full mt-2 flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-red-300"
                    >
                        {isUpdating ? (
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        <span className="ml-2">{isUpdating ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommissionPage;