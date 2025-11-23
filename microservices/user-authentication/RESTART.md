# Redémarrer le service user-authentication

Pour appliquer les modifications, redémarrez le serveur :

## Option 1: Si vous utilisez nodemon (recommandé)
```bash
cd microservices/user-authentication
npm run dev
```

## Option 2: Si vous utilisez node directement
```bash
cd microservices/user-authentication
# Arrêter le processus actuel (Ctrl+C)
npm start
```

## Option 3: Redémarrer via Docker (si utilisé)
```bash
cd microservices
docker-compose restart user-authentication
```

## Vérifier que le serveur fonctionne
```bash
curl http://localhost:3004/health
```

Le serveur doit retourner :
```json
{
  "status": "OK",
  "service": "user-authentication",
  "database": "Connected"
}
```





