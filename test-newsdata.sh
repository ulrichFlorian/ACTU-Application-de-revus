#!/bin/bash

echo "🧪 Test de l'API NewsData.io pour le Cameroun"
echo "=============================================="
echo ""

# Test 1: Santé
echo "📋 Test 1: Catégorie 'sante'"
echo "----------------------------"
curl -s "http://localhost:4003/api/feed/category/sante?limit=3" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    feed = data.get('feed', [])
    sections = data.get('sections', {})
    
    print(f\"✅ Total articles: {len(feed)}\")
    print(f\"   - International: {sections.get('international', 0)}\")
    print(f\"   - Local (Cameroun): {sections.get('local', 0)}\")
    print()
    
    local_articles = [a for a in feed if a.get('section') == 'local']
    if local_articles:
        print(f\"🇨🇲 Articles locaux trouvés: {len(local_articles)}\")
        for i, article in enumerate(local_articles[:3], 1):
            print(f\"   {i}. {article.get('title', 'Sans titre')[:60]}...\")
            print(f\"      Section: {article.get('section')}, Pays: {article.get('countryName', 'N/A')}\")
    else:
        print(\"⚠️  Aucun article local trouvé\")
        print(\"   Vérifiez que NewsData.io retourne des articles pour le Cameroun\")
except Exception as e:
    print(f\"❌ Erreur: {e}\")
    sys.exit(1)
"

echo ""
echo "📋 Test 2: Catégorie 'people' (entertainment)"
echo "----------------------------------------------"
curl -s "http://localhost:4003/api/feed/category/people?limit=3" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    feed = data.get('feed', [])
    sections = data.get('sections', {})
    
    print(f\"✅ Total articles: {len(feed)}\")
    print(f\"   - International: {sections.get('international', 0)}\")
    print(f\"   - Local (Cameroun): {sections.get('local', 0)}\")
    print()
    
    local_articles = [a for a in feed if a.get('section') == 'local']
    if local_articles:
        print(f\"🇨🇲 Articles locaux trouvés: {len(local_articles)}\")
        for i, article in enumerate(local_articles[:3], 1):
            print(f\"   {i}. {article.get('title', 'Sans titre')[:60]}...\")
    else:
        print(\"⚠️  Aucun article local trouvé\")
except Exception as e:
    print(f\"❌ Erreur: {e}\")
"

echo ""
echo "🔍 Vérification des logs NewsData.io"
echo "-------------------------------------"
echo "Exécutez: docker-compose logs content-feed | grep -i newsdata"
echo ""
