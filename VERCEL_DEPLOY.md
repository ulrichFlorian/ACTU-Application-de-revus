# 🚀 Guide complet : Déployer le Frontend sur Vercel

## ⚠️ Important à savoir

**Vercel héberge uniquement le FRONTEND React**, pas les microservices backend.

**Architecture** :
- ✅ **Frontend React** → Vercel
- ✅ **Microservices backend** → Railway/Render (séparément)

---

## 📋 Prérequis

- ✅ Projet React dans le dossier `src/`
- ✅ Script `build` dans `package.json` (déjà présent)
- ✅ Compte GitHub avec le projet
- ✅ Compte Vercel (gratuit) : https://vercel.com

---

## 🎯 Méthode 1 : Déploiement via l'interface web (RECOMMANDÉ)

### Étape 1 : Créer un compte Vercel

1. Aller sur **https://vercel.com**
2. Cliquer sur **"Sign Up"**
3. Choisir **"Continue with GitHub"**
4. Autoriser Vercel à accéder à ton compte GitHub

### Étape 2 : Importer le projet

1. Dans le dashboard Vercel, cliquer sur **"Add New..."** → **"Project"**
2. Sélectionner ton repo GitHub (`actu`)
3. Vercel détecte automatiquement que c'est un projet React

### Étape 3 : Configurer le projet

Vercel détecte automatiquement :
- **Framework Preset** : Create React App
- **Root Directory** : `/` (racine)
- **Build Command** : `npm run build`
- **Output Directory** : `build`

**Si besoin de modifier** :
- Cliquer sur **"Settings"** → **"General"**
- Vérifier les configurations ci-dessus

### Étape 4 : Configurer les variables d'environnement

1. Avant de déployer, cliquer sur **"Environment Variables"**
2. Ajouter les variables :

```
REACT_APP_API_URL=https://api-gateway.up.railway.app
REACT_APP_GNEWS_API_KEY=46e7bad378365fc3f21ef1432bfe1a61
```

**Note** : Remplace `https://api-gateway.up.railway.app` par l'URL réelle de ton API Gateway une fois déployé sur Railway.

### Étape 5 : Déployer

1. Cliquer sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances (`npm install`)
   - Builder le projet (`npm run build`)
   - Déployer les fichiers statiques
3. Attendre la fin du déploiement (2-3 minutes)

### Étape 6 : Obtenir l'URL

Une fois déployé, Vercel génère automatiquement une URL :
```
https://actu-xxxxx.vercel.app
```

Tu peux aussi configurer un domaine personnalisé dans **Settings** → **Domains**.

---

## 🖥️ Méthode 2 : Déploiement via CLI

### Étape 1 : Installer Vercel CLI

```bash
npm i -g vercel
```

### Étape 2 : Se connecter

```bash
vercel login
```

### Étape 3 : Déployer

```bash
# Dans le dossier racine du projet
cd /home/ulrichakongo/Documents/actu
vercel
```

Suivre les instructions :
- Link to existing project? → **No** (première fois)
- Project name? → **actu** (ou laisser par défaut)
- Directory? → **./** (racine)
- Override settings? → **No**

### Étape 4 : Déployer en production

```bash
vercel --prod
```

---

## ⚙️ Configuration avancée

### Fichier vercel.json

Le fichier `vercel.json` est déjà configuré. Il définit :
- Le build command
- Les routes (SPA routing)
- Le cache des assets statiques

### Variables d'environnement

Dans Vercel, tu peux définir des variables pour :
- **Production** : Variables pour la production
- **Preview** : Variables pour les previews (branches)
- **Development** : Variables pour le développement local

**Comment ajouter** :
1. Projet → **Settings** → **Environment Variables**
2. **Add New**
3. Entrer le nom et la valeur
4. Sélectionner les environnements (Production, Preview, Development)

---

## 🔗 Configurer le Frontend pour utiliser les APIs

### Modifier src/App.js

Assure-toi que le frontend utilise l'URL de l'API Gateway :

```javascript
// Dans src/App.js ou un fichier de configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Utiliser pour les appels API
fetch(`${API_URL}/api/auth/login`, { ... })
```

### Exemple de configuration

Créer un fichier `src/config.js` :

```javascript
const config = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  AUTH_URL: process.env.REACT_APP_AUTH_URL || 'http://localhost:3004',
  PREFERENCES_URL: process.env.REACT_APP_PREFERENCES_URL || 'http://localhost:3001',
};

export default config;
```

---

## 🔄 Déploiement automatique

Vercel déploie automatiquement quand tu pushes sur GitHub :

1. **Modifier le code** localement
2. **Commit et push** :
   ```bash
   git add .
   git commit -m "Mise à jour frontend"
   git push origin main
   ```
3. **Vercel détecte** automatiquement le changement
4. **Redéploie** automatiquement
5. **Preview** : Chaque push crée une preview URL pour tester

---

## 🌐 URLs et domaines

### URL par défaut

Vercel génère automatiquement :
```
https://actu-xxxxx.vercel.app
```

### Domaine personnalisé

1. **Settings** → **Domains**
2. Entrer ton domaine (ex: `actu-app.com`)
3. Suivre les instructions DNS
4. Vercel configure automatiquement HTTPS

---

## 🔧 Configuration CORS dans les microservices

Pour que le frontend Vercel puisse communiquer avec les APIs, configurer CORS :

### Dans chaque microservice (user-authentication, etc.)

```javascript
// src/app.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://actu-xxxxx.vercel.app',  // URL Vercel
    'https://ton-domaine.vercel.app'  // Domaine personnalisé
  ],
  credentials: true
}));
```

---

## 📊 Vérification du déploiement

### 1. Vérifier que le build fonctionne

Dans Vercel, onglet **"Deployments"** :
- ✅ Build réussi (vert)
- ❌ Build échoué (rouge) → Voir les logs

### 2. Tester l'URL

1. Ouvrir l'URL Vercel dans le navigateur
2. Vérifier que l'application se charge
3. Tester les fonctionnalités

### 3. Vérifier les logs

Dans Vercel :
- **Deployments** → Cliquer sur un déploiement
- Voir les **Build Logs** et **Runtime Logs**

---

## 🆘 Résolution de problèmes

### Build échoue

**Erreur** : `npm run build` échoue

**Solution** :
1. Vérifier les logs dans Vercel
2. Tester localement : `npm run build`
3. Vérifier les erreurs de syntaxe
4. Vérifier les dépendances dans `package.json`

### Variables d'environnement non disponibles

**Erreur** : `process.env.REACT_APP_API_URL` est `undefined`

**Solution** :
1. Vérifier que les variables commencent par `REACT_APP_`
2. Redéployer après avoir ajouté les variables
3. Les variables sont injectées au build time

### Erreurs CORS

**Erreur** : `Access to fetch blocked by CORS policy`

**Solution** :
1. Ajouter l'URL Vercel dans la configuration CORS des microservices
2. Vérifier que `credentials: true` est configuré
3. Redéployer les microservices

### Page blanche

**Erreur** : Page s'affiche mais reste blanche

**Solution** :
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Vérifier que les assets sont chargés correctement
4. Vérifier les routes dans `vercel.json`

---

## 📝 Checklist de déploiement

- [ ] Compte Vercel créé
- [ ] Projet importé depuis GitHub
- [ ] Variables d'environnement configurées
- [ ] Build réussi
- [ ] URL accessible
- [ ] CORS configuré dans les microservices
- [ ] Frontend communique avec les APIs
- [ ] Déploiement automatique activé

---

## 🎯 Architecture finale

```
Frontend React (Vercel)
    ↓ HTTPS
API Gateway (Railway)
    ↓ Réseau interne
Microservices (Railway)
    ↓
MongoDB (Railway/Atlas)
```

---

## 💡 Astuces

### Preview URLs

Chaque push sur une branche crée une **Preview URL** :
- Parfait pour tester avant de merger
- URL unique par branche
- Variables d'environnement de preview

### Analytics

Vercel propose des analytics gratuits :
- **Settings** → **Analytics**
- Voir les performances
- Voir les erreurs

### Optimisations automatiques

Vercel optimise automatiquement :
- ✅ Images optimisées
- ✅ Code minifié
- ✅ CDN global
- ✅ Cache intelligent

---

## 📚 Ressources

- Documentation Vercel : https://vercel.com/docs
- Support : https://vercel.com/support

---

## 🚀 Démarrage rapide (résumé)

1. Aller sur **https://vercel.com**
2. **"Add New Project"** → Sélectionner le repo GitHub
3. Configurer les variables d'environnement
4. **"Deploy"**
5. ✅ Application en ligne !

