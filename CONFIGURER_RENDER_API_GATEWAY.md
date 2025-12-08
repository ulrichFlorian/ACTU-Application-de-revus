# ⚙️ Guide Complet : Configurer l'API Gateway sur Render

## 🎯 Objectif

Configurer l'API Gateway pour qu'il puisse communiquer avec les autres services en utilisant les URLs publiques Render (au lieu des noms Docker qui ne fonctionnent pas).

## 📋 Étape 1 : Trouver les URLs publiques de tous tes services

### Actions à faire :

1. **Ouvre Render** : https://render.com
2. **Connecte-toi** à ton compte
3. **Pour CHAQUE service**, fais ceci :

#### Service 1 : user-authentication
- Clique sur le service **"user-authentication"** dans la liste
- **Tu arrives sur la page du service** (tu vois "WEB SERVICE" en haut, le nom "user-authentication", et des onglets à gauche)
- **Dans la partie centrale de la page**, tu vois plusieurs lignes d'informations :
  - "Service ID: srv-xxxxx"
  - "ulrichFlorian / ACTU-Application-de-revus" (avec une icône GitHub)
  - **"Public URL: https://user-authentication-xxxxx.onrender.com"** ← **C'EST ÇA QU'IL FAUT !**
- **À côté de "Public URL"**, il y a une **petite icône de copie** (📋)
- **Clique sur l'icône de copie** pour copier l'URL, ou **surligne et copie** l'URL manuellement
- **Note-la quelque part** (bloc-notes, fichier texte, etc.)

#### Service 2 : user-preferences
- Clique sur le service **"user-preferences"** dans la liste
- **Dans la partie centrale de la page**, trouve la ligne **"Public URL: https://user-preferences-xxxxx.onrender.com"**
- **Copie l'URL** (icône de copie ou manuellement)
- **Note-la**

#### Service 3 : content-feed
- Clique sur le service **"content-feed"** dans la liste
- **Dans la partie centrale de la page**, trouve la ligne **"Public URL: https://content-feed-xxxxx.onrender.com"**
- **Copie l'URL**
- **Note-la**

#### Service 4 : content-recommendation
- Clique sur le service **"content-recommendation"** dans la liste
- **Dans la partie centrale de la page**, trouve la ligne **"Public URL: https://content-recommendation-xxxxx.onrender.com"**
- **Copie l'URL**
- **Note-la**

#### Service 5 : content-categories
- Clique sur le service **"content-categories"** dans la liste
- **Dans la partie centrale de la page**, trouve la ligne **"Public URL: https://content-categories-xxxxx.onrender.com"**
- **Copie l'URL**
- **Note-la**

### 📍 Où trouver l'URL publique exactement ?

Quand tu cliques sur un service, tu vois :
- **En haut** : "WEB SERVICE" et le nom du service
- **À gauche** : Un menu avec "Events", "Settings", "Logs", etc.
- **Au centre** : Les informations du service, dont :
  - Service ID: srv-xxxxx
  - Repository: ulrichFlorian / ACTU-Application-de-revus
  - **Public URL: https://service-name-xxxxx.onrender.com** ← **C'EST ICI !**

L'URL publique est **directement visible** dans la partie centrale de la page, pas dans un onglet séparé.

### 🔍 Si tu ne vois pas l'URL publique :

**Option 1 : Faire défiler la page**
- L'URL publique peut être plus bas sur la page
- **Fais défiler vers le bas** pour la trouver

**Option 2 : Regarder dans l'onglet "Settings"**
- Clique sur **"⚙️ Settings"** dans le menu de gauche
- L'URL publique peut être affichée dans les paramètres du service

**Option 3 : Utiliser l'URL par défaut de Render**
- Les URLs Render suivent toujours le format : `https://[nom-du-service].onrender.com`
- Par exemple, pour `user-authentication`, l'URL est probablement : `https://user-authentication.onrender.com`
- **MAIS** : Render ajoute parfois un suffixe, donc essaie d'abord de trouver l'URL exacte dans l'interface

**Option 4 : Vérifier dans les logs**
- Clique sur **"Logs"** dans le menu de gauche
- Parfois l'URL est mentionnée dans les logs de démarrage

### ✅ Résultat attendu

Tu dois avoir noté 5 URLs, par exemple :
```
user-authentication    → https://user-authentication-9g16.onrender.com
user-preferences       → https://user-preferences-xxxxx.onrender.com
content-feed           → https://content-feed-xxxxx.onrender.com
content-recommendation → https://content-recommendation-xxxxx.onrender.com
content-categories     → https://content-categories-xxxxx.onrender.com
```

> 💡 **Astuce** : Si tu ne vois pas l'URL publique, elle est peut-être plus bas sur la page. Fais défiler vers le bas.

---

## 📋 Étape 2 : Configurer les variables d'environnement dans l'API Gateway

### Actions à faire :

1. **Sur Render**, clique sur le service **"api-gateway"**

2. **Dans le menu de gauche**, clique sur **"⚙️ Settings"**

3. **Dans le menu de gauche**, clique sur **"Environment"**

4. **Tu vas voir une liste de variables d'environnement dans un tableau**. Cherche ces variables :
   - `AUTH_SERVICE_URL`
   - `PREFERENCES_SERVICE_URL`
   - `FEED_SERVICE_URL`
   - `RECOMMENDATION_SERVICE_URL`
   - `CATEGORIES_SERVICE_URL`

5. **⚠️ IMPORTANT : Clique sur le bouton "Edit"** (en haut à droite, avec une icône de crayon ✏️)
   - Ce bouton permet de modifier les variables
   - Sans cliquer sur "Edit", tu ne pourras pas modifier les valeurs

6. **Pour CHAQUE variable**, fais ceci :

   #### Variable AUTH_SERVICE_URL
   - **Clique sur la ligne** de la variable `AUTH_SERVICE_URL` dans le tableau
   - **Dans le champ "Value"**, tu verras probablement : `http://user-authentication:3004`
   - **SUPPRIME cette valeur** et **remplace-la** par l'URL publique que tu as notée (exemple : `https://user-authentication-9g16.onrender.com`)
   - **⚠️ VÉRIFICATIONS IMPORTANTES** :
     - ✅ L'URL doit commencer par **`https://`** (pas `http://`)
     - ✅ L'URL doit se terminer par **`.onrender.com`** (sans port comme `:3004`)
     - ✅ Il ne doit **PAS y avoir de port** à la fin (pas de `:3004`, `:3002`, etc.)
   - **Clique sur "Save"** ou appuie sur Entrée

   #### Variable PREFERENCES_SERVICE_URL
   - **Key** : `PREFERENCES_SERVICE_URL`
   - **Value** : Colle l'URL que tu as notée pour `user-preferences`
   - **Clique sur "Save"**

   #### Variable FEED_SERVICE_URL
   - **Key** : `FEED_SERVICE_URL`
   - **Value** : Colle l'URL que tu as notée pour `content-feed`
   - **Clique sur "Save"**

   #### Variable RECOMMENDATION_SERVICE_URL
   - **Key** : `RECOMMENDATION_SERVICE_URL`
   - **Value** : Colle l'URL que tu as notée pour `content-recommendation`
   - **Clique sur "Save"**

   #### Variable CATEGORIES_SERVICE_URL
   - **Key** : `CATEGORIES_SERVICE_URL`
   - **Value** : Colle l'URL que tu as notée pour `content-categories`
   - **Clique sur "Save"`

### ✅ Résultat attendu

Tu dois avoir configuré 5 variables d'environnement dans l'API Gateway, toutes avec des URLs qui commencent par `https://` et se terminent par `.onrender.com`.

---

## 📋 Étape 3 : Redéployer l'API Gateway

### Actions à faire :

1. **Toujours sur Render**, dans le service **"api-gateway"**

2. **En haut à droite**, tu vois un bouton **"Manual Deploy"** (ou "Deploy" avec une flèche)

3. **Clique sur "Manual Deploy"**

4. **Une fenêtre s'ouvre** avec des options :
   - **Coche la case** "Clear build cache & deploy" (optionnel mais recommandé)
   - **Clique sur "Deploy"**

5. **Attends 2-3 minutes** que le déploiement se termine
   - Tu peux voir la progression dans la section "Events" ou "Logs"
   - Quand tu vois "Deploy live" avec une coche verte, c'est terminé

### ✅ Résultat attendu

L'API Gateway est redéployé avec les nouvelles variables d'environnement.

---

## 📋 Étape 4 : Tester que ça fonctionne

### Actions à faire :

1. **Ouvre un nouvel onglet** dans ton navigateur

2. **Test 1 : Health check**
   - Va sur : `https://api-gateway-ydpu.onrender.com/health`
   - **Résultat attendu** : Tu dois voir du JSON avec `"status": "OK"`
   - Si tu vois une erreur ou une page blanche, attends 30-60 secondes (l'instance peut être en "spin down")

3. **Test 2 : Endpoint feed**
   - Va sur : `https://api-gateway-ydpu.onrender.com/api/feed/general?limit=5`
   - **Résultat attendu** : Tu dois voir du JSON avec un tableau `feed` contenant des articles
   - Si tu vois une erreur, vérifie les logs de l'API Gateway sur Render

4. **Test 3 : Depuis le frontend Vercel**
   - Va sur ton site Vercel (ex: `https://actu-application-de-revus.vercel.app`)
   - **Résultat attendu** : Les articles doivent s'afficher, plus d'erreur "Failed to fetch"

### ✅ Résultat attendu

- L'API Gateway répond correctement
- L'endpoint `/api/feed/general` retourne des articles
- Le frontend peut se connecter et afficher les articles

---

## 🔍 Vérification des logs (si ça ne fonctionne pas)

### Actions à faire :

1. **Sur Render**, dans le service **"api-gateway"**

2. **Dans le menu de gauche**, clique sur **"Logs"**

3. **Fais une requête** depuis le frontend ou depuis le navigateur

4. **Regarde les logs** pour voir :
   - Si la requête arrive bien à l'API Gateway
   - S'il y a des erreurs de connexion vers les autres services
   - Si les URLs sont correctes

### Exemples d'erreurs à chercher :

- `ECONNREFUSED` → L'URL du service est incorrecte
- `ENOTFOUND` → Le nom de domaine n'existe pas
- `Timeout` → Le service est peut-être en "spin down"

---

## ⚠️ Problèmes courants et solutions

### Problème 1 : "Instance spin down"

**Symptôme** : La première requête prend 30-60 secondes, puis les suivantes sont rapides.

**Solution** : C'est normal pour les instances gratuites Render. Attends simplement.

### Problème 2 : "Failed to fetch" persiste

**Solutions à essayer** :
1. Vérifie que toutes les URLs dans les variables d'environnement commencent par `https://`
2. Vérifie que les URLs se terminent bien par `.onrender.com`
3. Vérifie que tu as bien redéployé l'API Gateway après avoir modifié les variables
4. Vérifie les logs de l'API Gateway pour voir les erreurs exactes

### Problème 3 : Erreur CORS

**Symptôme** : Erreur dans la console du navigateur mentionnant "CORS" ou "Access-Control-Allow-Origin".

**Solution** : Les services backend doivent être redéployés avec la nouvelle configuration CORS. Ou temporairement, dans chaque service backend, modifie le code pour autoriser toutes les origines :

```javascript
app.use(cors({ origin: '*', credentials: true }));
```

---

## 📋 Checklist finale

Avant de considérer que c'est terminé, vérifie :

- [ ] J'ai noté les 5 URLs publiques de tous les services
- [ ] J'ai configuré les 5 variables d'environnement dans l'API Gateway
- [ ] Toutes les URLs commencent par `https://`
- [ ] Toutes les URLs se terminent par `.onrender.com`
- [ ] J'ai redéployé l'API Gateway après avoir modifié les variables
- [ ] Le test `/health` fonctionne
- [ ] Le test `/api/feed/general` retourne des articles
- [ ] Le frontend Vercel affiche les articles sans erreur

---

## 🎯 Résumé des actions

1. ✅ **Trouver les URLs** : Pour chaque service sur Render, copier la "Public URL"
2. ✅ **Configurer les variables** : Dans api-gateway → Settings → Environment, ajouter/modifier les 5 variables avec les URLs
3. ✅ **Redéployer** : Manual Deploy → Clear build cache & deploy
4. ✅ **Tester** : Vérifier que `/health` et `/api/feed/general` fonctionnent

---

## 💡 Astuce

Si tu veux éviter que l'instance Render s'arrête (spin down), tu peux :
- Utiliser un service gratuit comme **UptimeRobot** pour faire un ping toutes les 5 minutes vers `/health`
- Ou passer à un plan payant Render

---

**C'est tout ! Suis ces étapes dans l'ordre et ça devrait fonctionner.** 🚀
