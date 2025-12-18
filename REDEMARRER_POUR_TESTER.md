# 🔄 Redémarrer pour voir les modifications

Les modifications du code nécessitent un **redémarrage des services** et une **recompilation du frontend**.

## ⚡ Actions rapides à faire

### 1. Redémarrer les services backend (Docker)

```bash
cd microservices

# Arrêter tous les services
docker-compose down

# Reconstruire et redémarrer (important : --build pour prendre les nouvelles modifications)
docker-compose up -d --build

# Vérifier que les services sont démarrés
docker-compose ps
```

### 2. Vérifier les logs pour confirmer que NewsData.io fonctionne

```bash
cd microservices
docker-compose logs -f content-feed
```

Vous devriez voir dans les logs :
- `NEWSDATA_API_KEY` chargée
- Messages comme `[Feed] Appel NewsData.io Cameroun pour "sante"...`

### 3. Tester directement l'API backend

Ouvrez un **nouveau terminal** et testez :

```bash
# Test avec la catégorie "sante"
curl "http://localhost:4003/api/feed/category/sante?limit=3" | jq '.feed[] | {title, section, countryName}'

# Si jq n'est pas installé, utilisez :
curl "http://localhost:4003/api/feed/category/sante?limit=3"
```

**Résultat attendu :** Vous devriez voir des articles avec `"section": "local"` et `"countryName": "Cameroun"`

### 4. Redémarrer le frontend React

Dans un **nouveau terminal**, depuis la racine du projet :

```bash
# Arrêter le serveur React si il tourne (Ctrl+C)

# Redémarrer le frontend
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

### 5. Tester dans le navigateur

1. Ouvrez `http://localhost:3000`
2. Cliquez sur une catégorie (ex: **Santé** 🏥 ou **People**)
3. **Vous devriez maintenant voir** :
   - Deux boutons : **"International"** 🌍 et **"Local (Cameroun)"** 🏠
   - Par défaut, la section Internationale est affichée
   - Cliquez sur "Local (Cameroun)" pour voir uniquement les articles du Cameroun

## 🐛 Si ça ne fonctionne toujours pas

### Vérifier que les services sont bien démarrés

```bash
cd microservices
docker-compose ps
```

Tous les services doivent être "Up" (pas "Exit" ou "Restarting")

### Vérifier les logs d'erreur

```bash
cd microservices
docker-compose logs content-feed | tail -50
```

### Vérifier la clé API

```bash
cd microservices
docker-compose exec content-feed env | grep NEWSDATA_API_KEY
```

Vous devriez voir : `NEWSDATA_API_KEY=pub_7e8b81c719e34a3ea5d45ecef8cc702a`

### Vérifier que le code est bien modifié

```bash
# Vérifier que le frontend a bien le toggle
grep -n "activeSection" src/App.js

# Vérifier que le backend marque bien les articles locaux
grep -n "section: 'local'" microservices/content-feed/src/routes/feed.js
```

## 📝 Endpoints corrects à utiliser

⚠️ **Important :** Utilisez les bons endpoints !

### Via l'API Gateway (pour le frontend)
- `http://localhost:4001/api/feed/category/sante`
- `http://localhost:4001/api/feed/category/people`

### Directement sur le service content-feed (pour les tests)
- `http://localhost:4003/api/feed/category/sante`
- `http://localhost:4003/api/feed/category/people`

❌ **Ne pas utiliser :** `http://localhost:4001/` (racine) - cela donnera l'erreur "Endpoint non trouvé"

## 🎯 Checklist rapide

- [ ] Services Docker redémarrés avec `--build`
- [ ] Frontend React redémarré (`npm start`)
- [ ] Test API backend fonctionne (curl)
- [ ] Toggle International/Local visible dans l'interface
- [ ] Articles locaux affichés avec le badge 🇨🇲

---

**Note :** Après chaque modification du code backend, utilisez `docker-compose up -d --build` pour reconstruire les conteneurs avec les nouveaux changements.
