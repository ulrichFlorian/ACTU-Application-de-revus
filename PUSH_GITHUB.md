# 🚀 Envoyer le projet vers GitHub

## ✅ Étape 1 : Commit effectué

Ton projet a été commité avec succès sur la branche `Akongo` !

## 🔐 Étape 2 : Authentification GitHub

GitHub demande une authentification pour pousser le code. Tu as **3 options** :

---

## Option 1 : Token d'accès personnel (Recommandé)

### 1. Créer un token GitHub

1. Va sur GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Clique sur **"Generate new token (classic)"**
3. Donne un nom : `ACTU-Project`
4. Sélectionne les permissions : ✅ **repo** (toutes les cases)
5. Clique sur **"Generate token"**
6. **Copie le token** (tu ne pourras plus le voir après !)

### 2. Utiliser le token

```bash
cd /home/ulrichakongo/Documents/actu
git push -u origin Akongo
```

Quand GitHub demande :
- **Username** : `ulrichFlorian`
- **Password** : Colle le **token** (pas ton mot de passe GitHub)

---

## Option 2 : SSH (Plus sécurisé)

### 1. Générer une clé SSH

```bash
ssh-keygen -t ed25519 -C "ton-email@example.com"
# Appuie sur Entrée pour accepter le chemin par défaut
# Entrez un mot de passe (optionnel)
```

### 2. Copier la clé publique

```bash
cat ~/.ssh/id_ed25519.pub
```

### 3. Ajouter la clé sur GitHub

1. Va sur GitHub → **Settings** → **SSH and GPG keys**
2. Clique sur **"New SSH key"**
3. Colle le contenu de `~/.ssh/id_ed25519.pub`
4. Clique sur **"Add SSH key"**

### 4. Changer l'URL du remote

```bash
cd /home/ulrichakongo/Documents/actu
git remote set-url origin git@github.com:ulrichFlorian/ACTU-Application-de-revus-.git
git push -u origin Akongo
```

---

## Option 3 : GitHub CLI (Plus simple)

### 1. Installer GitHub CLI

```bash
# Sur Ubuntu/Debian
sudo apt install gh

# Ou via snap
sudo snap install gh
```

### 2. S'authentifier

```bash
gh auth login
# Suis les instructions à l'écran
```

### 3. Pousser le code

```bash
cd /home/ulrichakongo/Documents/actu
git push -u origin Akongo
```

---

## ✅ Vérification

Une fois le push réussi, vérifie sur GitHub :

```
https://github.com/ulrichFlorian/ACTU-Application-de-revus-/tree/Akongo
```

Tu devrais voir tous tes fichiers ! 🎉

---

## 📝 Résumé des commandes

```bash
# Si tu utilises un token (Option 1)
cd /home/ulrichakongo/Documents/actu
git push -u origin Akongo
# Username: ulrichFlorian
# Password: [ton-token]

# Si tu utilises SSH (Option 2)
cd /home/ulrichakongo/Documents/actu
git remote set-url origin git@github.com:ulrichFlorian/ACTU-Application-de-revus-.git
git push -u origin Akongo

# Si tu utilises GitHub CLI (Option 3)
cd /home/ulrichakongo/Documents/actu
gh auth login
git push -u origin Akongo
```

---

## ⚠️ Note importante

Le fichier `.env` a été ajouté au `.gitignore` pour ne pas être envoyé sur GitHub (contient des informations sensibles).

