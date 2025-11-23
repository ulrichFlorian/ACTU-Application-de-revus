# Guide d'hébergement gratuit - Actu App

## Architecture du projet
- **Frontend** : Application React
- **Backend** : 6 microservices Node.js/Express + API Gateway
- **Base de données** : MongoDB (plusieurs bases)
- **Cache** : Redis

## 🎯 Option 1 : Railway (RECOMMANDÉ - Le plus simple)

### Avantages
- ✅ Gratuit : $5 de crédit/mois (suffisant pour commencer)
- ✅ Support Docker natif
- ✅ MongoDB inclus (MongoDB Atlas intégré)
- ✅ Déploiement automatique depuis GitHub
- ✅ Variables d'environnement faciles

### Étapes

1. **Créer un compte** : https://railway.app
2. **Connecter GitHub** et importer le repo
3. **Déployer MongoDB** :
   - New Project → Database → MongoDB
   - Copier l'URL de connexion

4. **Déployer chaque microservice** :
   - New Service → GitHub Repo
   - Sélectionner le dossier du microservice
   - Configurer les variables d'environnement
   - Railway détecte automatiquement Dockerfile

5. **Variables d'environnement à configurer** :
```env
# Pour chaque service
NODE_ENV=production
PORT=3001  # ou 3002, 3003, etc.
DATABASE_URL=<URL_MongoDB_Atlas>
JWT_SECRET=<votre_secret>
```

### Coût estimé : ~$0-5/mois (gratuit au début)

---

## 🚀 Option 2 : Render (100% gratuit avec limitations)

### Avantages
- ✅ Plan gratuit disponible
- ✅ Support Docker
- ✅ MongoDB Atlas gratuit
- ✅ SSL automatique

### Limitations
- ⚠️ Services "spin down" après 15 min d'inactivité
- ⚠️ Démarrage lent (~30-60s) après inactivité

### Étapes

1. **Créer un compte** : https://render.com
2. **Déployer MongoDB Atlas** (gratuit) :
   - https://www.mongodb.com/cloud/atlas
   - Créer un cluster gratuit (M0)
   - Copier l'URL de connexion

3. **Déployer chaque service** :
   - New → Web Service
   - Connecter GitHub
   - Build Command : `cd microservices/user-authentication && npm install`
   - Start Command : `cd microservices/user-authentication && npm start`
   - Ou utiliser Dockerfile

### Coût : $0/mois (gratuit)

---

## 🪂 Option 3 : Fly.io (Gratuit avec limitations)

### Avantages
- ✅ 3 VMs gratuites
- ✅ Excellent pour microservices
- ✅ Déploiement rapide

### Étapes

1. **Installer Fly CLI** :
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Créer un compte** : `fly auth signup`

3. **Déployer chaque service** :
```bash
cd microservices/user-authentication
fly launch
# Suivre les instructions
```

### Coût : $0/mois (3 VMs gratuites)

---

## 🌐 Option 4 : Architecture hybride (OPTIMALE)

### Frontend → Vercel/Netlify (Gratuit)
- Déploiement automatique depuis GitHub
- CDN global
- SSL automatique

### Backend → Railway/Render
- Tous les microservices

### MongoDB → MongoDB Atlas (Gratuit)
- Cluster M0 gratuit (512MB)
- Suffisant pour développement/démo

### Redis → Upstash (Gratuit)
- 10,000 commandes/jour gratuites
- Ou optionnel (peut être retiré pour simplifier)

---

## 📋 Checklist de préparation

### 1. Préparer les variables d'environnement

Créer un fichier `.env.production` pour chaque service :

```env
# user-authentication/.env.production
NODE_ENV=production
PORT=3004
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/auth?retryWrites=true&w=majority
JWT_SECRET=<générer_un_secret_fort>
```

### 2. Adapter les URLs de services

Dans `api-gateway/src/app.js`, remplacer les URLs locales par les URLs de production :

```javascript
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'https://user-auth.railway.app',
    // ...
  },
  // ...
};
```

### 3. Configurer CORS

Dans chaque service, autoriser le domaine de production :

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://votre-app.vercel.app',
  credentials: true
}));
```

### 4. Build du frontend React

```bash
npm run build
# Le dossier build/ contient les fichiers statiques
```

---

## 🗄️ MongoDB Atlas (Gratuit)

### Étapes

1. **Créer un compte** : https://www.mongodb.com/cloud/atlas/register
2. **Créer un cluster M0** (gratuit)
3. **Configurer l'accès** :
   - Network Access : Autoriser 0.0.0.0/0 (tous les IPs)
   - Database Access : Créer un utilisateur
4. **Obtenir l'URL de connexion** :
   - Connect → Connect your application
   - Copier l'URL (remplacer <password> par le mot de passe)

### URL de connexion exemple :
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/auth?retryWrites=true&w=majority
```

---

## 🚀 Déploiement rapide avec Railway (Recommandé)

### 1. Préparer le projet

```bash
# Créer un fichier railway.json à la racine
```

### 2. Structure recommandée pour Railway

```
actu/
├── microservices/
│   ├── user-authentication/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   └── ...
└── railway.json
```

### 3. Variables d'environnement partagées

Dans Railway, créer des variables partagées :
- `MONGO_URL` : URL MongoDB Atlas
- `JWT_SECRET` : Secret JWT
- `FRONTEND_URL` : URL du frontend

---

## 📊 Comparaison des options

| Service | Gratuit | Limites | Facilité | Recommandation |
|---------|---------|---------|----------|----------------|
| **Railway** | $5 crédit/mois | Limité par crédit | ⭐⭐⭐⭐⭐ | ✅ Meilleur choix |
| **Render** | Oui | Spin down 15min | ⭐⭐⭐⭐ | ✅ Bon pour débuter |
| **Fly.io** | 3 VMs gratuites | Limité | ⭐⭐⭐ | ✅ Bon pour microservices |
| **Vercel** | Oui | Frontend uniquement | ⭐⭐⭐⭐⭐ | ✅ Pour React |
| **Netlify** | Oui | Frontend uniquement | ⭐⭐⭐⭐⭐ | ✅ Pour React |

---

## 🎯 Recommandation finale

**Pour commencer rapidement** :
1. **Frontend** → Vercel (gratuit, automatique)
2. **Backend** → Render (gratuit, simple)
3. **MongoDB** → MongoDB Atlas (gratuit)

**Pour une solution plus robuste** :
1. **Frontend** → Vercel
2. **Backend** → Railway ($5 crédit/mois)
3. **MongoDB** → MongoDB Atlas

---

## 🔧 Scripts utiles

### Vérifier les services avant déploiement

```bash
# Tester chaque service localement
cd microservices/user-authentication && npm start
cd microservices/user-preferences && npm start
# etc.
```

### Build pour production

```bash
# Frontend
npm run build

# Backend (vérifier que tout fonctionne)
NODE_ENV=production npm start
```

---

## 📝 Notes importantes

1. **Sécurité** :
   - Ne jamais commiter les secrets dans Git
   - Utiliser les variables d'environnement
   - Générer un JWT_SECRET fort

2. **Performance** :
   - Le plan gratuit peut être lent
   - Considérer un upgrade si nécessaire

3. **Monitoring** :
   - Utiliser les logs des plateformes
   - Ajouter des health checks

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs des services
2. Vérifier les variables d'environnement
3. Tester localement avec les mêmes variables
4. Consulter la documentation de la plateforme choisie




