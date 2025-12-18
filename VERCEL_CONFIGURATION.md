# 🔧 Configuration Vercel - Guide Rapide

## ⚠️ Problème : Interface vide ou ancienne version

Si tu vois l'ancienne interface "Recherche GNews (client)" ou une page blanche, c'est que :
1. Le code n'a pas été poussé sur GitHub
2. Les variables d'environnement ne sont pas configurées dans Vercel
3. Vercel n'a pas redéployé avec le nouveau code

## ✅ Solution étape par étape

### Étape 1 : Pousser le code sur GitHub

```bash
# Vérifier les changements
git status

# Ajouter les fichiers modifiés
git add src/App.js src/config.js

# Commit
git commit -m "Mise à jour frontend pour utiliser API Gateway Render"

# Pousser sur GitHub
git push origin main
# ou
git push origin Akongo
```

### Étape 2 : Configurer les variables d'environnement dans Vercel

1. **Aller sur Vercel** : https://vercel.com
2. **Sélectionner ton projet** "Recherche GNews (client)"
3. **Aller dans Settings → Environment Variables**
4. **Ajouter ces variables** (remplace les URLs par tes vraies URLs Render) :

```env
REACT_APP_API_GATEWAY_URL=https://api-gateway.onrender.com
REACT_APP_GNEWS_API_KEY=cb246a4da7dc041b6020dd5f7a16db88
```

> ⚠️ **IMPORTANT** : 
> - Remplace `api-gateway.onrender.com` par la vraie URL de ton API Gateway sur Render
> - Les variables doivent commencer par `REACT_APP_` pour être accessibles dans React
> - Coche "Production", "Preview" et "Development"

### Étape 3 : Trouver les URLs Render

Sur Render, chaque service a une URL publique. Pour trouver l'URL de l'API Gateway :

1. **Aller sur Render** : https://render.com
2. **Cliquer sur le service "api-gateway"**
3. **Regarder la section "Service Information"**
4. **Copier l'URL publique** (format : `https://api-gateway-xxxxx.onrender.com`)

### Étape 4 : Redéployer sur Vercel

Après avoir ajouté les variables d'environnement :

1. **Aller dans l'onglet "Deployments"**
2. **Cliquer sur les 3 points (...) du dernier déploiement**
3. **Sélectionner "Redeploy"**
4. **Ou pousser un nouveau commit** : Vercel redéploiera automatiquement

### Étape 5 : Vérifier le déploiement

1. **Attendre la fin du build** (2-3 minutes)
2. **Ouvrir l'URL Vercel** (ex: `https://actu-application-de-revus.vercel.app`)
3. **Ouvrir la console du navigateur** (F12 → Console)
4. **Vérifier les erreurs** :
   - Si tu vois des erreurs CORS → Vérifier la configuration CORS dans Render
   - Si tu vois "Failed to fetch" → Vérifier que l'URL de l'API Gateway est correcte
   - Si tu vois "undefined" → Les variables d'environnement ne sont pas chargées

## 🔍 Vérification rapide

### Test 1 : Vérifier que l'API Gateway fonctionne

Ouvre dans ton navigateur :
```
https://api-gateway.onrender.com/health
```

Tu devrais voir :
```json
{
  "status": "OK",
  "service": "api-gateway",
  ...
}
```

### Test 2 : Vérifier les variables d'environnement dans Vercel

1. **Aller dans Vercel → Settings → Environment Variables**
2. **Vérifier que `REACT_APP_API_GATEWAY_URL` est bien configuré**
3. **Vérifier que la valeur est correcte** (commence par `https://`)

### Test 3 : Vérifier le code déployé

1. **Aller dans Vercel → Deployments → [Dernier déploiement] → Source**
2. **Vérifier que le commit contient les modifications de `App.js`**
3. **Si le commit est ancien, pousser un nouveau commit**

## 🐛 Dépannage

### Problème : Page blanche

**Cause** : Erreur JavaScript qui bloque le rendu

**Solution** :
1. Ouvrir la console du navigateur (F12)
2. Regarder les erreurs
3. Vérifier que `config.js` est bien importé dans `App.js`

### Problème : "Failed to fetch" ou erreur réseau

**Cause** : URL de l'API Gateway incorrecte ou service Render arrêté

**Solution** :
1. Vérifier que l'API Gateway est actif sur Render
2. Tester l'URL directement dans le navigateur
3. Vérifier les variables d'environnement dans Vercel

### Problème : Ancienne interface s'affiche

**Cause** : Vercel n'a pas redéployé avec le nouveau code

**Solution** :
1. Pousser un nouveau commit sur GitHub
2. Vercel redéploiera automatiquement
3. Ou forcer un redéploiement manuel dans Vercel

### Problème : Erreur CORS

**Cause** : Les services Render n'autorisent pas le domaine Vercel

**Solution** :
1. Vérifier que les services Render ont été redéployés avec la nouvelle configuration CORS
2. Ou temporairement autoriser toutes les origines dans Render (moins sécurisé)

## 📋 Checklist finale

- [ ] Code poussé sur GitHub (App.js et config.js modifiés)
- [ ] Variables d'environnement configurées dans Vercel
- [ ] URL de l'API Gateway correcte et testée
- [ ] Redéploiement effectué sur Vercel
- [ ] Console du navigateur vérifiée (pas d'erreurs)
- [ ] Interface affiche "Actu - Application de revue" (nouveau titre)
- [ ] Boutons "Rechercher" et "Flux général" visibles

## 🎯 Résultat attendu

Après configuration, tu devrais voir :
- **Titre** : "Actu - Application de revue" (pas "Recherche GNews (client)")
- **Champ de recherche** avec placeholder "Rechercher (ex: sport, politique, technologie)"
- **Bouton "Rechercher"**
- **Bouton "Flux général"**
- **Articles affichés** après chargement

Si tu vois encore l'ancienne interface, c'est que Vercel n'a pas redéployé avec le nouveau code !



