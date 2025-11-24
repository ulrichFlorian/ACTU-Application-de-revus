# 🔑 Ajouter ta clé SSH à GitHub

## ✅ Étape 1 : Clé SSH trouvée

Ta clé SSH publique est :
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGk2aAOCEP2sLyCdnIEibnxCPSJUBXBl5jJt7McFvVSm ulrichakongo@gmail.com
```

## 📋 Étape 2 : Ajouter la clé sur GitHub

### 1. Copier la clé SSH

La clé est déjà affichée ci-dessus. Tu peux aussi la copier avec :

```bash
cat ~/.ssh/id_ed25519.pub
```

### 2. Aller sur GitHub

1. Va sur : https://github.com/settings/keys
2. Clique sur **"New SSH key"** (ou **"Add SSH key"**)
3. Donne un titre : `ACTU-Project` (ou n'importe quel nom)
4. Colle la clé SSH complète dans le champ **"Key"**
5. Clique sur **"Add SSH key"**

### 3. Vérifier la connexion

Une fois la clé ajoutée, teste la connexion :

```bash
ssh -T git@github.com
```

Tu devrais voir :
```
Hi ulrichFlorian! You've successfully authenticated, but GitHub does not provide shell access.
```

## 🚀 Étape 3 : Pousser le code

Une fois la clé ajoutée, pousse ton code :

```bash
cd /home/ulrichakongo/Documents/actu
git push -u origin Akongo
```

## ✅ C'est tout !

Ton projet sera envoyé sur GitHub sur la branche `Akongo` ! 🎉

