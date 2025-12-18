# 🔐 Configuration Google OAuth - Projet Actu

## ✅ Identifiants intégrés

Les identifiants Google OAuth ont été intégrés dans le projet :

- **Client ID** : `442434439258-aptdg2rnmis2cqqd64p4kqn2nd8qrc2l.apps.googleusercontent.com`
- **Client Secret** : `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`
- **Nom du projet** : Actu

## 📋 Configuration dans Google Cloud Console

Pour que la connexion Google fonctionne, vous devez configurer l'URI de redirection dans Google Cloud Console :

### 1. Accéder à Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez le projet **Actu**
3. Allez dans **APIs & Services** > **Credentials**

### 2. Configurer l'URI de redirection

1. Cliquez sur votre OAuth 2.0 Client ID (`442434439258-aptdg2rnmis2cqqd64p4kqn2nd8qrc2l`)
2. Dans la section **Authorized redirect URIs**, ajoutez :
   ```
   http://localhost:4005/api/auth/google/callback
   ```
3. Cliquez sur **Save**

### 3. Vérifier que l'API est activée

Assurez-vous que l'API **Google+ API** ou **Google Identity** est activée :
1. Allez dans **APIs & Services** > **Library**
2. Recherchez "Google+ API" ou "Google Identity"
3. Vérifiez qu'elle est activée

## 🚀 Tester la connexion Google

### 1. Redémarrer le service

```bash
cd /home/ulrichakongo/Documents/actu/microservices
docker-compose restart user-authentication
```

### 2. Accéder à l'interface

Ouvrez votre navigateur sur : **http://localhost:4005**

### 3. Tester le bouton Google

1. Cliquez sur **"Sign in with Google"**
2. Vous devriez être redirigé vers Google pour sélectionner un compte
3. Sélectionnez votre compte Google
4. Autorisez l'application
5. Vous serez automatiquement redirigé vers **http://localhost:4002** (user-preferences)

## 🔍 Vérification de la configuration

### Vérifier que les variables d'environnement sont chargées :

```bash
cd /home/ulrichakongo/Documents/actu/microservices
docker-compose exec user-authentication printenv | grep GOOGLE
```

Vous devriez voir :
```
GOOGLE_CLIENT_ID=442434439258-aptdg2rnmis2cqqd64p4kqn2nd8qrc2l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Tester l'endpoint Google OAuth :

```bash
curl -I http://localhost:4005/api/auth/google
```

Vous devriez recevoir une redirection (302) vers Google.

## ⚠️ Erreurs courantes

### Erreur : "redirect_uri_mismatch"

**Cause** : L'URI de redirection dans Google Cloud Console ne correspond pas.

**Solution** : 
1. Vérifiez que `http://localhost:4005/api/auth/google/callback` est bien dans les **Authorized redirect URIs**
2. Assurez-vous qu'il n'y a pas d'espace ou de caractère supplémentaire
3. Redémarrez le service après modification

### Erreur : "invalid_client"

**Cause** : Le Client ID ou Client Secret est incorrect.

**Solution** :
1. Vérifiez que les identifiants dans `docker-compose.yml` sont corrects
2. Redémarrez le service : `docker-compose restart user-authentication`

### Le bouton Google ne fait rien

**Cause** : Les variables d'environnement ne sont pas chargées.

**Solution** :
1. Vérifiez les logs : `docker-compose logs user-authentication`
2. Reconstruisez le conteneur : `docker-compose up -d --build user-authentication`

## 📝 Configuration dans docker-compose.yml

Les variables sont configurées dans `microservices/docker-compose.yml` :

```yaml
user-authentication:
  environment:
    - GOOGLE_CLIENT_ID=442434439258-aptdg2rnmis2cqqd64p4kqn2nd8qrc2l.apps.googleusercontent.com
    - GOOGLE_CLIENT_SECRET=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
    - FRONTEND_URL=http://localhost:4002
    - AUTH_SERVICE_URL=http://localhost:4005
```

## 🔐 Sécurité

⚠️ **Important** : 
- Ne partagez jamais votre Client Secret publiquement
- Ne commitez pas le `docker-compose.yml` avec les secrets dans un dépôt public
- Utilisez des variables d'environnement ou un gestionnaire de secrets en production

## ✅ Checklist de vérification

- [x] Identifiants Google ajoutés dans `docker-compose.yml`
- [x] Variables d'environnement chargées dans le conteneur
- [x] Endpoint Google OAuth fonctionnel (redirection vers Google)
- [ ] URI de redirection configurée dans Google Cloud Console : `http://localhost:4005/api/auth/google/callback`
- [ ] API Google+ ou Google Identity activée dans Google Cloud Console
- [ ] Test de connexion Google réussi

## ✅ Statut actuel

Les identifiants Google OAuth ont été intégrés avec succès :

- ✅ **Client ID** : `442434439258-aptdg2rnmis2cqqd64p4kqn2nd8qrc2l.apps.googleusercontent.com`
- ✅ **Client Secret** : `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`
- ✅ **Variables chargées** : Vérifiées dans le conteneur Docker
- ✅ **Endpoint fonctionnel** : `/api/auth/google` redirige correctement vers Google

**Prochaine étape** : Configurer l'URI de redirection dans Google Cloud Console pour finaliser la configuration.

---

**Une fois ces étapes terminées, la connexion Google sera fonctionnelle !** 🎉
