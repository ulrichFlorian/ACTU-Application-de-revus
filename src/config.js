// Configuration des URLs des services backend
// En production, ces valeurs viennent des variables d'environnement Vercel
// En développement, on utilise localhost

const config = {
  // URL de l'API Gateway (point d'entrée unique)
  // En développement, utiliser localhost si disponible, sinon Render
  API_GATEWAY_URL: process.env.REACT_APP_API_GATEWAY_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:4001' : 'https://api-gateway-ydpu.onrender.com'),
  
  // URLs des services individuels (si besoin d'appels directs)
  AUTH_SERVICE_URL: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3004',
  PREFERENCES_SERVICE_URL: process.env.REACT_APP_PREFERENCES_SERVICE_URL || 'https://user-preferences.onrender.com',
  FEED_SERVICE_URL: process.env.REACT_APP_FEED_SERVICE_URL || 'https://content-feed.onrender.com',
  RECOMMENDATION_SERVICE_URL: process.env.REACT_APP_RECOMMENDATION_SERVICE_URL || 'https://content-recommendation.onrender.com',
  CATEGORIES_SERVICE_URL: process.env.REACT_APP_CATEGORIES_SERVICE_URL || 'https://content-categories.onrender.com',
  
  // Clé API GNews (pour le frontend si nécessaire)
  GNEWS_API_KEY: process.env.REACT_APP_GNEWS_API_KEY || '',
};

export default config;



