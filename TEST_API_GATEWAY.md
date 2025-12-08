# 🔍 Test de l'API Gateway

## Problème : "Failed to fetch"

L'erreur "Failed to fetch" peut avoir plusieurs causes. Testons étape par étape.

## ✅ Tests à effectuer

### Test 1 : Vérifier que l'API Gateway répond

Ouvre dans ton navigateur :
```
https://api-gateway-ydpu.onrender.com/health
```

**Résultat attendu** : JSON avec `"status": "OK"`

Si ça ne fonctionne pas :
- L'instance Render est peut-être en "spin down" (attendre 30-60 secondes)
- Le service n'est peut-être pas démarré

### Test 2 : Vérifier l'endpoint /api/info

Ouvre dans ton navigateur :
```
https://api-gateway-ydpu.onrender.com/api/info
```

**Résultat attendu** : JSON listant les endpoints disponibles

### Test 3 : Tester l'endpoint feed directement

Ouvre dans ton navigateur :
```
https://api-gateway-ydpu.onrender.com/api/feed/general?limit=5
```

**Résultat attendu** : JSON avec un tableau `feed` contenant des articles

Si ça ne fonctionne pas :
- Le service `content-feed` n'est peut-être pas accessible depuis l'API Gateway
- Vérifier les logs de l'API Gateway sur Render

### Test 4 : Vérifier CORS

Ouvre la console du navigateur (F12) sur ton site Vercel et regarde les erreurs.

Si tu vois une erreur CORS :
- Les services Render doivent être redéployés avec la nouvelle configuration CORS
- Ou temporairement autoriser toutes les origines

## 🔧 Solutions possibles

### Solution 1 : Instance Render en "spin down"

Les instances gratuites Render s'arrêtent après 15 minutes d'inactivité.

**Solution** :
1. Attendre 30-60 secondes après la première requête
2. Ou utiliser un service de "ping" pour garder l'instance active
3. Ou passer à un plan payant

### Solution 2 : Problème de routage dans l'API Gateway

L'API Gateway doit router `/api/feed/*` vers le service `content-feed`.

**Vérification** :
1. Aller sur Render → api-gateway → Logs
2. Faire une requête depuis le frontend
3. Regarder les logs pour voir si la requête arrive

### Solution 3 : Service content-feed non accessible

Le service `content-feed` doit être accessible depuis l'API Gateway.

**Vérification** :
1. Aller sur Render → content-feed → Logs
2. Vérifier que le service est démarré
3. Tester directement : `https://content-feed.onrender.com/health`

### Solution 4 : Erreur CORS

Si l'erreur est spécifiquement CORS :

1. **Vérifier que les services Render ont été redéployés** avec la nouvelle configuration CORS
2. **Ou temporairement autoriser toutes les origines** dans les services backend :

```javascript
app.use(cors({ origin: '*', credentials: true }));
```

## 🎯 Test rapide depuis le terminal

```bash
# Test 1 : Health check
curl https://api-gateway-ydpu.onrender.com/health

# Test 2 : Info
curl https://api-gateway-ydpu.onrender.com/api/info

# Test 3 : Feed général
curl https://api-gateway-ydpu.onrender.com/api/feed/general?limit=5
```

## 📋 Checklist de diagnostic

- [ ] L'API Gateway répond à `/health`
- [ ] L'API Gateway répond à `/api/info`
- [ ] L'endpoint `/api/feed/general` fonctionne directement
- [ ] Pas d'erreur CORS dans la console du navigateur
- [ ] Les services Render sont actifs (pas en "spin down")
- [ ] Les logs de l'API Gateway montrent les requêtes entrantes



