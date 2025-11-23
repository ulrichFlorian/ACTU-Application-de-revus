# Documentation NewsAPI - Articles Africains

## Pays Africains Supportés

L'API NewsAPI permet de récupérer des articles de **20 pays africains** :

| Code ISO | Pays | Exemples d'articles récupérables |
|----------|------|----------------------------------|
| `za` | **Afrique du Sud** | Actualités sportives (rugby, cricket), technologie, économie, politique |
| `ng` | **Nigeria** | Pétrole, économie, sport (football), technologie, politique |
| `ke` | **Kenya** | Technologie (M-Pesa), tourisme, sport (marathon), politique |
| `eg` | **Égypte** | Tourisme, politique, économie, culture, sport |
| `ma` | **Maroc** | Tourisme, économie, sport (football), culture, technologie |
| `dz` | **Algérie** | Énergie, politique, sport, économie |
| `tn` | **Tunisie** | Tourisme, politique, économie, culture |
| `gh` | **Ghana** | Cacao, économie, sport, technologie, politique |
| `ci` | **Côte d'Ivoire** | Cacao, économie, sport (football), politique |
| `sn` | **Sénégal** | Sport (football), économie, culture, politique |
| `cm` | **Cameroun** | Sport (football), économie, politique, culture |
| `rw` | **Rwanda** | Technologie, économie, politique, développement |
| `et` | **Éthiopie** | Économie, politique, culture, développement |
| `tz` | **Tanzanie** | Tourisme, économie, politique, culture |
| `ug` | **Ouganda** | Économie, politique, développement, technologie |
| `zm` | **Zambie** | Économie, politique, sport, développement |
| `zw` | **Zimbabwe** | Économie, politique, agriculture, sport |
| `ao` | **Angola** | Pétrole, économie, politique, sport |
| `mz` | **Mozambique** | Économie, politique, développement, tourisme |
| `mg` | **Madagascar** | Tourisme, économie, politique, environnement |

## Types de Requêtes

### 1. `/v2/top-headlines` (Prioritaire)
- **Utilisation** : Récupère les articles les plus récents par pays
- **Paramètres** :
  - `country` : Code ISO du pays (ex: `za`, `ng`, `ke`)
  - `category` : Catégorie (sports, health, technology, business, entertainment, science)
  - `q` : Requête de recherche (si pas de catégorie)
  - `pageSize` : Nombre d'articles (max 100)

**Exemples d'articles récupérés** :
- **Sport (Nigeria)** : "Super Eagles : résultats des matchs, transferts de joueurs"
- **Technologie (Kenya)** : "Innovations M-Pesa, startups technologiques"
- **Santé (Afrique du Sud)** : "Campagnes de vaccination, santé publique"
- **Économie (Ghana)** : "Prix du cacao, croissance économique"

### 2. `/v2/everything` (Complémentaire)
- **Utilisation** : Recherche large sur l'Afrique avec mots-clés
- **Paramètres** :
  - `q` : Requête avec filtres (ex: `sport AND (Africa OR Nigeria OR Cameroun)`)
  - `sortBy` : Tri (publishedAt, relevancy, popularity)
  - `from` : Date de début (7 derniers jours)
  - `language` : Langue (fr, en)
  - `pageSize` : Nombre d'articles

**Exemples d'articles récupérés** :
- **Politique** : "Élections au Cameroun, actualités politiques africaines"
- **Sport** : "Coupe d'Afrique des Nations, actualités football africain"
- **Technologie** : "Innovations technologiques en Afrique, fintech"
- **Économie** : "Croissance économique africaine, investissements"

## Catégories Supportées

| Catégorie NewsAPI | Types de contenus correspondants |
|-------------------|----------------------------------|
| `sports` | Sport, Sports |
| `health` | Santé, Sante, Health |
| `technology` | Technologie, Technology, Tech |
| `business` | Économie, Economie, Business, Finance |
| `entertainment` | Cinéma, Cinema, Musique, People, Culture, Art |
| `science` | Science, Environnement |
| `general` | Politique, Politique, Général |

## Stratégie d'Intégration

1. **Requêtes parallèles** : 5 pays principaux via `/top-headlines` + 1 requête `/everything`
2. **Déduplication** : Suppression des articles en double par URL
3. **Tri** : Articles triés par date de publication (plus récent en premier)
4. **Métadonnées** : Chaque article inclut le pays d'origine (`country`, `countryName`)

## Exemples d'Articles par Type de Contenu

### Sport
- **Nigeria** : "Super Eagles : préparation CAN 2025"
- **Cameroun** : "Lions Indomptables : résultats et actualités"
- **Sénégal** : "Lions de la Téranga : matchs et transferts"
- **Afrique du Sud** : "Springboks : actualités rugby"

### Santé
- **Kenya** : "Campagnes de santé publique"
- **Ghana** : "Système de santé, innovations médicales"
- **Afrique du Sud** : "Santé publique, épidémies"

### Technologie
- **Kenya** : "M-Pesa, fintech, innovations technologiques"
- **Nigeria** : "Startups technologiques, fintech"
- **Afrique du Sud** : "Innovations tech, entreprises technologiques"

### Économie
- **Ghana** : "Prix du cacao, économie"
- **Nigeria** : "Pétrole, économie nigériane"
- **Côte d'Ivoire** : "Cacao, économie ivoirienne"

### Politique
- **Cameroun** : "Actualités politiques, élections"
- **Nigeria** : "Politique nigériane, élections"
- **Sénégal** : "Actualités politiques sénégalaises"

## Limites

- **Plan gratuit** : 100 requêtes/jour
- **Articles** : Maximum 100 par requête
- **Période** : Articles des 7 derniers jours pour `/everything`
- **Langues** : Principalement anglais et français selon les sources


