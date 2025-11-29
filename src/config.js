// Configuration des URLs des services backend
// En production, ces valeurs viennent des variables d'environnement Vercel
// En développement, on utilise localhost

const config = {
  // URL de l'API Gateway (point d'entrée unique)
  API_GATEWAY_URL: process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000',
  
  // URLs des services individuels (si besoin d'appels directs)
  AUTH_SERVICE_URL: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3004',
  PREFERENCES_SERVICE_URL: process.env.REACT_APP_PREFERENCES_SERVICE_URL || 'http://localhost:3001',
  FEED_SERVICE_URL: process.env.REACT_APP_FEED_SERVICE_URL || 'http://localhost:3002',
  RECOMMENDATION_SERVICE_URL: process.env.REACT_APP_RECOMMENDATION_SERVICE_URL || 'http://localhost:3003',
  CATEGORIES_SERVICE_URL: process.env.REACT_APP_CATEGORIES_SERVICE_URL || 'http://localhost:3005',
  
  // Clé API GNews (pour le frontend si nécessaire)
  GNEWS_API_KEY: process.env.REACT_APP_GNEWS_API_KEY || '',
};

export default config;

