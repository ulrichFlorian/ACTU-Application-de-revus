# 🚀 Guide pour lancer le service User Authentication

## 📋 Prérequis

- Docker et Docker Compose installés
- MongoDB en cours d'exécution (sur le port 27019 avec authentification)
- Les autres services microservices démarrés (optionnel)

## 🔧 Configuration

### Variables d'environnement

Le service utilise les variables suivantes (définies dans `docker-compose.yml`) :

- `PORT=3004` : Port interne du service
- `JWT_SECRET` : Clé secrète pour signer les tokens JWT
- `DATABASE_URL` : URL de connexion MongoDB
- `GOOGLE_CLIENT_ID` : ID client Google OAuth (optionnel)
- `GOOGLE_CLIENT_SECRET` : Secret client Google OAuth (optionnel)
- `FRONTEND_URL` : URL du frontend pour les redirections (défaut: http://localhost:4002)

### Configuration Google OAuth (optionnel)

Pour activer la connexion avec Google :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API"
4. Créez des identifiants OAuth 2.0 :
   - Type : Application Web
   - URI de redirection autorisés : `http://localhost:4005/api/auth/google/callback`
5. Copiez le Client ID et le Client Secret
6. Ajoutez-les dans `docker-compose.yml` :

```yaml
environment:
  - GOOGLE_CLIENT_ID=votre_client_id
  - GOOGLE_CLIENT_SECRET=votre_client_secret
```

## 🚀 Lancer le service

### Méthode 1 : Avec Docker Compose (recommandé)

```bash
cd /home/ulrichakongo/Documents/actu/microservices
docker-compose up -d user-authentication
```

### Méthode 2 : Lancer tous les services

```bash
cd /home/ulrichakongo/Documents/actu/microservices
docker-compose up -d
```

### Méthode 3 : Reconstruire et lancer

```bash
cd /home/ulrichakongo/Documents/actu/microservices
docker-compose up -d --build user-authentication
```

## ✅ Vérifier que le service fonctionne

### 1. Vérifier le statut du conteneur

```bash
docker-compose ps user-authentication
```

Vous devriez voir `Up` dans la colonne STATUS.

### 2. Vérifier les logs

```bash
docker-compose logs user-authentication
```

Vous devriez voir :
- `🚀 Service user-authentication démarré sur le port 3004`
- `✅ Connexion MongoDB établie pour user-authentication`

### 3. Tester l'endpoint de santé

```bash
curl http://localhost:4005/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "service": "user-authentication",
  "timestamp": "...",
  "database": "Connected"
}
```

### 4. Accéder à l'interface web

Ouvrez votre navigateur et allez sur :
```
http://localhost:4005
```

Vous devriez voir l'interface d'authentification avec :
- Formulaire d'inscription (nom, email, mot de passe)
- Bouton "Sign in with Google"
- Lien pour basculer vers la connexion

## 📝 Utilisation de l'interface

### Créer un compte

1. Remplissez le formulaire d'inscription :
   - Nom
   - Adresse email
   - Mot de passe (minimum 6 caractères)
2. Cliquez sur "Créer mon compte"
3. Vous serez automatiquement redirigé vers la page de connexion

### Se connecter

1. Entrez votre email et mot de passe
2. Cliquez sur "Se connecter"
3. Vous serez redirigé vers l'interface user-preferences (http://localhost:4002)

### Connexion avec Google

1. Cliquez sur "Sign in with Google"
2. Sélectionnez votre compte Google
3. Autorisez l'application
4. Vous serez automatiquement redirigé vers user-preferences

## 🔍 Dépannage

### Le service ne démarre pas

```bash
# Vérifier les logs d'erreur
docker-compose logs user-authentication

# Vérifier que MongoDB est accessible
docker-compose exec user-authentication ping -c 2 host.docker.internal
```

### Erreur de connexion MongoDB

Vérifiez que MongoDB est bien démarré et accessible :
```bash
# Vérifier MongoDB
docker ps | grep mongo
```

### Erreur Google OAuth

Si vous n'avez pas configuré Google OAuth, le bouton "Sign in with Google" affichera une erreur. C'est normal si vous n'utilisez que l'inscription/connexion classique.

### Le port 4005 est déjà utilisé

Modifiez le port dans `docker-compose.yml` :
```yaml
ports:
  - "4006:3004"  # Changez 4005 en 4006
```

## 📚 Endpoints API disponibles

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/google` - Initier l'authentification Google
- `GET /api/auth/google/callback` - Callback Google OAuth
- `GET /health` - Vérification de santé

## 🔐 Stockage des données

Les utilisateurs sont stockés dans MongoDB dans la collection `users` avec :
- `nom` : Nom de l'utilisateur
- `email` : Adresse email (unique)
- `password` : Mot de passe hashé (bcrypt)
- `googleId` : ID Google (si connexion via Google)
- `role` : Rôle utilisateur (user/admin)
- `createdAt` / `updatedAt` : Dates de création/modification

---

**Le service est maintenant prêt à être utilisé !** 🎉
