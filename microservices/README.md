# Architecture Microservices - Application de Personnalisation de Contenus

Cette architecture de microservices est conçue pour une application web de personnalisation de contenus utilisateur, similaire à Google Actualités.

## 🏗️ Architecture

### Services

1. **API Gateway (Port 3000)** - Point d'entrée unique pour tous les services
2. **User Preferences (Port 3001)** - Gestion des préférences utilisateur
3. **Content Feed (Port 3002)** - Génération de flux personnalisés
4. **Content Recommendation (Port 3003)** - Système de recommandations IA
5. **User Authentication (Port 3004)** - Authentification et autorisation
6. **Content Categories (Port 3005)** - Gestion des catégories de contenu

### Technologies

- **Backend**: Node.js avec Express.js
- **Base de données**: MongoDB
- **Cache**: Redis
- **Orchestration**: Docker Compose
- **Authentification**: JWT

## 🚀 Démarrage rapide

### Prérequis

- Docker et Docker Compose installés
- Node.js 16+ (pour le développement local)

### Installation

```bash
# Cloner le projet
cd microservices

# Démarrer tous les services
docker-compose up -d

# Vérifier que tous les services sont en cours d'exécution
docker-compose ps
```

### Développement local

```bash
# Pour chaque service, installer les dépendances
cd user-preferences && npm install
cd content-feed && npm install
cd content-recommendation && npm install
cd user-authentication && npm install
cd content-categories && npm install
cd api-gateway && npm install

# Démarrer chaque service individuellement
npm start
```

## 📡 Endpoints API

### API Gateway (http://localhost:3000)

- `GET /api/auth/*` - Authentification
- `GET /api/preferences/*` - Préférences utilisateur
- `GET /api/feed/*` - Flux de contenu
- `GET /api/recommendations/*` - Recommandations
- `GET /api/categories/*` - Catégories

## 🔄 Flux de données

1. **Authentification** : L'utilisateur se connecte via le service d'authentification
2. **Préférences** : Le système récupère les préférences de l'utilisateur
3. **Recommandations** : L'IA génère des recommandations personnalisées
4. **Feed** : Le service de flux agrège et filtre le contenu
5. **Affichage** : L'interface utilisateur affiche le contenu personnalisé

## 🛠️ Développement

Chaque service est indépendant et peut être développé, testé et déployé séparément.

### Structure d'un service

```
service-name/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

## 📊 Monitoring

- Logs centralisés via Docker
- Health checks pour chaque service
- Métriques de performance

## 🔒 Sécurité

- Authentification JWT
- Rate limiting
- Validation des entrées
- CORS configuré
- Secrets gérés via variables d'environnement
