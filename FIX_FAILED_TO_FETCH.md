# 🔧 Résolution : Erreur "Failed to fetch"

## 🎯 Problème

Le frontend affiche "Failed to fetch" quand il essaie de se connecter à l'API Gateway.

## 🔍 Causes possibles

### 1. Instance Render en "spin down" ⏰

Les instances gratuites Render s'arrêtent après 15 minutes d'inactivité et prennent 30-60 secondes pour redémarrer.

**Solution** :
- Attendre 30-60 secondes après la première requête
- Ou utiliser un service de "ping" pour garder l'instance active
- Ou passer à un plan payant

### 2. Configuration des URLs dans l'API Gateway 🔗

L'API Gateway utilise des noms Docker (`content-feed:3002`) qui ne fonctionnent pas sur Render. Il faut utiliser les URLs publiques.

**Solution** : Configurer les variables d'environnement dans Render pour l'API Gateway.

## ✅ Solution étape par étape

### Étape 1 : Vérifier que l'API Gateway répond

Ouvre dans ton navigateur :
```
https://api-gateway-ydpu.onrender.com/health
```

**Si ça ne fonctionne pas** :
- Attendre 30-60 secondes (instance en spin down)
- Vérifier que le service est actif sur Render

### Étape 2 : Configurer les URLs des services dans Render

Sur Render, l'API Gateway doit connaître les URLs publiques des autres services.

1. **Aller sur Render** → **api-gateway** → **Settings** → **Environment**
2. **Ajouter ces variables d'environnement** (remplace par tes vraies URLs) :

```env
AUTH_SERVICE_URL=https://user-authentication.onrender.com
PREFERENCES_SERVICE_URL=https://user-preferences.onrender.com
FEED_SERVICE_URL=https://content-feed.onrender.com
RECOMMENDATION_SERVICE_URL=https://content-recommendation.onrender.com
CATEGORIES_SERVICE_URL=https://content-categories.onrender.com
```

3. **Sauvegarder** et **redéployer** l'API Gateway

### Étape 3 : Trouver les URLs publiques de tes services

Pour chaque service sur Render :

1. **Cliquer sur le service** (ex: `content-feed`)
2. **Regarder la section "Service Information"**
3. **Copier la "Public URL"** (format : `https://content-feed-xxxxx.onrender.com`)

### Étape 4 : Tester l'endpoint feed

Après avoir configuré les URLs, teste directement :

```
https://api-gateway-ydpu.onrender.com/api/feed/general?limit=5
```

**Résultat attendu** : JSON avec un tableau `feed` contenant des articles

### Étape 5 : Vérifier CORS

Si tu vois toujours une erreur, vérifie CORS :

1. **Ouvrir la console du navigateur** (F12) sur ton site Vercel
2. **Regarder les erreurs**
3. **Si tu vois une erreur CORS** :
   - Les services Render doivent être redéployés avec la nouvelle configuration CORS
   - Ou temporairement autoriser toutes les origines

## 🧪 Tests rapides

### Test 1 : Health check de l'API Gateway

```bash
curl https://api-gateway-ydpu.onrender.com/health
```

### Test 2 : Info de l'API Gateway

```bash
curl https://api-gateway-ydpu.onrender.com/api/info
```

### Test 3 : Feed général

```bash
curl https://api-gateway-ydpu.onrender.com/api/feed/general?limit=5
```

### Test 4 : Service content-feed directement

```bash
curl https://content-feed.onrender.com/health
```

## 📋 Checklist

- [ ] L'API Gateway répond à `/health`
- [ ] Les URLs des services sont configurées dans Render (API Gateway → Environment)
- [ ] L'endpoint `/api/feed/general` fonctionne directement
- [ ] Pas d'erreur CORS dans la console du navigateur
- [ ] Les services Render sont actifs (pas en "spin down")
- [ ] Les variables d'environnement sont correctes dans Vercel (`REACT_APP_API_GATEWAY_URL`)

## 🎯 Solution rapide (temporaire)

Si tu veux tester rapidement sans configurer toutes les URLs :

1. **Modifier temporairement le frontend** pour appeler directement le service `content-feed` :

```javascript
// Dans src/config.js, changer temporairement :
API_GATEWAY_URL: process.env.REACT_APP_FEED_SERVICE_URL || 'https://content-feed.onrender.com'
```

2. **Modifier App.js** pour utiliser directement `/api/feed/general` au lieu de passer par l'API Gateway

⚠️ **Note** : C'est une solution temporaire pour tester. En production, utilise l'API Gateway.

## 🔄 Redéploiement

Après avoir modifié les variables d'environnement dans Render :

1. **Aller sur Render** → **api-gateway** → **Manual Deploy**
2. **Sélectionner "Clear build cache & deploy"**
3. **Attendre le redéploiement** (2-3 minutes)

## 💡 Astuce : Garder l'instance active

Pour éviter le "spin down" :

1. Utiliser un service comme **UptimeRobot** (gratuit) pour faire un ping toutes les 5 minutes
2. Configurer un webhook qui appelle `/health` régulièrement
3. Ou passer à un plan payant Render



