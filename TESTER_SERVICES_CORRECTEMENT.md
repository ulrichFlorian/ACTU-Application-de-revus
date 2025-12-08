# ✅ Comment Tester Correctement les Services Render

## 🎯 Problème : "Cannot GET /"

Quand tu cliques sur l'URL publique d'un service (ex: `https://content-recommendation.onrender.com`), tu vois **"Cannot GET /"**.

**C'EST NORMAL !** 🎉

Les services backend n'ont **pas de route pour la racine `/`**. Ils ont des routes spécifiques comme :
- `/health` - pour vérifier que le service fonctionne
- `/api/...` - pour les endpoints API

## ✅ Comment tester correctement

### Test 1 : Health Check (pour tous les services)

Au lieu d'aller sur `https://content-recommendation.onrender.com`, va sur :

```
https://content-recommendation.onrender.com/health
```

**Résultat attendu** : Tu dois voir du JSON comme :
```json
{
  "status": "OK",
  "service": "content-recommendation",
  "timestamp": "2025-11-29T..."
}
```

### Liste des endpoints à tester

#### Service 1 : user-authentication
```
https://user-authentication-9g16.onrender.com/health
```

#### Service 2 : user-preferences
```
https://user-preferences.onrender.com/health
```

#### Service 3 : content-feed
```
https://content-feed.onrender.com/health
```

#### Service 4 : content-recommendation
```
https://content-recommendation.onrender.com/health
```

#### Service 5 : content-categories
```
https://content-categories.onrender.com/health
```

#### Service 6 : api-gateway
```
https://api-gateway-ydpu.onrender.com/health
```

## 🔍 Si `/health` ne fonctionne pas

### Option 1 : Le service est en "spin down"

**Symptôme** : La page charge longtemps (30-60 secondes) puis affiche une erreur ou le JSON.

**Solution** : 
- Attends 30-60 secondes après la première requête
- Réessaie - la deuxième requête sera rapide

### Option 2 : Le service n'a pas de route `/health`

**Symptôme** : "Cannot GET /health" ou erreur 404.

**Solution** : 
- Vérifie les logs du service sur Render
- Le service doit avoir une route `/health` dans son code

### Option 3 : Le service crash au démarrage

**Symptôme** : Erreur 500 ou page blanche.

**Solution** :
- Regarde les logs du service sur Render
- Vérifie qu'il n'y a pas d'erreurs de démarrage

## 📋 Checklist de test

Pour chaque service, teste :

- [ ] `/health` retourne du JSON avec `"status": "OK"`
- [ ] Le service répond en moins de 5 secondes (après le premier démarrage)
- [ ] Pas d'erreur 500 dans les logs

## 🎯 Pour l'API Gateway

L'API Gateway n'a pas besoin que les services répondent à `/`. Il a juste besoin que :
1. ✅ Les services soient accessibles via leurs URLs publiques
2. ✅ Les services répondent aux endpoints spécifiques (ex: `/api/feed/general`)
3. ✅ Les URLs dans les variables d'environnement sont correctes

## ✅ Test complet de l'API Gateway

### Test 1 : Health check de l'API Gateway
```
https://api-gateway-ydpu.onrender.com/health
```

**Résultat attendu** : JSON listant tous les services et leur statut

### Test 2 : Endpoint feed via l'API Gateway
```
https://api-gateway-ydpu.onrender.com/api/feed/general?limit=5
```

**Résultat attendu** : JSON avec un tableau `feed` contenant des articles

### Test 3 : Info de l'API Gateway
```
https://api-gateway-ydpu.onrender.com/api/info
```

**Résultat attendu** : JSON avec les informations sur l'API Gateway

## 💡 Résumé

- ❌ **Ne teste PAS** : `https://service.onrender.com` (tu auras "Cannot GET /")
- ✅ **Teste** : `https://service.onrender.com/health` (tu auras du JSON)
- ✅ **Pour l'API Gateway** : Les URLs dans les variables d'environnement doivent être les URLs publiques (même si elles affichent "Cannot GET /" à la racine)

L'important est que les services répondent aux endpoints spécifiques (`/health`, `/api/...`), pas à la racine `/`.

