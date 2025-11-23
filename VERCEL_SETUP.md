# Configuration Vercel pour le Frontend

## 🚀 Déploiement du Frontend React sur Vercel

### Étapes

1. **Installer Vercel CLI** (optionnel) :
```bash
npm i -g vercel
```

2. **Se connecter à Vercel** :
```bash
vercel login
```

3. **Déployer depuis le terminal** :
```bash
# Dans le dossier racine du projet
vercel
```

4. **Ou déployer depuis GitHub** (recommandé) :
   - Aller sur https://vercel.com
   - Connecter GitHub
   - Importer le repo
   - Vercel détecte automatiquement React
   - Configurer :
     - **Root Directory** : `/` (racine)
     - **Build Command** : `npm run build`
     - **Output Directory** : `build`

### Variables d'environnement

Dans Vercel, ajouter les variables d'environnement :

```env
REACT_APP_API_URL=https://votre-api-gateway.railway.app
# ou
REACT_APP_API_URL=https://votre-api-gateway.render.com
```

### Configuration du Frontend

Dans `src/App.js` ou où tu appelles les APIs, utiliser :

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

## ⚠️ Important

- **Frontend uniquement** : Vercel héberge seulement le frontend React
- **Backend séparé** : Les microservices doivent être hébergés sur Railway/Render
- **CORS** : Configurer CORS dans les microservices pour autoriser le domaine Vercel

### Exemple de configuration CORS dans les microservices :

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://votre-app.vercel.app'
  ],
  credentials: true
}));
```

## 📊 Architecture finale

```
Frontend (React)     → Vercel (gratuit)
Backend (6 services) → Railway/Render (gratuit)
MongoDB              → MongoDB Atlas (gratuit)
Redis                → Upstash (gratuit) ou optionnel
```

## 🔗 URLs de production

- Frontend : `https://votre-app.vercel.app`
- API Gateway : `https://api-gateway.railway.app`
- Services individuels : `https://user-auth.railway.app`, etc.


