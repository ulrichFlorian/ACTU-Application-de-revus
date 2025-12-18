# 🚂 Démarrage rapide Railway - Guide simplifié

## ⚡ Procédure en 5 étapes

### 1️⃣ Créer un compte et projet

1. Aller sur **https://railway.app**
2. **"Login with GitHub"**
3. **"New Project"** → **"Empty Project"**

---

### 2️⃣ Déployer MongoDB

1. Dans le projet, **"+ New"** → **"Database"** → **"MongoDB"**
2. Cliquer sur MongoDB → **"Variables"**
3. **Copier `MONGO_URL`** (ex: `mongodb://mongo:27017/railway`)

---

### 3️⃣ Déployer les microservices

Pour **chaque service** (user-authentication, user-preferences, etc.) :

1. **"+ New"** → **"GitHub Repo"**
2. Sélectionner ton repo
3. **Root Directory** : `microservices/nom-du-service`
   - Exemple : `microservices/user-authentication`
4. Railway détecte le Dockerfile automatiquement
5. **"Deploy"**

**Répéter pour chaque service** :
- `microservices/user-authentication`
- `microservices/user-preferences`
- `microservices/content-feed`
- `microservices/content-recommendation`
- `microservices/content-categories`
- `microservices/api-gateway`

---

### 4️⃣ Configurer les variables d'environnement

Pour **chaque service**, ajouter les variables :

#### user-authentication
```
NODE_ENV=production
PORT=3004
DATABASE_URL=<MONGO_URL>/auth
JWT_SECRET=<générer_un_secret>
```

#### user-preferences
```
NODE_ENV=production
PORT=3001
DATABASE_URL=<MONGO_URL>/user-preferences
```

#### content-feed
```
NODE_ENV=production
PORT=3002
PREFERENCES_SERVICE_URL=http://user-preferences:3001
CATEGORIES_SERVICE_URL=http://content-categories:3005
GNEWS_API_KEY=cb246a4da7dc041b6020dd5f7a16db88
AFRICA_NEWS_API_KEY=ae0ec8709fc34dd0b5efeb425aef953e
```

#### api-gateway
```
NODE_ENV=production
PORT=3000
AUTH_SERVICE_URL=http://user-authentication:3004
PREFERENCES_SERVICE_URL=http://user-preferences:3001
FEED_SERVICE_URL=http://content-feed:3002
RECOMMENDATION_SERVICE_URL=http://content-recommendation:3003
CATEGORIES_SERVICE_URL=http://content-categories:3005
```

**Comment ajouter les variables** :
1. Cliquer sur le service
2. Onglet **"Variables"**
3. **"+ New Variable"**
4. Entrer le nom et la valeur
5. Sauvegarder

---

### 5️⃣ Obtenir les URLs publiques

Pour chaque service :

1. Cliquer sur le service
2. **"Settings"** → **"Networking"**
3. Activer **"Generate Domain"**
4. **Copier l'URL** générée (ex: `user-auth.up.railway.app`)

---

## ✅ Vérification

Tester chaque service :
```
https://user-auth.up.railway.app/health
https://user-prefs.up.railway.app/health
https://content-feed.up.railway.app/health
```

---

## 🔄 Déploiement automatique

Une fois configuré, Railway déploie automatiquement quand tu pushes sur GitHub :
```bash
git add .
git commit -m "Mise à jour"
git push origin main
```

---

## 📝 Checklist

- [ ] Compte Railway créé
- [ ] MongoDB déployé
- [ ] 6 microservices déployés
- [ ] Variables d'environnement configurées
- [ ] URLs publiques générées
- [ ] Health checks OK

---

## 🆘 Problèmes courants

**Service ne démarre pas** → Vérifier les logs dans Railway  
**Erreur MongoDB** → Vérifier l'URL dans DATABASE_URL  
**Services ne communiquent pas** → Vérifier les noms de services dans les variables

---

## 📚 Guide complet

Pour plus de détails, voir **RAILWAY_GUIDE.md**


