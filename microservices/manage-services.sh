#!/bin/bash

# Script pour gérer les services microservices
# Usage: ./manage-services.sh [start|stop|restart|status|logs]

SERVICE_NAME=${2:-""}  # Nom du service optionnel (ex: content-feed, user-authentication)

case "$1" in
  start)
    echo "🚀 Démarrage des services..."
    if [ -n "$SERVICE_NAME" ]; then
      echo "   → Démarrage du service: $SERVICE_NAME"
      docker-compose up -d "$SERVICE_NAME"
    else
      echo "   → Démarrage de tous les services"
      docker-compose up -d
    fi
    echo "✅ Services démarrés"
    ;;
  
  stop)
    echo "🛑 Arrêt des services..."
    if [ -n "$SERVICE_NAME" ]; then
      echo "   → Arrêt du service: $SERVICE_NAME"
      docker-compose stop "$SERVICE_NAME"
    else
      echo "   → Arrêt de tous les services"
      docker-compose stop
    fi
    echo "✅ Services arrêtés"
    ;;
  
  restart)
    echo "🔄 Redémarrage des services..."
    if [ -n "$SERVICE_NAME" ]; then
      echo "   → Redémarrage du service: $SERVICE_NAME"
      docker-compose stop "$SERVICE_NAME"
      docker-compose up -d "$SERVICE_NAME"
    else
      echo "   → Redémarrage de tous les services"
      docker-compose restart
    fi
    echo "✅ Services redémarrés"
    ;;
  
  down)
    echo "🗑️  Arrêt et suppression des conteneurs..."
    docker-compose down
    echo "✅ Conteneurs arrêtés et supprimés"
    ;;
  
  status)
    echo "📊 État des services:"
    echo ""
    docker-compose ps
    echo ""
    echo "📡 Ports utilisés:"
    ss -tuln | grep -E ':(4001|4002|4003|4004|4005|4006)' || echo "Aucun port trouvé"
    ;;
  
  logs)
    if [ -n "$SERVICE_NAME" ]; then
      echo "📋 Logs du service: $SERVICE_NAME"
      docker-compose logs -f "$SERVICE_NAME"
    else
      echo "📋 Logs de tous les services:"
      docker-compose logs -f
    fi
    ;;
  
  test)
    echo "🧪 Test des services..."
    echo ""
    echo "1. Health check content-feed:"
    curl -s http://localhost:4003/health | jq '.' || curl -s http://localhost:4003/health
    echo ""
    echo "2. Test API GNews (technologie):"
    curl -s "http://localhost:4003/api/feed/category/technologie?limit=1" | jq '.feed[0].title' || curl -s "http://localhost:4003/api/feed/category/technologie?limit=1" | head -5
    echo ""
    echo "3. Health check API Gateway:"
    curl -s http://localhost:4001/health | jq '.' || curl -s http://localhost:4001/health
    ;;
  
  clean)
    echo "🧹 Nettoyage des conteneurs arrêtés..."
    docker-compose down
    docker system prune -f
    echo "✅ Nettoyage terminé"
    ;;
  
  *)
    echo "Usage: $0 {start|stop|restart|down|status|logs|test|clean} [service-name]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start [service]    - Démarrer un service ou tous les services"
    echo "  stop [service]     - Arrêter un service ou tous les services"
    echo "  restart [service]  - Redémarrer un service ou tous les services"
    echo "  down               - Arrêter et supprimer tous les conteneurs"
    echo "  status             - Afficher l'état des services"
    echo "  logs [service]     - Afficher les logs d'un service ou tous"
    echo "  test               - Tester les services"
    echo "  clean              - Nettoyer les conteneurs arrêtés"
    echo ""
    echo "Exemples:"
    echo "  $0 start                    # Démarrer tous les services"
    echo "  $0 start content-feed       # Démarrer uniquement content-feed"
    echo "  $0 restart user-authentication  # Redémarrer user-authentication"
    echo "  $0 logs content-feed        # Voir les logs de content-feed"
    echo "  $0 test                     # Tester les services"
    exit 1
    ;;
esac

