"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Truck } from 'lucide-react';

// ✅ Fonction pour sauvegarder le token dans cookie ET localStorage
const saveAdminToken = (token: string) => {
  try {
    // Sauvegarder dans localStorage (comme avant)
    localStorage.setItem('adminToken', token);
    
    // ✅ NOUVEAU : Sauvegarder dans un cookie pour le middleware
    const maxAge = 7 * 24 * 60 * 60; // 7 jours en secondes
    document.cookie = `adminToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
    
    console.log('✅ Token sauvegardé dans localStorage et cookie');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du token:', error);
  }
};

// ✅ Page component sans props (requis pour Next.js App Router)
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- Logique pour appeler le backend ---
    try {
      const response = await fetch('http://localhost:8000/api/authadmin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // ✅ Récupérer la réponse avec le token
        const data = await response.json();
        console.log('📥 Réponse login:', data);
        
        // ✅ Vérifier si le token existe dans la réponse
        if (data.token) {
          // Sauvegarder le token dans localStorage ET cookie
          saveAdminToken(data.token);
          
          // ✅ Redirection vers dashboard (le middleware prendra le relais)
          console.log('🔄 Redirection vers dashboard...');
          window.location.href = '/';
        } else {
          console.warn('⚠️ Aucun token reçu dans la réponse');
          setError('Erreur: Token manquant dans la réponse');
        }
      } else {
        // La réponse n'est pas OK (ex: 401 Unauthorized, 400 Bad Request)
        const errorData = await response.json();
        console.error('❌ Erreur de connexion:', errorData);
        setError(errorData.message || 'Identifiants incorrects');
      }
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-600 rounded-full">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Bladi Go Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-4 text-sm font-medium text-white bg-red-500 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition duration-150 bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
