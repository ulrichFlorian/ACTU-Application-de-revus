# Service Content Recommendation

Ce microservice utilise l'intelligence artificielle pour recommander du contenu pertinent aux utilisateurs.

## Fonctionnalités

- Algorithmes de recommandation basés sur le contenu
- Recommandations collaboratives
- Apprentissage automatique des préférences
- Analyse du comportement utilisateur

## API Endpoints

- `GET /recommendations/:userId` - Obtenir des recommandations personnalisées
- `POST /recommendations/:userId/feedback` - Envoyer des retours sur les recommandations
- `GET /recommendations/:userId/similar` - Contenu similaire
- `POST /recommendations/analyze` - Analyser les interactions utilisateur

## Port

Ce service fonctionne sur le port 3003
