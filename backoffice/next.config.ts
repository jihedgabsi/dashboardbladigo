/** @type {import('next').NextConfig} */
const nextConfig = {
  // Importante pour éviter les erreurs avec localStorage
  experimental: {
    esmExternals: false,
  },
  
  // Configuration pour les variables d'environnement
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Désactiver SSG pour les pages qui utilisent localStorage
  // (ou utiliser dynamic import avec ssr: false)
};

module.exports = nextConfig;
