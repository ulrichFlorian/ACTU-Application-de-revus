import pymysql
from app import app, db

def create_database():
    # Se connecter au serveur MySQL (sans spécifier de base de données)
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        charset='utf8mb4'
    )
    
    try:
        with connection.cursor() as cursor:
            # Créer la base de données si elle n'existe pas
            cursor.execute("CREATE DATABASE IF NOT EXISTS todolist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("Base de données créée avec succès!")
        connection.commit()
        
        # Maintenant que la base de données existe, on peut créer les tables
        with app.app_context():
            db.create_all()
            print("Tables créées avec succès!")
            
    except Exception as e:
        print(f"Erreur lors de la création de la base de données: {e}")
    finally:
        connection.close()

if __name__ == '__main__':
    create_database()
