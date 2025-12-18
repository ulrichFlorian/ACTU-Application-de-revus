# 📱 Guide de l'Interface User Preferences

L'interface user-preferences est maintenant disponible avec deux sections : **Internationale** et **Locale (Cameroun)**.

## 🌐 Accès à l'interface

L'interface est accessible sur : **http://localhost:4002**

## ✨ Fonctionnalités

### 1. **Affichage des articles avec deux sections**

- **Section Internationale** 🌍 : Articles de sources internationales (GNews, NewsAPI Afrique)
- **Section Locale** 🏠 : Articles du Cameroun (NewsData.io + sites camerounais spécifiques)

### 2. **Toggle entre sections**

Un bouton toggle permet de basculer entre :
- Articles internationaux
- Articles locaux (Cameroun)

### 3. **Sources camerounaises interrogées**

En plus de NewsData.io, les sites suivants sont interrogés via Google News RSS :
- actucameroun.com
- camerounweb.com
- camer.be
- journalducameroun.com
- 237online.com
- cameroon-info.net
- crtv.cm

## 🚀 Comment utiliser

### 1. Accéder à l'interface

Ouvrez votre navigateur et allez sur : **http://localhost:4002**

### 2. Charger les articles

1. Entrez un **ID utilisateur** (ex: `user123`)
2. Sélectionnez une **catégorie** (ex: "Santé", "People")
3. Choisissez le **nombre d'articles** à afficher
4. Cliquez sur **"Charger les articles"**

### 3. Basculer entre les sections

Une fois les articles chargés :
- Cliquez sur **"International"** 🌍 pour voir les articles internationaux
- Cliquez sur **"Local (Cameroun)"** 🏠 pour voir les articles du Cameroun

Par défaut, la section **Internationale** est affichée.

## 📊 API Endpoint

L'interface utilise l'endpoint suivant :

```
GET /api/preferences/:userId/articles?limit=20&category=sante
```

**Paramètres :**
- `userId` : ID de l'utilisateur (requis)
- `limit` : Nombre d'articles à récupérer (optionnel, défaut: 20)
- `category` : Catégorie à filtrer (optionnel)

**Réponse :**
```json
{
  "feed": [
    {
      "title": "...",
      "section": "international" | "local",
      "country": "cm",
      "countryName": "Cameroun",
      ...
    }
  ],
  "sections": {
    "international": 10,
    "local": 5
  },
  "category": "sante",
  "timestamp": "..."
}
```

## 🧪 Test de l'API directement

```bash
# Tester avec curl
curl "http://localhost:4002/api/preferences/user123/articles?limit=10&category=people" | jq '.'

# Voir les sections
curl "http://localhost:4002/api/preferences/user123/articles?limit=10" | jq '.sections'

# Compter les articles locaux
curl "http://localhost:4002/api/preferences/user123/articles?limit=10" | jq '.feed[] | select(.section == "local") | .title'
```

## 🔧 Vérification que les services tournent

```bash
# Vérifier user-preferences
curl http://localhost:4002/health

# Vérifier content-feed
curl http://localhost:4003/health

# Voir les logs
docker-compose logs user-preferences | tail -20
docker-compose logs content-feed | grep -i "newsdata\|cameroon\|cam"
```

## 🐛 Dépannage

### L'interface ne se charge pas

1. Vérifiez que le service user-preferences est démarré :
   ```bash
   docker-compose ps user-preferences
   ```

2. Vérifiez que le fichier HTML existe :
   ```bash
   ls -la microservices/user-preferences/public/index.html
   ```

3. Vérifiez les logs :
   ```bash
   docker-compose logs user-preferences
   ```

### Aucun article local n'apparaît

1. Vérifiez les logs de content-feed :
   ```bash
   docker-compose logs content-feed | grep -i "newsdata\|cameroon"
   ```

2. Testez directement l'API NewsData.io :
   ```bash
   curl "https://newsdata.io/api/1/latest?apikey=pub_7e8b81c719e34a3ea5d45ecef8cc702a&country=cm&language=fr&size=5"
   ```

3. Vérifiez que la clé API est configurée :
   ```bash
   docker-compose exec content-feed env | grep NEWSDATA_API_KEY
   ```

### Le toggle ne fonctionne pas

1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Assurez-vous que les articles ont bien les propriétés `section: "local"` ou `section: "international"`

## 📝 Catégories disponibles

- `people` - People / Divertissement
- `sante` - Santé
- `politique` - Politique
- `sport` - Sport
- `technologie` - Technologie
- `economie` - Économie
- `culture` - Culture

## 🎯 Résultat attendu

Quand vous chargez les articles :

1. ✅ Le toggle apparaît avec deux boutons
2. ✅ Le compteur affiche le nombre d'articles dans chaque section
3. ✅ Par défaut, la section Internationale est affichée
4. ✅ En cliquant sur "Local (Cameroun)", les articles du Cameroun s'affichent
5. ✅ Les articles locaux ont le badge 🇨🇲 Cameroun
6. ✅ Les articles sont filtrés selon la catégorie sélectionnée

---

**Note :** Si le service user-preferences n'est pas accessible sur le port 4002, vérifiez que Docker est bien configuré et que les ports sont correctement mappés dans `docker-compose.yml`.
