# ✅ Résumé des Modifications - Authentification

## 🎯 Modifications effectuées

### 1. ✅ Interface User Preferences - Nettoyage
- **Retiré** : Le titre "📰 Interface User Preferences - Articles" et le sous-titre
- **Conservé** : L'indicateur "En ligne" en haut à droite
- L'interface est maintenant plus épurée et professionnelle

### 2. ✅ Modèle User - Adaptation
- **Changement** : Utilisation d'un seul champ `nom` au lieu de `firstName` et `lastName`
- **Ajout** : Support pour les comptes Google (`googleId`)
- **Modification** : Le mot de passe n'est plus obligatoire pour les comptes Google
- Les données sont stockées dans MongoDB dans la collection `users`

### 3. ✅ Interface User Authentication - Création complète
- **Page d'inscription** avec :
  - Champ "Nom"
  - Champ "Adresse email"
  - Champ "Mot de passe" (minimum 6 caractères)
  - Bouton "Sign in with Google"
  - Design moderne et responsive

- **Page de connexion** avec :
  - Champ "Adresse email"
  - Champ "Mot de passe"
  - Bouton "Sign in with Google"
  - Basculement facile entre inscription et connexion

### 4. ✅ Flux d'authentification

#### Inscription classique :
1. L'utilisateur remplit le formulaire (nom, email, mot de passe)
2. Les données sont envoyées à `/api/auth/register`
3. Le compte est créé dans MongoDB
4. **Redirection automatique** vers la page de connexion
5. L'email est pré-rempli dans le formulaire de connexion

#### Connexion classique :
1. L'utilisateur entre son email et mot de passe
2. Les données sont envoyées à `/api/auth/login`
3. Un token JWT est généré
4. Le token et les infos utilisateur sont sauvegardés dans `localStorage`
5. **Redirection automatique** vers `http://localhost:4002` (user-preferences)

#### Connexion Google :
1. L'utilisateur clique sur "Sign in with Google"
2. Redirection vers Google pour sélectionner un compte
3. Autorisation de l'application
4. Google redirige vers `/api/auth/google/callback`
5. Le compte est créé ou lié dans MongoDB
6. Un token JWT est généré
7. **Redirection automatique** vers `http://localhost:4002` avec le token

### 5. ✅ Routes API ajoutées

- `POST /api/auth/register` - Inscription (nom, email, password)
- `POST /api/auth/login` - Connexion (email, password)
- `GET /api/auth/google` - Initier l'authentification Google
- `GET /api/auth/google/callback` - Callback Google OAuth

### 6. ✅ Dépendances ajoutées

- `passport` : Framework d'authentification
- `passport-google-oauth20` : Stratégie Google OAuth

## 🚀 Comment lancer le service

### Méthode rapide :
```bash
cd /home/ulrichakongo/Documents/actu/microservices
docker-compose up -d --build user-authentication
```

### Vérifier que ça fonctionne :
```bash
# Vérifier le statut
docker-compose ps user-authentication

# Vérifier les logs
docker-compose logs user-authentication

# Tester l'API
curl http://localhost:4005/health
```

### Accéder à l'interface :
Ouvrez votre navigateur sur : **http://localhost:4005**

## 📋 Configuration Google OAuth (optionnel)

Pour activer la connexion avec Google :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API"
4. Créez des identifiants OAuth 2.0 :
   - Type : Application Web
   - URI de redirection autorisés : `http://localhost:4005/api/auth/google/callback`
5. Ajoutez dans `docker-compose.yml` :
```yaml
environment:
  - GOOGLE_CLIENT_ID=votre_client_id
  - GOOGLE_CLIENT_SECRET=votre_client_secret
```
6. Redémarrez le service :
```bash
docker-compose restart user-authentication
```

**Note** : Sans configuration Google OAuth, le bouton "Sign in with Google" affichera une erreur, mais l'inscription/connexion classique fonctionnera normalement.

## 🗄️ Structure MongoDB

Les utilisateurs sont stockés dans la collection `users` avec :

```javascript
{
  _id: ObjectId,
  nom: String,              // Nom de l'utilisateur
  email: String,            // Email (unique, requis)
  password: String,         // Mot de passe hashé (bcrypt) - optionnel si Google
  googleId: String,        // ID Google (si connexion via Google)
  role: String,            // 'user' ou 'admin' (défaut: 'user')
  isActive: Boolean,       // Statut actif (défaut: true)
  lastLogin: Date,         // Dernière connexion
  preferences: Object,     // Préférences utilisateur
  createdAt: Date,         // Date de création
  updatedAt: Date          // Date de modification
}
```

## 🔐 Sécurité

- **Mots de passe** : Hashés avec bcrypt (salt rounds: 10)
- **Tokens JWT** : Signés avec `JWT_SECRET`, expiration 7 jours
- **Validation** : Email unique, mot de passe minimum 6 caractères
- **CORS** : Configuré pour autoriser localhost:4002 et localhost:4005

## 📝 Exemples d'utilisation

### Inscription via API :
```bash
curl -X POST http://localhost:4005/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jean Dupont",
    "email": "jean@example.com",
    "password": "monmotdepasse123"
  }'
```

### Connexion via API :
```bash
curl -X POST http://localhost:4005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "monmotdepasse123"
  }'
```

Réponse :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "jean@example.com",
    "nom": "Jean Dupont",
    "role": "user"
  }
}
```

## ✅ Checklist finale

- [x] Interface user-preferences nettoyée (titre retiré)
- [x] Modèle User adapté (nom au lieu de firstName/lastName)
- [x] Interface HTML créée pour user-authentication
- [x] Formulaire d'inscription (nom, email, mot de passe)
- [x] Formulaire de connexion (email, mot de passe)
- [x] Bouton "Sign in with Google" ajouté
- [x] Routes Google OAuth implémentées
- [x] Redirection inscription → connexion
- [x] Redirection connexion → user-preferences
- [x] Redirection Google → user-preferences
- [x] Stockage MongoDB fonctionnel
- [x] Service démarré et testé

---

**Tout est maintenant fonctionnel !** 🎉

Pour tester :
1. Lancez le service : `docker-compose up -d user-authentication`
2. Ouvrez : http://localhost:4005
3. Créez un compte ou connectez-vous
4. Vous serez redirigé vers user-preferences automatiquement
