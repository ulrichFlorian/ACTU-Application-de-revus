# Configuration pour la production

## 🔐 Générer un JWT_SECRET sécurisé

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 64

# Option 3: En ligne
# https://www.grc.com/passwords.htm
```

## 📝 Variables d'environnement à configurer

### Pour chaque microservice

```env
NODE_ENV=production
PORT=<port_du_service>
DATABASE_URL=<mongodb_atlas_url>
```

### Spécifique à user-authentication

```env
JWT_SECRET=<secret_généré_ci_dessus>
```

### Spécifique à content-feed

```env
GNEWS_API_KEY=<votre_clé>
AFRICA_NEWS_API_KEY=<votre_clé>
```

### Pour API Gateway

```env
AUTH_SERVICE_URL=https://user-auth.votre-domaine.com
PREFERENCES_SERVICE_URL=https://user-prefs.votre-domaine.com
FEED_SERVICE_URL=https://content-feed.votre-domaine.com
RECOMMENDATION_SERVICE_URL=https://recommendation.votre-domaine.com
CATEGORIES_SERVICE_URL=https://categories.votre-domaine.com
FRONTEND_URL=https://votre-app.vercel.app
```

## 🗄️ Configuration MongoDB Atlas

1. Créer un cluster M0 (gratuit)
2. Configurer Network Access : `0.0.0.0/0` (tous les IPs)
3. Créer un utilisateur avec mot de passe
4. Obtenir l'URL de connexion

### Structure des bases de données

- `auth` - Pour user-authentication
- `user-preferences` - Pour user-preferences
- `recommendations` - Pour content-recommendation
- `categories` - Pour content-categories

## 🔧 Améliorations pour la production

### 1. Ajouter des health checks

Chaque service a déjà un endpoint `/health`, vérifier qu'il fonctionne.

### 2. Configurer les logs

Ajouter un service de logging (optionnel) :
- Winston pour les logs structurés
- Sentry pour le monitoring d'erreurs (gratuit jusqu'à 5k événements/mois)

### 3. Rate limiting

Ajouter express-rate-limit pour protéger les APIs :

```bash
npm install express-rate-limit
```

### 4. HTTPS

Toutes les plateformes mentionnées fournissent HTTPS automatiquement.

## 🚀 Checklist avant déploiement

- [ ] Toutes les variables d'environnement configurées
- [ ] JWT_SECRET généré et sécurisé
- [ ] MongoDB Atlas configuré et accessible
- [ ] CORS configuré pour le domaine de production
- [ ] URLs des services mises à jour dans API Gateway
- [ ] Frontend buildé (`npm run build`)
- [ ] Tests locaux réussis
- [ ] Health checks fonctionnels

## 📊 Monitoring

### Services gratuits de monitoring

1. **UptimeRobot** (gratuit) : Monitoring des endpoints
   - https://uptimerobot.com
   - Surveiller `/health` de chaque service

2. **Sentry** (gratuit) : Gestion des erreurs
   - https://sentry.io
   - 5,000 événements/mois gratuits

3. **Logtail** (gratuit) : Logs centralisés
   - https://logtail.com
   - 1GB/mois gratuit

## 🔄 Déploiement continu (CI/CD)

### GitHub Actions (gratuit)

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # Ajouter les étapes de déploiement
```

Les plateformes comme Railway et Render supportent le déploiement automatique depuis GitHub.





