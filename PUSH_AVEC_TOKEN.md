# 🚀 Pousser vers GitHub avec HTTPS (Token)

## ✅ Configuration terminée

Ton dépôt est configuré en HTTPS :
```
origin  https://github.com/ulrichFlorian/ACTU-Application-de-revus-.git
```

## 🔑 Étape suivante : Créer un Personal Access Token

GitHub n'accepte plus les mots de passe. Tu dois utiliser un **Personal Access Token (PAT)**.

### 1. Créer un token sur GitHub

1. Va sur : https://github.com/settings/tokens
2. Clique sur **"Generate new token"** → **"Generate new token (classic)"**
3. Donne un nom : `ACTU-Project` (ou n'importe quel nom)
4. Sélectionne la durée : **90 days** (ou plus)
5. Coche les permissions :
   - ✅ **repo** (toutes les cases sous "repo")
6. Clique sur **"Generate token"** en bas
7. **⚠️ IMPORTANT** : Copie le token immédiatement ! Tu ne pourras plus le voir après.

### 2. Pousser le code

Une fois le token créé, lance :

```bash
cd /home/ulrichakongo/Documents/actu
git push -u origin Akongo
```

Quand GitHub demande :
- **Username** : `ulrichFlorian`
- **Password** : Colle le **token** (pas ton mot de passe GitHub)

## ✅ Alternative : Stocker le token

Pour éviter de le retaper à chaque fois, tu peux le stocker :

```bash
# Stocker le token dans le cache Git (15 minutes)
git config --global credential.helper cache

# Ou stocker de manière permanente (moins sécurisé)
git config --global credential.helper store
```

## 🎯 Résumé

1. ✅ Remote configuré en HTTPS
2. ✅ Branche `Akongo` créée
3. ✅ Code commité
4. ⏳ **Créer un token GitHub** (étape actuelle)
5. ⏳ **Pousser avec `git push -u origin Akongo`**

Une fois le token créé, tu peux pousser le code ! 🚀

