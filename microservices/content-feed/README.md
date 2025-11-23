# Service Content Feed

Ce microservice génère et fournit le flux de contenus personnalisés pour les utilisateurs.

## Fonctionnalités

- Génération de flux personnalisés basés sur les préférences
- Agrégation de contenus de différentes sources
- Filtrage et tri du contenu
- Cache intelligent pour améliorer les performances

## API Endpoints

- `GET /feed/:userId` - Récupérer le flux personnalisé d'un utilisateur
- `GET /feed/:userId/trending` - Récupérer les contenus tendance
- `POST /feed/:userId/refresh` - Actualiser le flux
- `GET /feed/:userId/categories/:categoryId` - Flux par catégorie

## Port

Ce service fonctionne sur le port 3002
