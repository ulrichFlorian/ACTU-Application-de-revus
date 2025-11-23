#!/bin/bash

echo "🚀 Démarrage des microservices en mode développement..."

# Fonction pour démarrer un service
start_service() {
    local service_name=$1
    local port=$2
    
    echo "📦 Démarrage du service $service_name sur le port $port..."
    cd $service_name
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        echo "📥 Installation des dépendances pour $service_name..."
        npm install
    fi
    
    # Démarrer le service en arrière-plan
    npm start &
    
    # Revenir au répertoire parent
    cd ..
    
    echo "✅ Service $service_name démarré"
}

# Démarrer tous les services
echo "🔧 Démarrage des services..."

start_service "user-preferences" "3001"
start_service "content-feed" "3002"
start_service "content-recommendation" "3003"
start_service "user-authentication" "3004"
start_service "content-categories" "3005"
start_service "api-gateway" "3000"

echo ""
echo "🎉 Tous les microservices sont démarrés !"
echo ""
echo "📡 Endpoints disponibles :"
echo "   - API Gateway: http://localhost:3000"
echo "   - User Preferences: http://localhost:3001"
echo "   - Content Feed: http://localhost:3002"
echo "   - Content Recommendation: http://localhost:3003"
echo "   - User Authentication: http://localhost:3004"
echo "   - Content Categories: http://localhost:3005"
echo ""
echo "🛑 Pour arrêter tous les services, utilisez Ctrl+C"
echo ""

# Attendre que l'utilisateur appuie sur Ctrl+C
trap 'echo ""; echo "🛑 Arrêt des services..."; kill $(jobs -p) 2>/dev/null; exit 0' INT

# Maintenir le script en vie
wait
