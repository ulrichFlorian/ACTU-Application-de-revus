// Script pour vérifier toutes les bases de données et collections
// Exécuter avec: mongosh check-databases.js

print("🔍 VÉRIFICATION COMPLÈTE DES MICROSERVICES");
print("=" * 50);

// 1. Service User Authentication
print("\n1️⃣ SERVICE USER AUTHENTICATION (Base: auth)");
print("-" * 40);
db = db.getSiblingDB('auth');
print("Collections:", db.getCollectionNames());
print("Nombre d'utilisateurs:", db.users.countDocuments());
print("Nombre de sessions:", db.sessions.countDocuments());

if (db.users.countDocuments() > 0) {
    print("\n📋 Dernier utilisateur créé:");
    db.users.findOne({}, {sort: {createdAt: -1}});
}

// 2. Service User Preferences
print("\n2️⃣ SERVICE USER PREFERENCES (Base: user-preferences)");
print("-" * 40);
db = db.getSiblingDB('user-preferences');
print("Collections:", db.getCollectionNames());
print("Nombre de préférences:", db.userpreferences.countDocuments());
print("Nombre de profils:", db.userprofiles.countDocuments());

// 3. Service Content Categories
print("\n3️⃣ SERVICE CONTENT CATEGORIES (Base: categories)");
print("-" * 40);
db = db.getSiblingDB('categories');
print("Collections:", db.getCollectionNames());
print("Nombre de catégories:", db.categories.countDocuments());
print("Nombre de contenus:", db.contentmetadata.countDocuments());

// 4. Service Recommendations
print("\n4️⃣ SERVICE RECOMMENDATIONS (Base: recommendations)");
print("-" * 40);
db = db.getSiblingDB('recommendations');
print("Collections:", db.getCollectionNames());
print("Nombre de recommandations:", db.userrecommendations.countDocuments());
print("Nombre de modèles:", db.recommendationmodels.countDocuments());

// 5. Résumé global
print("\n📊 RÉSUMÉ GLOBAL");
print("=" * 30);
print("Toutes les bases de données:");
db.adminCommand('listDatabases').databases.forEach(db => {
    if (['auth', 'user-preferences', 'categories', 'recommendations'].includes(db.name)) {
        print(`- ${db.name}: ${(db.sizeOnDisk / 1024).toFixed(2)} KB`);
    }
});

print("\n✅ Vérification terminée!");

