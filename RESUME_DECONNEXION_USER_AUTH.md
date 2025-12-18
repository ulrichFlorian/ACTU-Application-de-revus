# ✅ Résumé - Déconnexion sur l'interface User Authentication

## 🎯 Modifications effectuées

### 1. ✅ Identifiants Google restaurés

**Dans `docker-compose.yml`** :
- `GOOGLE_CLIENT_ID=442434439258-aptdg2rnmis2cqqd64p4kqn2nd8qrc2l.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET=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`
- `FRONTEND_URL=http://localhost:4002`
- `AUTH_SERVICE_URL=http://localhost:4005`

### 2. ✅ Vue utilisateur connecté ajoutée

**Dans `user-authentication/public/index.html`** :
- Nouvelle vue "userView" qui s'affiche quand l'utilisateur est connecté
- Affiche :
  - Avatar avec initiale de l'utilisateur
  - Nom de l'utilisateur
  - Email de l'utilisateur
  - Bouton "Se déconnecter"
  - Lien vers user-preferences

### 3. ✅ Redirection après connexion Google

**Dans `googleAuth.js`** :
- Après connexion Google réussie, redirection vers `user-authentication` (port 4005) au lieu de `user-preferences`
- Les infos utilisateur et le token sont passés dans l'URL
- La vue utilisateur connecté s'affiche automatiquement

### 4. ✅ Fonction de déconnexion

**Fonctionnalités** :
- Bouton "Se déconnecter" dans la vue utilisateur connecté
- Supprime le token et les données utilisateur de `localStorage`
- Appelle l'API `/api/auth/logout`
- Redirige vers la page de connexion (recharge la page)

### 5. ✅ Forcer la sélection du compte Google

**Dans `googleAuth.js`** :
- Route `/api/auth/google` redirige directement vers Google avec `prompt=select_account`
- Google demande toujours de sélectionner un compte, même après déconnexion

## 🔄 Flux complet

### Connexion avec Google :
```
1. Utilisateur ouvre http://localhost:4005
   ↓
2. Clique sur "Sign in with Google"
   ↓
3. Redirection vers Google avec prompt=select_account
   ↓
4. Google demande de sélectionner un compte
   ↓
5. Utilisateur sélectionne un compte
   ↓
6. Google redirige vers /api/auth/google/callback
   ↓
7. Token JWT généré
   ↓
8. Redirection vers http://localhost:4005?token=...&user=...
   ↓
9. Vue "utilisateur connecté" s'affiche avec :
   - Avatar avec initiale
   - Nom et email
   - Bouton "Se déconnecter"
   - Lien vers user-preferences
```

### Déconnexion :
```
1. Utilisateur clique sur "Se déconnecter"
   ↓
2. Appel API: POST /api/auth/logout
   ↓
3. Token supprimé de localStorage
   ↓
4. Données utilisateur supprimées de localStorage
   ↓
5. Redirection vers http://localhost:4005 (page de connexion)
```

### Reconnexion après déconnexion :
```
1. Utilisateur clique sur "Sign in with Google"
   ↓
2. Redirection vers Google avec prompt=select_account
   ↓
3. Google demande à nouveau de sélectionner un compte
   ↓
4. (Même flux que la connexion initiale)
```

## 📝 Code clé

### Route Google avec prompt=select_account :
```javascript
router.get('/google', (req, res) => {
  const callbackUrl = process.env.NODE_ENV === 'production' && process.env.AUTH_SERVICE_URL
    ? `${process.env.AUTH_SERVICE_URL}/api/auth/google/callback`
    : `http://localhost:4005/api/auth/google/callback`;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `scope=${encodeURIComponent('profile email')}&` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `prompt=select_account`; // Force la sélection du compte
  
  res.redirect(authUrl);
});
```

### Callback Google - Redirection vers user-authentication :
```javascript
// Rediriger vers user-authentication avec le token
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4005';
res.redirect(`${authServiceUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(user.toPublicJSON()))}`);
```

### Fonction de déconnexion frontend :
```javascript
async function handleLogout() {
    const token = localStorage.getItem('token');
    
    // Appeler l'API de déconnexion
    if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token: token })
        });
    }
    
    // Supprimer les données locales
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Rediriger vers la page de connexion
    window.location.href = API_URL;
}
```

## ✅ Vérifications

- [x] Identifiants Google restaurés dans docker-compose.yml
- [x] Vue utilisateur connecté créée
- [x] Redirection après connexion Google vers user-authentication
- [x] Affichage des infos utilisateur (nom, email, avatar)
- [x] Bouton de déconnexion fonctionnel
- [x] Déconnexion redirige vers la page de connexion
- [x] `prompt=select_account` présent dans l'URL Google
- [x] Google demande toujours de sélectionner un compte

## 🧪 Test complet

1. **Se connecter avec Google** :
   - Ouvrez http://localhost:4005
   - Cliquez sur "Sign in with Google"
   - Sélectionnez votre compte Google
   - Vérifiez que la vue "utilisateur connecté" s'affiche avec vos infos

2. **Se déconnecter** :
   - Cliquez sur "Se déconnecter"
   - Vérifiez que vous êtes redirigé vers la page de connexion
   - Vérifiez que le token est supprimé (F12 > Application > Local Storage)

3. **Se reconnecter** :
   - Cliquez sur "Sign in with Google"
   - Vérifiez que Google demande de sélectionner un compte (pas de connexion automatique)
   - Sélectionnez votre compte
   - Vérifiez que la vue utilisateur connecté s'affiche à nouveau

---

**Toutes les fonctionnalités sont maintenant opérationnelles sur l'interface user-authentication !** 🎉
