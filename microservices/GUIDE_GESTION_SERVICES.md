# Guide de Gestion des Services Microservices

## 🎯 Problème Résolu

Vos services fonctionnent correctement ! Le problème "port is already allocated" vient du fait que les services sont **déjà en cours d'exécution**.

## ✅ Vérification Rapide

Tous vos services sont actifs :
- ✅ **content-feed** : Port 4003 (clé API GNews configurée)
- ✅ **user-authentication** : Port 4005
- ✅ **user-preferences** : Port 4002
- ✅ **content-recommendation** : Port 4004
- ✅ **content-categories** : Port 4006
- ✅ **api-gateway** : Port 4001
- ✅ **redis** : Port 6379

## 🛠️ Utilisation du Script de Gestion

Un script `manage-services.sh` a été créé pour faciliter la gestion des services.

### Commandes Disponibles

```bash
# Voir l'état de tous les services
./manage-services.sh status

# Démarrer tous les services
./manage-services.sh start

# Démarrer un service spécifique
./manage-services.sh start content-feed

# Arrêter tous les services
./manage-services.sh stop

# Arrêter un service spécifique
./manage-services.sh stop user-authentication

# Redémarrer tous les services
./manage-services.sh restart

# Redémarrer un service spécifique
./manage-services.sh restart content-feed

# Arrêter et supprimer tous les conteneurs
./manage-services.sh down

# Voir les logs d'un service
./manage-services.sh logs content-feed

# Voir les logs de tous les services
./manage-services.sh logs

# Tester les services
./manage-services.sh test

# Nettoyer les conteneurs arrêtés
./manage-services.sh clean
```

## 🔧 Résolution des Problèmes de Ports

### Si vous obtenez "port is already allocated"

**Option 1 : Arrêter le service existant puis le relancer**
```bash
cd /home/ulrichakongo/Documents/actu/microservices
./manage-services.sh stop content-feed
./manage-services.sh start content-feed
```

**Option 2 : Redémarrer le service directement**
```bash
./manage-services.sh restart content-feed
```

**Option 3 : Arrêter tous les services et les relancer**
```bash
./manage-services.sh down
./manage-services.sh start
```

### Si un port est bloqué par un autre processus

```bash
# Trouver quel processus utilise le port
sudo lsof -i :4003  # Remplacer 4003 par le port concerné

# Ou avec ss
ss -tuln | grep :4003
```

## 🧪 Tester le Service content-feed

```bash
# Health check
curl http://localhost:4003/health

# Tester l'API GNews
curl "http://localhost:4003/api/feed/category/technologie?limit=5"

# Ou utiliser le script de test
./manage-services.sh test
```

## 📋 Vérification de la Clé API GNews

La clé API GNews est bien configurée dans le docker-compose.yml :
```yaml
GNEWS_API_KEY=cb246a4da7dc041b6020dd5f7a16db88
```

Pour vérifier qu'elle est bien passée au conteneur :
```bash
docker exec microservices-content-feed-1 printenv | grep GNEWS
```

## 🚀 Commandes Docker Compose Directes

Si vous préférez utiliser docker-compose directement :

```bash
# Voir l'état
docker-compose ps

# Démarrer tous les services
docker-compose up -d

# Démarrer un service spécifique
docker-compose up -d content-feed

# Arrêter tous les services
docker-compose stop

# Arrêter et supprimer
docker-compose down

# Voir les logs
docker-compose logs -f content-feed

# Redémarrer un service
docker-compose restart content-feed
```

## 📊 Mapping des Ports

| Service | Port Interne | Port Externe | URL |
|---------|--------------|--------------|-----|
| api-gateway | 3000 | 4001 | http://localhost:4001 |
| user-preferences | 3001 | 4002 | http://localhost:4002 |
| content-feed | 3002 | 4003 | http://localhost:4003 |
| content-recommendation | 3003 | 4004 | http://localhost:4004 |
| user-authentication | 3004 | 4005 | http://localhost:4005 |
| content-categories | 3005 | 4006 | http://localhost:4006 |
| redis | 6379 | 6379 | localhost:6379 |

## ⚠️ Notes Importantes

1. **Les ports externes (4001-4006) sont différents des ports internes (3000-3005)**
   - Les services communiquent entre eux via les ports internes
   - Vous accédez aux services depuis l'extérieur via les ports externes

2. **Si vous modifiez le docker-compose.yml**, vous devez reconstruire :
   ```bash
   docker-compose up -d --build content-feed
   ```

3. **Pour voir les logs en temps réel** :
   ```bash
   docker-compose logs -f content-feed
   ```

## 🆘 En Cas de Problème Persistant

1. Vérifier l'état des conteneurs :
   ```bash
   docker ps -a
   ```

2. Vérifier les logs d'erreur :
   ```bash
   docker logs microservices-content-feed-1
   ```

3. Redémarrer proprement :
   ```bash
   ./manage-services.sh down
   docker system prune -f
   ./manage-services.sh start
   ```
