# 🚂 Guide complet : Héberger sur Railway

## 📋 Prérequis

- ✅ Compte GitHub avec ton projet
- ✅ Compte Railway (gratuit) : https://railway.app
- ✅ Projet prêt avec Dockerfiles

---

## 🎯 Étape 1 : Créer un compte Railway

1. Aller sur **https://railway.app**
2. Cliquer sur **"Start a New Project"** ou **"Login"**
3. Choisir **"Login with GitHub"**
4. Autoriser Railway à accéder à ton compte GitHub

---

## 🗄️ Étape 2 : Déployer MongoDB

1. Dans Railway, cliquer sur **"New Project"**
2. Choisir **"Empty Project"** ou **"Deploy from GitHub repo"**
3. Dans le projet, cliquer sur **"+ New"**
4. Sélectionner **"Database"** → **"MongoDB"**
5. Railway crée automatiquement une base MongoDB
6. **Copier l'URL de connexion** :
   - Cliquer sur MongoDB
   - Onglet **"Variables"**
   - Copier `MONGO_URL` ou `DATABASE_URL`

**Exemple d'URL** :
```
mongodb://mongo:27017/railway
```

---

## 🔐 Étape 3 : Générer un JWT_SECRET

```bash
# Dans ton terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copier le résultat** (ex: `a1b2c3d4e5f6...`) - Tu en auras besoin plus tard.

---

## 🚀 Étape 4 : Déployer les microservices

### 4.1 Déployer user-authentication

1. Dans le projet Railway, cliquer sur **"+ New"**
2. Sélectionner **"GitHub Repo"**
3. Choisir ton repo GitHub
4. Railway demande le **"Root Directory"** :
   - Entrer : `microservices/user-authentication`
5. Railway détecte automatiquement le Dockerfile
6. Cliquer sur **"Deploy"**

**Configurer les variables d'environnement** :
- Cliquer sur le service `user-authentication`
- Onglet **"Variables"**
- Ajouter :
  ```
  NODE_ENV=production
  PORT=3004
  DATABASE_URL=<URL_MongoDB_copiée_plus_tôt>/auth
  JWT_SECRET=<secret_généré_plus_tôt>
  ```

### 4.2 Déployer user-preferences

1. **"+ New"** → **"GitHub Repo"**
2. Même repo GitHub
3. **Root Directory** : `microservices/user-preferences`
4. **Variables d'environnement** :
  ```
  NODE_ENV=production
  PORT=3001
  DATABASE_URL=<URL_MongoDB>/user-preferences
  ```

### 4.3 Déployer content-feed

1. **"+ New"** → **"GitHub Repo"**
2. **Root Directory** : `microservices/content-feed`
3. **Variables d'environnement** :
  ```
  NODE_ENV=production
  PORT=3002
  PREFERENCES_SERVICE_URL=http://user-preferences:3001
  CATEGORIES_SERVICE_URL=http://content-categories:3005
  RECOMMENDATION_SERVICE_URL=http://content-recommendation:3003
  GNEWS_API_KEY=46e7bad378365fc3f21ef1432bfe1a61
  AFRICA_NEWS_API_KEY=ae0ec8709fc34dd0b5efeb425aef953e
  REDIS_HOST=redis
  REDIS_PORT=6379
  REDIS_URL=redis://redis:6379
  ```

### 4.4 Déployer content-recommendation

1. **"+ New"** → **"GitHub Repo"**
2. **Root Directory** : `microservices/content-recommendation`
3. **Variables d'environnement** :
  ```
  NODE_ENV=production
  PORT=3003
  DATABASE_URL=<URL_MongoDB>/recommendations
  PREFERENCES_SERVICE_URL=http://user-preferences:3001
  ```

### 4.5 Déployer content-categories

1. **"+ New"** → **"GitHub Repo"**
2. **Root Directory** : `microservices/content-categories`
3. **Variables d'environnement** :
  ```
  NODE_ENV=production
  PORT=3005
  DATABASE_URL=<URL_MongoDB>/categories
  ```

### 4.6 Déployer api-gateway

1. **"+ New"** → **"GitHub Repo"**
2. **Root Directory** : `microservices/api-gateway`
3. **Variables d'environnement** :
  ```
  NODE_ENV=production
  PORT=3000
  AUTH_SERVICE_URL=http://user-authentication:3004
  PREFERENCES_SERVICE_URL=http://user-preferences:3001
  FEED_SERVICE_URL=http://content-feed:3002
  RECOMMENDATION_SERVICE_URL=http://content-recommendation:3003
  CATEGORIES_SERVICE_URL=http://content-categories:3005
  ```

### 4.7 Déployer Redis (optionnel)

1. **"+ New"** → **"Database"** → **"Redis"**
2. Railway crée automatiquement Redis
3. Les autres services peuvent y accéder via `redis://redis:6379`

---

## 🌐 Étape 5 : Obtenir les URLs publiques

Pour chaque service déployé :

1. Cliquer sur le service
2. Onglet **"Settings"**
3. Section **"Networking"**
4. Activer **"Generate Domain"**
5. Railway génère une URL publique (ex: `user-auth.up.railway.app`)

**Copier toutes les URLs** pour les utiliser dans le frontend.

---

## 🔗 Étape 6 : Configurer les URLs entre services

### Dans Railway, les services communiquent via leurs noms

Railway crée automatiquement un réseau interne. Les services peuvent communiquer via :
- **Nom du service** : `http://user-authentication:3004`
- **URL publique** : `https://user-auth.up.railway.app`

### Pour l'API Gateway

Dans `api-gateway/src/app.js`, utiliser les noms de services :
```javascript
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://user-authentication:3004',
    // ...
  },
  // ...
};
```

---

## ✅ Étape 7 : Vérifier le déploiement

### Pour chaque service

1. Cliquer sur le service
2. Onglet **"Deployments"** → Voir les logs
3. Vérifier qu'il n'y a pas d'erreurs
4. Tester l'URL publique : `https://service-name.up.railway.app/health`

### Test de santé

```bash
# Tester chaque service
curl https://user-auth.up.railway.app/health
curl https://user-prefs.up.railway.app/health
curl https://content-feed.up.railway.app/health
```

---

## 🔄 Étape 8 : Déploiement automatique

Railway déploie automatiquement quand tu pushes sur GitHub :

1. **Modifier le code** localement
2. **Commit et push** :
   ```bash
   git add .
   git commit -m "Mise à jour"
   git push origin main
   ```
3. **Railway détecte** automatiquement le changement
4. **Redéploie** automatiquement tous les services affectés

---

## 📊 Étape 9 : Monitoring et logs

### Voir les logs

1. Cliquer sur un service
2. Onglet **"Deployments"**
3. Cliquer sur le dernier déploiement
4. Voir les logs en temps réel

### Monitoring

- **Métriques** : CPU, RAM, Réseau
- **Logs** : Erreurs, console.log
- **Déploiements** : Historique des versions

---

## 🎨 Étape 10 : Déployer le Frontend (Vercel)

Le frontend React doit être déployé séparément sur Vercel :

1. Aller sur **https://vercel.com**
2. **"New Project"** → Connecter GitHub
3. Sélectionner le repo
4. **Root Directory** : `/` (racine)
5. **Build Command** : `npm run build`
6. **Output Directory** : `build`
7. **Variables d'environnement** :
   ```
   REACT_APP_API_URL=https://api-gateway.up.railway.app
   ```

---

## 🔧 Configuration CORS

Dans chaque service, autoriser le domaine Vercel :

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ton-app.vercel.app'
  ],
  credentials: true
}));
```

---

## 📝 Checklist finale

- [ ] MongoDB déployé et URL copiée
- [ ] JWT_SECRET généré
- [ ] Tous les microservices déployés
- [ ] Variables d'environnement configurées
- [ ] URLs publiques générées
- [ ] Health checks fonctionnent
- [ ] Frontend déployé sur Vercel
- [ ] CORS configuré
- [ ] Communication entre services testée

---

## 🆘 Résolution de problèmes

### Service ne démarre pas

1. Vérifier les logs dans Railway
2. Vérifier les variables d'environnement
3. Vérifier que le Dockerfile est correct

### Erreur de connexion MongoDB

1. Vérifier l'URL MongoDB
2. Vérifier que MongoDB est démarré
3. Vérifier les permissions

### Services ne communiquent pas

1. Vérifier les noms de services (doivent correspondre)
2. Vérifier les variables d'environnement
3. Vérifier que tous les services sont déployés

---

## 💰 Coût estimé

- **Gratuit** : $5 crédit/mois
- **Suffisant pour** : 6-7 services tournant 24/7
- **Après crédit** : ~$5-10/mois selon usage

---

## 🎯 URLs finales

Une fois tout déployé, tu auras :

```
Frontend          : https://ton-app.vercel.app
API Gateway       : https://api-gateway.up.railway.app
Authentication    : https://user-auth.up.railway.app
Preferences       : https://user-prefs.up.railway.app
Content Feed      : https://content-feed.up.railway.app
Recommendation    : https://recommendation.up.railway.app
Categories        : https://categories.up.railway.app
```

---

## 📚 Ressources

- Documentation Railway : https://docs.railway.app
- Support : https://railway.app/discord

