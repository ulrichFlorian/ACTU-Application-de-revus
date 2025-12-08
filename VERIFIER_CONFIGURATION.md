# 🔍 Vérifier la Configuration - Guide de Dépannage

## 🎯 Problème actuel

Tu as configuré les variables d'environnement dans l'API Gateway, mais ça ne fonctionne toujours pas. Vérifions étape par étape.

## ✅ Étape 1 : Vérifier que les URLs sont correctes dans Render

### Actions à faire :

1. **Sur Render**, va dans **api-gateway** → **Settings** → **Environment**

2. **Vérifie CHAQUE variable** et assure-toi que :
   - ✅ L'URL commence par **`https://`** (pas `http://`)
   - ✅ L'URL se termine par **`.onrender.com`**
   - ✅ Il n'y a **PAS de port** à la fin (pas de `:3004`, `:3002`, etc.)

### ❌ Exemples d'URLs INCORRECTES :
```
http://user-authentication:3004          ❌ (Docker local)
http://user-authentication.onrender.com  ❌ (http au lieu de https)
https://user-authentication:3004         ❌ (port à la fin)
```

### ✅ Exemples d'URLs CORRECTES :
```
https://user-authentication-9g16.onrender.com     ✅
https://user-preferences.onrender.com            ✅
https://content-feed.onrender.com                ✅
```

### Si une URL est incorrecte :

1. **Clique sur le bouton "Edit"** (en haut à droite de la table des variables)
2. **Clique sur la variable** à modifier
3. **Remplace la valeur** par l'URL publique correcte
4. **Sauvegarde**

---

## ✅ Étape 2 : Tester chaque service individuellement

Avant de tester l'API Gateway, vérifie que chaque service fonctionne seul.

### Test 1 : user-authentication

Ouvre dans ton navigateur :
```
https://user-authentication-9g16.onrender.com/health
```

**Résultat attendu** : JSON avec `"status": "OK"`

**Si ça ne fonctionne pas** :
- Attends 30-60 secondes (instance en spin down)
- Vérifie que le service est actif sur Render

### Test 2 : content-feed

Ouvre dans ton navigateur :
```
https://content-feed.onrender.com/health
```

**Résultat attendu** : JSON avec `"status": "OK"`

### Test 3 : user-preferences

Ouvre dans ton navigateur :
```
https://user-preferences.onrender.com/health
```

**Résultat attendu** : JSON avec `"status": "OK"`

### Test 4 : content-recommendation

Ouvre dans ton navigateur :
```
https://content-recommendation.onrender.com/health
```

**Résultat attendu** : JSON avec `"status": "OK"`

### Test 5 : content-categories

Ouvre dans ton navigateur :
```
https://content-categories.onrender.com/health
```

**Résultat attendu** : JSON avec `"status": "OK"`

---

## ✅ Étape 3 : Tester l'API Gateway

### Test 1 : Health check de l'API Gateway

Ouvre dans ton navigateur :
```
https://api-gateway-ydpu.onrender.com/health
```

**Résultat attendu** : JSON avec `"status": "OK"` et la liste des services

**Si tu vois des erreurs** :
- Regarde quels services sont en erreur
- Vérifie que les URLs de ces services sont correctes dans les variables d'environnement

### Test 2 : Endpoint feed via l'API Gateway

Ouvre dans ton navigateur :
```
https://api-gateway-ydpu.onrender.com/api/feed/general?limit=5
```

**Résultat attendu** : JSON avec un tableau `feed` contenant des articles

**Si tu vois une erreur** :
- Regarde les logs de l'API Gateway sur Render
- Vérifie que `content-feed` est accessible (Test 2 ci-dessus)

---

## ✅ Étape 4 : Vérifier les logs de l'API Gateway

### Actions à faire :

1. **Sur Render**, va dans **api-gateway** → **Logs**

2. **Regarde les dernières lignes** pour voir :
   - ✅ Si l'API Gateway démarre correctement
   - ❌ S'il y a des erreurs de connexion vers les autres services
   - ❌ S'il y a des erreurs npm

### Erreurs courantes dans les logs :

#### Erreur 1 : "ECONNREFUSED" ou "ENOTFOUND"
```
Error: connect ECONNREFUSED
```
**Cause** : L'URL du service est incorrecte ou le service n'est pas accessible

**Solution** :
- Vérifie que l'URL dans les variables d'environnement est correcte
- Vérifie que le service est actif sur Render
- Teste le service directement (étape 2)

#### Erreur 2 : "npm error" ou "SIGTERM"
```
npm error command failed
npm error signal SIGTERM
```
**Cause** : Le service crash au démarrage

**Solution** :
- Regarde les logs complets pour voir l'erreur exacte
- Vérifie que le code de l'API Gateway est correct
- Redéploie le service

#### Erreur 3 : "Timeout"
```
ETIMEDOUT
```
**Cause** : Le service est en "spin down" (instance gratuite inactive)

**Solution** :
- Attends 30-60 secondes et réessaie
- La première requête sera lente, les suivantes seront rapides

---

## ✅ Étape 5 : Redéployer l'API Gateway

Après avoir corrigé les variables d'environnement :

1. **Sur Render**, va dans **api-gateway**

2. **Clique sur "Manual Deploy"** (en haut à droite)

3. **Coche "Clear build cache & deploy"**

4. **Clique sur "Deploy"**

5. **Attends 2-3 minutes** que le déploiement se termine

6. **Regarde les logs** pour vérifier qu'il n'y a pas d'erreurs

---

## ✅ Étape 6 : Tester depuis le frontend Vercel

### Actions à faire :

1. **Ouvre ton site Vercel** (ex: `https://actu-application-de-revus.vercel.app`)

2. **Ouvre la console du navigateur** (F12 → Console)

3. **Regarde les erreurs** :
   - Si tu vois "Failed to fetch" → L'API Gateway ne répond pas ou il y a un problème CORS
   - Si tu vois une erreur 404 → L'endpoint n'existe pas
   - Si tu vois une erreur 500 → Erreur serveur, regarde les logs

4. **Teste la recherche d'articles** :
   - Clique sur "Rechercher" ou "Flux général"
   - Regarde si les articles s'affichent

---

## 🔧 Solutions aux problèmes courants

### Problème 1 : "Failed to fetch" depuis le frontend

**Causes possibles** :
1. L'API Gateway est en "spin down" → Attends 30-60 secondes
2. Erreur CORS → Les services backend doivent autoriser le domaine Vercel
3. URL incorrecte dans Vercel → Vérifie la variable `REACT_APP_API_GATEWAY_URL`

**Solutions** :
1. Vérifie que `REACT_APP_API_GATEWAY_URL` dans Vercel est : `https://api-gateway-ydpu.onrender.com`
2. Teste l'API Gateway directement dans le navigateur
3. Vérifie les logs de l'API Gateway pour les erreurs

### Problème 2 : Les services ne répondent pas

**Causes possibles** :
1. Instance en "spin down" → Attends 30-60 secondes
2. Service crash → Regarde les logs du service
3. URL incorrecte → Vérifie l'URL publique du service

**Solutions** :
1. Teste chaque service individuellement (étape 2)
2. Regarde les logs de chaque service sur Render
3. Vérifie que les services sont actifs (pas suspendus)

### Problème 3 : Erreur dans les logs de l'API Gateway

**Causes possibles** :
1. URL incorrecte dans les variables d'environnement
2. Service backend non accessible
3. Erreur dans le code de l'API Gateway

**Solutions** :
1. Vérifie que toutes les URLs commencent par `https://` et se terminent par `.onrender.com`
2. Teste chaque service individuellement
3. Redéploie l'API Gateway après avoir corrigé les variables

---

## 📋 Checklist de vérification

Avant de dire que ça ne fonctionne pas, vérifie :

- [ ] Toutes les URLs dans les variables d'environnement commencent par `https://`
- [ ] Toutes les URLs se terminent par `.onrender.com` (sans port)
- [ ] Chaque service répond à `/health` individuellement
- [ ] L'API Gateway répond à `/health`
- [ ] L'endpoint `/api/feed/general` fonctionne via l'API Gateway
- [ ] Les logs de l'API Gateway ne montrent pas d'erreurs
- [ ] La variable `REACT_APP_API_GATEWAY_URL` est correcte dans Vercel
- [ ] Le frontend Vercel est redéployé avec la bonne variable

---

## 🎯 Résultat attendu

Après toutes ces vérifications :

1. ✅ Chaque service répond individuellement à `/health`
2. ✅ L'API Gateway répond à `/health` et liste tous les services comme "OK"
3. ✅ L'endpoint `/api/feed/general` retourne des articles via l'API Gateway
4. ✅ Le frontend Vercel peut se connecter et afficher les articles

Si une de ces étapes échoue, concentre-toi sur cette étape et résous le problème avant de passer à la suivante.


