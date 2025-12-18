# 🧪 Guide de Test - NewsData.io avec Filtrage Cameroun

Ce guide vous explique comment tester les modifications apportées pour le filtrage des articles du Cameroun via NewsData.io.

## 📋 Prérequis

1. **Docker et Docker Compose** installés
2. **MongoDB** en cours d'exécution (si nécessaire)
3. **Node.js** installé pour le frontend

## 🚀 Méthode 1 : Test avec Docker Compose (Recommandé)

### 1. Démarrer tous les services

```bash
cd microservices
./manage-services.sh start
```

Ou directement :
```bash
cd microservices
docker-compose up -d
```

### 2. Vérifier l'état des services

```bash
cd microservices
./manage-services.sh status
```

Les services doivent être en cours d'exécution sur ces ports :
- API Gateway : `http://localhost:4001`
- Content Feed : `http://localhost:4003`
- User Preferences : `http://localhost:4002`

### 3. Vérifier les logs pour confirmer la clé API

```bash
cd microservices
./manage-services.sh logs content-feed
```

Vous devriez voir dans les logs que la clé API NewsData.io est chargée.

## 🧪 Méthode 2 : Tests API directs

### Test 1 : Vérifier les articles locaux (Cameroun) pour une catégorie

Testons avec la catégorie "santé" :

```bash
# Test articles locaux du Cameroun - Santé
curl -s "http://localhost:4003/api/feed/category/sante?limit=5" | jq '.feed[] | {title, section, country, countryName}'

# Ou sans jq (format JSON brut)
curl -s "http://localhost:4003/api/feed/category/sante?limit=5"
```

**Résultat attendu :** Les articles doivent avoir :
- `section: "local"`
- `country: "cm"`
- `countryName: "Cameroun"`

### Test 2 : Tester avec la catégorie "people" (entertainment)

```bash
# Test articles locaux du Cameroun - People/Entertainment
curl -s "http://localhost:4003/api/feed/category/people?limit=5" | jq '.feed[] | {title, section, country, countryName}'
```

### Test 3 : Vérifier les deux sections (Internationale et Locale)

```bash
# Vérifier que les deux sections sont retournées
curl -s "http://localhost:4003/api/feed/category/sante?limit=10" | jq '.sections'
```

**Résultat attendu :** Un objet avec `international` et `local` contenant le nombre d'articles dans chaque section.

### Test 4 : Tester plusieurs catégories

```bash
# Tester avec plusieurs catégories (people et santé)
curl -s "http://localhost:4003/api/feed/categories?categories=people,sante&limit=10" | jq '.feed[] | {title, section, category, countryName}'
```

## 🌐 Méthode 3 : Test via l'Interface Frontend

### 1. Démarrer le frontend React

```bash
# Depuis la racine du projet
npm install  # Si ce n'est pas déjà fait
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

### 2. Tests à effectuer dans l'interface

#### ✅ Test 1 : Affichage par défaut (Section Internationale)
1. Cliquez sur une catégorie (ex: "Santé" 🏥 ou "People")
2. **Par défaut**, la section **"International"** doit être affichée
3. Les articles doivent avoir le badge 🌍

#### ✅ Test 2 : Basculer vers la section Locale
1. Cliquez sur le bouton **"Local (Cameroun)"** 🏠
2. Les articles doivent maintenant afficher uniquement ceux du Cameroun
3. Les articles doivent avoir le badge 🇨🇲 Cameroun

#### ✅ Test 3 : Vérifier le compteur d'articles
1. Vérifiez que le nombre d'articles s'affiche correctement dans chaque bouton
2. Le bouton "International" doit montrer le nombre d'articles internationaux
3. Le bouton "Local" doit montrer le nombre d'articles du Cameroun

#### ✅ Test 4 : Tester avec différentes catégories
Testez avec :
- **Santé** (`sante`) - doit mapper vers `health` dans NewsData.io
- **People** - doit mapper vers `entertainment` dans NewsData.io
- **Politique** - doit mapper vers `politics`
- **Sport** - doit mapper vers `sports`

### 3. Vérifications visuelles

- ✅ Le toggle entre International/Local fonctionne
- ✅ Par défaut, la section Internationale est sélectionnée
- ✅ Les articles locaux ont une bordure verte (#28a745)
- ✅ Les articles internationaux ont une bordure bleue (#007bff)
- ✅ Le drapeau 🇨🇲 apparaît sur les articles locaux

## 🔍 Méthode 4 : Tests de débogage avancés

### Vérifier la requête NewsData.io directement

Vous pouvez vérifier que la requête NewsData.io est correcte en regardant les logs :

```bash
cd microservices
docker-compose logs -f content-feed | grep -i "newsdata"
```

Vous devriez voir des logs comme :
```
[NewsData.io] Requête pour Cameroun, catégorie: sante (health)
[NewsData.io] X articles trouvés pour le Cameroun
```

### Test manuel de l'API NewsData.io

Pour tester directement l'API NewsData.io (remplacez `YOUR_API_KEY` par votre clé) :

```bash
# Test articles du Cameroun - Santé
curl "https://newsdata.io/api/1/latest?apikey=pub_7e8b81c719e34a3ea5d45ecef8cc702a&country=cm&category=health&language=fr&size=5"

# Test articles du Cameroun - Entertainment (People)
curl "https://newsdata.io/api/1/latest?apikey=pub_7e8b81c719e34a3ea5d45ecef8cc702a&country=cm&category=entertainment&language=fr&size=5"
```

## 📝 Checklist de validation

Cochez chaque point après vérification :

### Backend
- [ ] La clé API NewsData.io est configurée dans `docker-compose.yml`
- [ ] Les requêtes incluent le paramètre `country=cm`
- [ ] Les articles locaux ont `section: "local"`
- [ ] Les articles locaux ont `country: "cm"` et `countryName: "Cameroun"`
- [ ] Le mapping des catégories fonctionne (`people` → `entertainment`, `sante` → `health`)

### Frontend
- [ ] Le toggle International/Local est visible
- [ ] Par défaut, la section Internationale est affichée
- [ ] Le clic sur "Local" affiche uniquement les articles du Cameroun
- [ ] Les articles locaux affichent le drapeau 🇨🇲
- [ ] Le compteur d'articles fonctionne correctement

### Fonctionnalités
- [ ] Les catégories "people" et "santé" fonctionnent
- [ ] Les articles sont filtrés correctement par pays (Cameroun uniquement pour local)
- [ ] Les deux sections sont retournées par l'API
- [ ] Le basculement entre sections est fluide

## 🐛 Dépannage

### Problème : Aucun article local n'apparaît

1. **Vérifiez les logs** :
   ```bash
   docker-compose logs content-feed | grep -i "newsdata"
   ```

2. **Vérifiez la clé API** :
   ```bash
   docker-compose exec content-feed env | grep NEWSDATA_API_KEY
   ```

3. **Testez l'API directement** avec curl (voir méthode 4)

### Problème : Les articles locaux n'ont pas `section: "local"`

Vérifiez le code dans `microservices/content-feed/src/routes/feed.js` :
- Ligne ~318 : `return localNews.map(article => ({ ...article, origin: 'local', section: 'local' }));`

### Problème : Le toggle ne fonctionne pas dans le frontend

1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Vérifiez que `activeSection` est bien initialisé à `'international'`

## 📊 Résultats attendus

### Exemple de réponse API pour `/api/feed/category/sante`

```json
{
  "feed": [
    {
      "title": "Titre article international",
      "section": "international",
      "origin": "gnews",
      ...
    },
    {
      "title": "Titre article Cameroun",
      "section": "local",
      "origin": "local",
      "country": "cm",
      "countryName": "Cameroun",
      ...
    }
  ],
  "sections": {
    "international": 5,
    "local": 3
  },
  "category": "sante"
}
```

## 🎯 Commandes rapides

```bash
# Démarrer tous les services
cd microservices && docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f content-feed

# Tester une catégorie
curl -s "http://localhost:4003/api/feed/category/sante?limit=5" | jq '.'

# Arrêter tous les services
docker-compose down
```

---

**Note :** Si vous utilisez un environnement de production (Vercel, Render), assurez-vous que les variables d'environnement sont configurées correctement avec la clé API NewsData.io.
