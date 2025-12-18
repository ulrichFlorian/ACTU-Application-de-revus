# ⚡ Déploiement Vercel - Guide rapide

## 🚀 En 3 étapes simples

### 1️⃣ Créer un compte et importer le projet

1. Aller sur **https://vercel.com**
2. **"Sign Up"** → **"Continue with GitHub"**
3. **"Add New Project"**
4. Sélectionner ton repo GitHub (`actu`)
5. Vercel détecte automatiquement React ✅

---

### 2️⃣ Configurer les variables d'environnement

Avant de déployer, cliquer sur **"Environment Variables"** et ajouter :

```
REACT_APP_GNEWS_API_KEY=cb246a4da7dc041b6020dd5f7a16db88
REACT_APP_API_URL=https://api-gateway.up.railway.app
```

**Note** : Remplace l'URL par celle de ton API Gateway une fois déployé sur Railway.

---

### 3️⃣ Déployer

1. Cliquer sur **"Deploy"**
2. Attendre 2-3 minutes
3. ✅ **Application en ligne !**

URL générée : `https://actu-xxxxx.vercel.app`

---

## 🔄 Déploiement automatique

Après la première configuration, chaque `git push` déploie automatiquement !

```bash
git add .
git commit -m "Mise à jour"
git push origin main
# → Vercel déploie automatiquement
```

---

## ⚠️ Important

- **Frontend uniquement** : Vercel héberge seulement le React dans `src/`
- **Backend séparé** : Les microservices doivent être sur Railway/Render
- **CORS** : Configurer CORS dans les microservices pour autoriser l'URL Vercel

---

## 📚 Guide complet

Pour plus de détails, voir **VERCEL_DEPLOY.md**

