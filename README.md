# Application To-Do List

Une application web de gestion de tâches développée avec Python (Flask) et Tailwind CSS.

## Fonctionnalités

- ✅ Création de compte utilisateur
- 🔒 Authentification sécurisée
- ➕ Ajout de tâches avec titre, description et date d'échéance
- ✅ Marquer les tâches comme terminées
- 🗑️ Suppression de tâches
- 🔍 Filtrage des tâches (toutes, en cours, terminées)
- 🎨 Interface moderne et réactive

## Prérequis

- Python 3.8+
- pip (gestionnaire de paquets Python)

## Installation

1. Clonez le dépôt :
   ```bash
   git clone [URL_DU_REPO]
   cd ToDolist
   ```

2. Créez et activez un environnement virtuel :
   ```bash
   # Sur Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # Sur macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

1. Initialisez la base de données :
   ```bash
   python
   >>> from app import app, db
   >>> with app.app_context():
   ...     db.create_all()
   ```

## Lancement de l'application

```bash
python app.py
```

Ouvrez votre navigateur et accédez à : http://localhost:5000

## Structure du projet

```
ToDolist/
├── app.py                 # Point d'entrée de l'application
├── requirements.txt       # Dépendances Python
├── instance/
│   └── todos.db          # Base de données SQLite (créée après le premier lancement)
└── templates/             # Templates HTML
    ├── base.html         # Template de base
    ├── index.html        # Page d'accueil
    ├── login.html        # Page de connexion
    ├── register.html     # Page d'inscription
    └── dashboard.html    # Tableau de bord des tâches
```

## Technologies utilisées

- **Backend** : Python, Flask, SQLAlchemy
- **Frontend** : HTML5, Tailwind CSS, JavaScript
- **Base de données** : SQLite

## Licence

Ce projet est sous licence MIT.
