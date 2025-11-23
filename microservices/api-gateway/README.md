# API Gateway

Ce microservice agit comme une passerelle unique pour tous les autres microservices.

## Fonctionnalités

- Routage des requêtes vers les bons services
- Authentification centralisée
- Rate limiting
- Logging et monitoring
- Gestion des erreurs
- Load balancing

## API Endpoints

- `GET /api/users/*` - Routage vers user-authentication
- `GET /api/preferences/*` - Routage vers user-preferences
- `GET /api/feed/*` - Routage vers content-feed
- `GET /api/recommendations/*` - Routage vers content-recommendation
- `GET /api/categories/*` - Routage vers content-categories

## Port

Ce service fonctionne sur le port 3000
