# Service Content Categories

Ce microservice gère les catégories et la classification du contenu.

## Fonctionnalités

- Gestion des catégories prédéfinies
- Classification automatique du contenu
- Hiérarchie des catégories
- Mots-clés et tags associés

## API Endpoints

- `GET /categories` - Récupérer toutes les catégories
- `GET /categories/:id` - Récupérer une catégorie spécifique
- `POST /categories` - Créer une nouvelle catégorie
- `PUT /categories/:id` - Modifier une catégorie
- `DELETE /categories/:id` - Supprimer une catégorie
- `GET /categories/:id/content` - Contenu d'une catégorie

## Port

Ce service fonctionne sur le port 3005
