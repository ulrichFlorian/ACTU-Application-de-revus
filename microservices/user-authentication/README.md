# Service User Authentication

Ce microservice gère l'authentification et l'autorisation des utilisateurs.

## Fonctionnalités

- Authentification JWT
- Gestion des sessions utilisateur
- Inscription et connexion
- Récupération de mot de passe
- Validation des tokens

## API Endpoints

- `POST /auth/register` - Inscription d'un nouvel utilisateur
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/logout` - Déconnexion
- `POST /auth/refresh` - Renouveler le token
- `POST /auth/forgot-password` - Demande de récupération de mot de passe
- `POST /auth/reset-password` - Réinitialiser le mot de passe
- `GET /auth/verify` - Vérifier un token

## Port

Ce service fonctionne sur le port 3004
