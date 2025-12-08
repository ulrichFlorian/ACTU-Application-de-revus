# 🚀 Déploiement du Frontend sur Vercel

## 📋 Vue d'ensemble

Ce guide explique comment déployer le frontend React sur Vercel et le connecter aux services backend déployés sur Render.

## 🏗️ Architecture

```
Frontend (React)     → Vercel (gratuit)
Backend (7 services) → Render (gratuit)
MongoDB              → MongoDB Atlas (gratuit)
Redis                → Upstash (gratuit) ou Render
```

## ✅ Prérequis

1. ✅ Backend déployé sur Render (7 services actifs)
2. ✅ Compte Vercel (gratuit)
3. ✅ Projet GitHub connecté à Vercel
4. ✅ URLs des services Render

## 📝 Étape 1 : Récupérer les URLs Render

Sur Render, chaque service a une URL publique. Note les URLs suivantes :

- **API Gateway** : `https://api-gateway.onrender.com` (ou similaire)
- **User Authentication** : `https://user-authentication.onrender.com`
- **User Preferences** : `https://user-preferences.onrender.com`
- **Content Feed** : `https://content-feed.onrender.com`
- **Content Recommendation** : `https://content-recommendation.onrender.com`
- **Content Categories** : `https://content-categories.onrender.com`

> 💡 **Astuce** : Les URLs Render suivent le format `https://[service-name].onrender.com`

## 📝 Étape 2 : Configurer les variables d'environnement dans Vercel

1. **Aller sur Vercel** : https://vercel.com
2. **Sélectionner ton projet** (ou créer un nouveau projet)
3. **Aller dans Settings → Environment Variables**
4. **Ajouter les variables suivantes** :

### Variables requises

```env
# URL de l'API Gateway (point d'entrée principal)
REACT_APP_API_GATEWAY_URL=https://api-gateway.onrender.com

# URLs des services individuels (optionnel, si appels directs)
REACT_APP_AUTH_SERVICE_URL=https://user-authentication.onrender.com
REACT_APP_PREFERENCES_SERVICE_URL=https://user-preferences.onrender.com
REACT_APP_FEED_SERVICE_URL=https://content-feed.onrender.com
REACT_APP_RECOMMENDATION_SERVICE_URL=https://content-recommendation.onrender.com
REACT_APP_CATEGORIES_SERVICE_URL=https://content-categories.onrender.com

# Clé API GNews (si nécessaire pour le frontend)
REACT_APP_GNEWS_API_KEY=46e7bad378365fc3f21ef1432bfe1a61
```

> ⚠️ **Important** : Remplace les URLs par tes vraies URLs Render !

### Configuration des environnements

- **Production** : ✅ Cocher
- **Preview** : ✅ Cocher (pour les branches de test)
- **Development** : Optionnel

## 📝 Étape 3 : Configurer CORS dans les services Render

Les services backend doivent autoriser les requêtes depuis le domaine Vercel.

### Option 1 : Mettre à jour la configuration CORS (recommandé)

Dans chaque service backend, mettre à jour la configuration CORS pour autoriser le domaine Vercel :

**Exemple pour `user-authentication/src/app.js`** :

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL, // URL Vercel
  'https://ton-app.vercel.app', // Remplace par ton URL Vercel
  'https://*.vercel.app' // Autoriser tous les sous-domaines Vercel
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Option 2 : CORS ouvert (développement uniquement)

Pour tester rapidement, tu peux temporairement autoriser toutes les origines :

```javascript
app.use(cors({
  origin: '*', // ⚠️ À remplacer en production par des origines spécifiques
  credentials: true
}));
```

> ⚠️ **Sécurité** : En production, limite les origines autorisées !

## 📝 Étape 4 : Déployer sur Vercel

### Méthode 1 : Via l'interface Vercel (recommandé)

1. **Aller sur** https://vercel.com
2. **Cliquer sur "Add New Project"**
3. **Importer ton repository GitHub**
4. **Configurer le projet** :
   - **Framework Preset** : Create React App
   - **Root Directory** : `/` (racine)
   - **Build Command** : `npm run build`
   - **Output Directory** : `build`
5. **Ajouter les variables d'environnement** (voir Étape 2)
6. **Cliquer sur "Deploy"**

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

## 📝 Étape 5 : Vérifier le déploiement

1. **Attendre la fin du build** (2-3 minutes)
2. **Ouvrir l'URL Vercel** (ex: `https://ton-app.vercel.app`)
3. **Vérifier que le frontend se charge**
4. **Tester la recherche d'articles**
5. **Vérifier la console du navigateur** pour les erreurs CORS

## 🔧 Dépannage

### Erreur CORS

**Symptôme** : `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution** :
1. Vérifier que les services Render autorisent le domaine Vercel
2. Vérifier que `credentials: true` est configuré côté backend
3. Vérifier que les headers sont corrects

### Erreur 404 sur les API

**Symptôme** : `Failed to fetch` ou `404 Not Found`

**Solution** :
1. Vérifier que les URLs dans les variables d'environnement Vercel sont correctes
2. Vérifier que les services Render sont actifs
3. Tester les endpoints directement dans le navigateur (ex: `https://api-gateway.onrender.com/health`)

### Variables d'environnement non chargées

**Symptôme** : Les variables `process.env.REACT_APP_*` sont `undefined`

**Solution** :
1. Vérifier que les variables commencent par `REACT_APP_`
2. Redéployer après avoir ajouté les variables
3. Vérifier que les variables sont configurées pour "Production"

### Build échoue

**Symptôme** : Erreur lors du build Vercel

**Solution** :
1. Vérifier les logs de build dans Vercel
2. Tester le build localement : `npm run build`
3. Vérifier que `package.json` contient le script `build`

## 📊 Structure finale

```
Frontend (Vercel)
    ↓ HTTPS
    ↓ Requête HTTP
API Gateway (Render)
    ↓ Routage
    ↓
Services Backend (Render)
    ↓ Traitement
    ↓ Retourne la réponse
Frontend (Vercel)
    ↓ Affiche les données
```

## 🔗 URLs de production

- **Frontend** : `https://ton-app.vercel.app`
- **API Gateway** : `https://api-gateway.onrender.com`
- **Health Check** : `https://api-gateway.onrender.com/health`

## ✅ Checklist de déploiement

- [ ] Backend déployé sur Render (7 services actifs)
- [ ] URLs Render notées
- [ ] Variables d'environnement configurées dans Vercel
- [ ] CORS configuré dans les services backend
- [ ] Frontend déployé sur Vercel
- [ ] Test de connexion frontend → backend réussi
- [ ] Recherche d'articles fonctionnelle
- [ ] Pas d'erreurs CORS dans la console

## 🎉 C'est tout !

Ton frontend est maintenant déployé sur Vercel et communique avec les services backend sur Render !



