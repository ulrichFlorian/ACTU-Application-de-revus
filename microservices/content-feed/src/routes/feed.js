const express = require('express');
const axios = require('axios');
const RSSParser = require('rss-parser');
const cheerio = require('cheerio');

const router = express.Router();

// Obtenir le flux personnalisé pour un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      limit = 20, 
      offset = 0,
      algorithm = 'hybrid',
      refresh = false 
    } = req.query;

    const cacheKey = `feed:${userId}:${algorithm}:${limit}:${offset}`;
    
    // Vérifier le cache Redis si pas de refresh
    if (!refresh && req.redis) {
      try {
        const cachedFeed = await req.redis.get(cacheKey);
        if (cachedFeed) {
          return res.json({
            feed: JSON.parse(cachedFeed),
            cached: true,
            timestamp: new Date().toISOString()
          });
        }
      } catch (cacheError) {
        console.warn('Erreur cache Redis:', cacheError);
      }
    }

    // Générer le flux personnalisé
    const feed = await generatePersonalizedFeed(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      algorithm
    });

    // Mettre en cache le résultat
    if (req.redis && feed.length > 0) {
      try {
        await req.redis.setEx(cacheKey, 300, JSON.stringify(feed)); // Cache 5 minutes
      } catch (cacheError) {
        console.warn('Erreur mise en cache Redis:', cacheError);
      }
    }

    res.json({
      feed,
      cached: false,
      timestamp: new Date().toISOString(),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: feed.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du flux:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la génération du flux' 
    });
  }
});

// Obtenir le flux général (non personnalisé)
router.get('/general', async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0,
      category,
      trending = false 
    } = req.query;

    let endpoint = `http://content-categories:3005/api/content?limit=${limit}&offset=${offset}`;
    
    if (category) {
      endpoint += `&category=${category}`;
    }
    
    if (trending === 'true') {
      endpoint = `http://content-categories:3005/api/content/trending/now?limit=${limit}`;
    }

    const response = await axios.get(endpoint);
    const contents = response.data.contents || [];

    // Enrichir avec les recommandations si possible
    const enrichedFeed = await enrichFeedWithRecommendations(contents);

    res.json({
      feed: enrichedFeed,
      timestamp: new Date().toISOString(),
      type: trending === 'true' ? 'trending' : 'general'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du flux général:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération du flux général' 
    });
  }
});

// Obtenir le flux par catégorie
router.get('/category/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const limitInt = parseInt(limit, 10) || 20;
    const offsetInt = parseInt(offset, 10) || 0;

    const aggregatedArticles = [];

    // Appeler GNews et NewsAPI en parallèle pour de meilleures performances
    const apiPromises = [];

    // Priorité 0: GNews pour toute catégorie si clé disponible
    if (process.env.GNEWS_API_KEY) {
      const gNewsPromise = (async () => {
        try {
          const gCat = mapToGNewsCategory(categorySlug);
          let gnews = [];
          if (gCat) {
            gnews = await fetchGNewsTopHeadlines(gCat, limitInt);
          } else {
            gnews = await fetchGNewsByTopic(categorySlug, limitInt);
          }
          if (gnews.length > 0) {
            return gnews.map(article => ({ ...article, origin: 'gnews' }));
          }
        } catch (e) {
          console.warn('[GNews] Erreur:', e.message);
        }
        return [];
      })();
      apiPromises.push(gNewsPromise);
    }

    // Priorité 0 bis: API Afrique (NewsAPI)
    if (process.env.AFRICA_NEWS_API_KEY || process.env.NEWSAPI_KEY) {
      const africaNewsPromise = (async () => {
        try {
          console.log(`[Feed] Appel NewsAPI Afrique pour "${categorySlug}"...`);
          const africaNews = await fetchAfricaNewsByTopic(categorySlug, limitInt);
          if (africaNews.length > 0) {
            console.log(`[Feed] ${africaNews.length} articles africains trouvés pour "${categorySlug}"`);
            return africaNews.map(article => ({ ...article, origin: 'africa-news' }));
          } else {
            console.log(`[Feed] Aucun article africain trouvé pour "${categorySlug}"`);
          }
        } catch (e) {
          console.error('[Feed] Erreur NewsAPI Afrique:', e.message);
        }
        return [];
      })();
      apiPromises.push(africaNewsPromise);
    }

    // Attendre toutes les réponses en parallèle
    const results = await Promise.all(apiPromises);
    results.forEach(articles => {
      if (articles && articles.length > 0) {
        aggregatedArticles.push(...articles);
      }
    });

    const mergedTopArticles = dedupeAndSortArticles(aggregatedArticles, limitInt);
    if (mergedTopArticles.length > 0) {
      const origins = Array.from(
        new Set(mergedTopArticles.map(a => a.origin).filter(Boolean))
      ).join(',');
      return res.json({
        feed: mergedTopArticles.slice(offsetInt, offsetInt + limitInt),
        category: categorySlug,
        timestamp: new Date().toISOString(),
        source: origins || 'aggregated'
      });
    }

    // Priorité: SportyTrader pour 'sport'
    if (categorySlug.toLowerCase() === 'sport' || categorySlug.toLowerCase() === 'sports') {
      try {
        const sporty = await fetchSportyTraderNews(limitInt);
        if (sporty.length > 0) {
          return res.json({
            feed: sporty.slice(0, limitInt),
            category: categorySlug,
            timestamp: new Date().toISOString(),
            source: 'sportytrader'
          });
        }
      } catch (e) {
        console.warn('Fallback SportyTrader échoué:', e.message);
      }
      // Fallback 2: Google News RSS filtré sur sportytrader.com
      try {
        const rssSite = await fetchGoogleNewsSiteRSS('sportytrader.com', 'sport', limitInt);
        if (rssSite.length > 0) {
          return res.json({
            feed: rssSite.slice(0, limitInt),
            category: categorySlug,
            timestamp: new Date().toISOString(),
            source: 'google-news:site:sportytrader.com'
          });
        }
      } catch (e) {
        console.warn('Fallback Google site:sportytrader.com échoué:', e.message);
      }
    }

    let contents = [];
    try {
      const response = await axios.get(
        `http://content-categories:3005/api/content?category=${categorySlug}&limit=${limit}&offset=${offset}`
      );
      contents = response.data.contents || [];
    } catch (innerErr) {
      console.warn('Categories service indisponible, tentative fallback RSS:', innerErr.message);
    }

    // Fallback: Google News RSS si pas de contenu
    if (!contents || contents.length === 0) {
      const rssItems = await fetchGoogleNewsRSS(categorySlug, limitInt);
      contents = rssItems.map(mapRssItemToContent);
    }

    const enrichedFeed = await enrichFeedWithRecommendations(contents);

    // Si toujours pas de contenu, retourner un tableau vide avec un message
    if (!enrichedFeed || enrichedFeed.length === 0) {
      return res.json({
        feed: [],
        category: categorySlug,
        timestamp: new Date().toISOString(),
        message: 'Aucune actualité disponible pour cette catégorie',
        source: 'fallback'
      });
    }

    res.json({
      feed: enrichedFeed,
      category: categorySlug,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du flux par catégorie:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération du flux par catégorie' 
    });
  }
});

// Rechercher dans le flux
router.get('/search', async (req, res) => {
  try {
    const { 
      query, 
      limit = 20, 
      offset = 0,
      category,
      source 
    } = req.query;

    if (!query) {
      return res.status(400).json({ 
        error: 'Paramètre de recherche requis' 
      });
    }

    let endpoint = `http://content-categories:3005/api/content?limit=${limit}&offset=${offset}`;
    
    if (category) {
      endpoint += `&category=${category}`;
    }
    
    if (source) {
      endpoint += `&source=${source}`;
    }

    const response = await axios.get(endpoint);
    const allContents = response.data.contents || [];
    
    // Filtrer par terme de recherche (simulation d'une recherche full-text)
    const filteredContents = allContents.filter(content => 
      content.title.toLowerCase().includes(query.toLowerCase()) ||
      content.description?.toLowerCase().includes(query.toLowerCase()) ||
      content.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    const enrichedFeed = await enrichFeedWithRecommendations(filteredContents);

    res.json({
      feed: enrichedFeed,
      query,
      results: filteredContents.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la recherche' 
    });
  }
});

// Fonction pour générer un flux personnalisé
async function generatePersonalizedFeed(userId, options) {
  try {
    // 1. Récupérer les préférences utilisateur
    const preferences = await getUserPreferences(userId);
    
    // 2. Récupérer les recommandations
    const recommendations = await getUserRecommendations(userId, options.algorithm, options.limit);
    
    // 3. Récupérer du contenu basé sur les préférences
    const preferenceBasedContent = await getContentByPreferences(preferences, options.limit);
    
    // 4. Récupérer du contenu tendance
    const trendingContent = await getTrendingContent(options.limit / 2);
    
    // 5. Mélanger et trier le contenu
    const allContent = [
      ...recommendations.map(rec => ({ ...rec, source: 'recommendation' })),
      ...preferenceBasedContent.map(content => ({ ...content, source: 'preferences' })),
      ...trendingContent.map(content => ({ ...content, source: 'trending' }))
    ];
    
    // Dédupliquer par contentId
    const uniqueContent = allContent.filter((content, index, self) => 
      index === self.findIndex(c => c.contentId === content.contentId)
    );
    
    // Trier par score de pertinence
    uniqueContent.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, preferences);
      const scoreB = calculateRelevanceScore(b, preferences);
      return scoreB - scoreA;
    });
    
    return uniqueContent.slice(options.offset, options.offset + options.limit);
    
  } catch (error) {
    console.error('Erreur lors de la génération du flux personnalisé:', error);
    return [];
  }
}

// Fonction pour récupérer les préférences utilisateur
async function getUserPreferences(userId) {
  try {
    const response = await axios.get(`http://user-preferences:3001/api/preferences/${userId}`);
    return response.data.preferences || {};
  } catch (error) {
    console.error('Erreur récupération préférences:', error);
    return {};
  }
}

// Fonction pour récupérer les recommandations
async function getUserRecommendations(userId, algorithm, limit) {
  try {
    const response = await axios.get(
      `http://content-recommendation:3003/api/recommendations/user/${userId}?algorithm=${algorithm}&limit=${limit}`
    );
    
    const recommendations = response.data.recommendations || [];
    
    // Récupérer les détails du contenu pour chaque recommandation
    const contentDetails = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const contentResponse = await axios.get(
            `http://content-categories:3005/api/content/${rec.contentId}`
          );
          return {
            ...contentResponse.data.content,
            recommendationScore: rec.score,
            recommendationReason: rec.reason
          };
        } catch (error) {
          console.warn(`Contenu non trouvé pour ${rec.contentId}:`, error.message);
          return null;
        }
      })
    );
    
    return contentDetails.filter(content => content !== null);
    
  } catch (error) {
    console.error('Erreur récupération recommandations:', error);
    return [];
  }
}

// Fonction pour récupérer du contenu basé sur les préférences
async function getContentByPreferences(preferences, limit) {
  try {
    const preferredCategories = preferences.categories?.preferred || ['technologie'];
    const category = preferredCategories[0];
    
    const response = await axios.get(
      `http://content-categories:3005/api/content?category=${category}&limit=${limit}`
    );
    
    return response.data.contents || [];
    
  } catch (error) {
    console.error('Erreur récupération contenu préférences:', error);
    return [];
  }
}

// Fonction pour récupérer du contenu tendance
async function getTrendingContent(limit) {
  try {
    const response = await axios.get(
      `http://content-categories:3005/api/content/trending/now?limit=${limit}`
    );
    
    return response.data.contents || [];
    
  } catch (error) {
    console.error('Erreur récupération contenu tendance:', error);
    return [];
  }
}

// --- Fallback RSS Google News ---
const CATEGORY_TO_GOOGLE_TOPIC = {
  politique: 'politique',
  sport: 'sport',
  technologie: 'technologie',
  'santé': 'sante',
  économie: 'economie',
  culture: 'culture',
  international: 'international',
  sciences: 'science',
  people: 'people',
};

async function fetchGoogleNewsRSS(categorySlug, limit) {
  try {
    const parser = new RSSParser();
    const topic = CATEGORY_TO_GOOGLE_TOPIC[categorySlug?.toLowerCase?.()] || categorySlug;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=fr&gl=FR&ceid=FR:fr`;
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, parseInt(limit));
  } catch (err) {
    console.error('Erreur fallback Google News RSS:', err.message);
    return [];
  }
}

async function fetchGoogleNewsSiteRSS(site, topic, limit) {
  try {
    const parser = new RSSParser();
    const query = `${topic ? topic + ' ' : ''}site:${site}`.trim();
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`;
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, parseInt(limit)).map(mapRssItemToContent);
  } catch (err) {
    console.error('Erreur Google News site RSS:', err.message);
    return [];
  }
}

function mapRssItemToContent(item) {
  return {
    contentId: item.guid || item.link,
    title: item.title,
    description: item.contentSnippet,
    url: item.link,
    imageUrl: extractImageFromRss(item),
    publishedAt: item.isoDate || item.pubDate,
    source: extractSourceFromLink(item.link),
    categories: [],
    engagement: { views: 0 }
  };
}

function extractSourceFromLink(link) {
  try {
    const u = new URL(link);
    return u.hostname.replace('www.', '');
  } catch (_) {
    return 'google-news';
  }
}

function extractImageFromRss(item) {
  // Google News RSS peut contenir des balises media:content
  const media = item.enclosure?.url || item['media:content']?.url;
  if (media) return media;
  // fallback
  return 'https://picsum.photos/400/240?blur=1';
}

// --- Scraper simple SportyTrader ---
async function fetchSportyTraderNews(limit) {
  const url = 'https://www.sportytrader.com/actualites/';
  const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(html);
  const articles = [];
  $('.bloc-actu, .article, article').each((_, el) => {
    const element = $(el);
    // Titre
    const title = element.find('h2, h3, .titre, .title').first().text().trim();
    // Lien
    let link = element.find('a').first().attr('href');
    if (link && !link.startsWith('http')) link = 'https://www.sportytrader.com' + link;
    // Image
    let image = element.find('img').first().attr('data-src') || element.find('img').first().attr('src');
    if (image && !image.startsWith('http')) image = 'https://www.sportytrader.com' + image;
    if (title && link) {
      articles.push({
        contentId: link,
        title,
        url: link,
        imageUrl: image || 'https://picsum.photos/400/240?blur=1',
        publishedAt: null,
        source: 'sportytrader.com',
        categories: [{ name: 'sport' }],
        engagement: { views: 0 }
      });
    }
  });
  return articles.slice(0, limit || 20);
}

// --- API Afrique (NewsAPI) ---
// Pays africains supportés par NewsAPI (codes ISO)
const AFRICAN_COUNTRIES = {
  'za': 'Afrique du Sud',
  'ng': 'Nigeria',
  'ke': 'Kenya',
  'eg': 'Égypte',
  'ma': 'Maroc',
  'dz': 'Algérie',
  'tn': 'Tunisie',
  'gh': 'Ghana',
  'ci': 'Côte d\'Ivoire',
  'sn': 'Sénégal',
  'cm': 'Cameroun',
  'rw': 'Rwanda',
  'et': 'Éthiopie',
  'tz': 'Tanzanie',
  'ug': 'Ouganda',
  'zm': 'Zambie',
  'zw': 'Zimbabwe',
  'ao': 'Angola',
  'mz': 'Mozambique',
  'mg': 'Madagascar'
};

// Mapping des catégories NewsAPI
const mapToNewsAPICategory = (topic) => {
  const t = (topic || '').toLowerCase().trim();
  const mapping = {
    'sport': 'sports',
    'sports': 'sports',
    'santé': 'health',
    'sante': 'health',
    'health': 'health',
    'technologie': 'technology',
    'technology': 'technology',
    'tech': 'technology',
    'économie': 'business',
    'economie': 'business',
    'business': 'business',
    'finance': 'business',
    'politique': 'general',
    'politics': 'general',
    'science': 'science',
    'divertissement': 'entertainment',
    'entertainment': 'entertainment',
    'cinéma': 'entertainment',
    'cinema': 'entertainment',
    'musique': 'entertainment',
    'people': 'entertainment',
    'culture': 'entertainment',
    'art': 'entertainment'
  };
  return mapping[t] || null;
};

async function fetchAfricaNewsByTopic(topic, limit) {
  const apiKey = process.env.AFRICA_NEWS_API_KEY || process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.warn('AFRICA_NEWS_API_KEY / NEWSAPI_KEY non définie');
    return [];
  }

  try {
    const normalizedTopic = (topic || '').replace(/-/g, ' ').trim() || 'afrique';
    const limitInt = parseInt(limit, 10) || 20;
    const allArticles = [];
    const seenUrls = new Set();

    // Stratégie 1: Utiliser /top-headlines avec les pays africains principaux
    // Cette méthode est plus rapide et retourne les articles les plus récents
    const topCountries = ['za', 'ng', 'ke', 'eg', 'ma', 'gh', 'ci', 'sn', 'cm'];
    const newsAPICategory = mapToNewsAPICategory(normalizedTopic);
    
    const topHeadlinesPromises = topCountries.slice(0, 5).map(async (countryCode) => {
      try {
        const params = new URLSearchParams({
          country: countryCode,
          pageSize: String(Math.min(5, Math.ceil(limitInt / 5))),
          apiKey: apiKey
        });
        
        // Ajouter la catégorie si disponible
        if (newsAPICategory) {
          params.append('category', newsAPICategory);
        } else {
          // Sinon, utiliser le topic comme query
          params.append('q', normalizedTopic);
        }
        
        const url = `https://newsapi.org/v2/top-headlines?${params.toString()}`;
        const { data } = await axios.get(url, { timeout: 8000 });
        
        if (data?.status === 'ok' && data.articles) {
          return data.articles.map(article => ({
            ...article,
            country: countryCode,
            countryName: AFRICAN_COUNTRIES[countryCode] || countryCode
          }));
        }
      } catch (err) {
        console.warn(`[NewsAPI] /top-headlines échoué pour ${countryCode}:`, err.response?.data?.message || err.message);
      }
      return [];
    });

    // Stratégie 2: Utiliser /everything pour une recherche plus large
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    
    const everythingPromise = (async () => {
      try {
        const africaQuery = `${normalizedTopic} AND (Africa OR Afrique OR ${Object.values(AFRICAN_COUNTRIES).slice(0, 10).join(' OR ')})`;
        const params = new URLSearchParams({
          q: africaQuery,
          sortBy: 'publishedAt',
          pageSize: String(Math.min(limitInt, 20)),
          from: fromDate,
          language: 'fr',
          apiKey: apiKey
        });
        
        const url = `https://newsapi.org/v2/everything?${params.toString()}`;
        const { data } = await axios.get(url, { timeout: 10000 });
        
        if (data?.status === 'ok' && data.articles) {
          return data.articles;
        }
      } catch (err) {
        console.warn(`[NewsAPI] /everything échoué:`, err.response?.data?.message || err.message);
      }
      return [];
    })();

    // Exécuter toutes les requêtes en parallèle
    const [topHeadlinesResults, everythingResults] = await Promise.all([
      Promise.all(topHeadlinesPromises),
      everythingPromise
    ]);

    // Fusionner et dédupliquer les résultats
    const allResults = [
      ...topHeadlinesResults.flat(),
      ...(Array.isArray(everythingResults) ? everythingResults : [])
    ];

    for (const article of allResults) {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        allArticles.push(article);
      }
    }

    console.log(`[NewsAPI Afrique] ${allArticles.length} articles uniques trouvés pour "${normalizedTopic}"`);

    if (allArticles.length === 0) {
      return [];
    }

    // Trier par date de publication (plus récent en premier)
    allArticles.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    return allArticles.slice(0, limitInt).map((article) => ({
      contentId: article.url,
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage || 'https://picsum.photos/400/240?blur=2',
      publishedAt: article.publishedAt,
      source: article.source?.name || extractSourceFromLink(article.url),
      country: article.country || null,
      countryName: article.countryName || null,
      categories: [{ name: normalizedTopic }],
      engagement: { views: 0 },
      region: 'africa'
    }));
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data?.code || error.message;
    console.error(`[NewsAPI Afrique] Erreur pour le topic "${topic}":`, errorMsg);
    if (error.response?.data) {
      console.error(`[NewsAPI Afrique] Détails:`, JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
}

// --- Agrégateur GNews ---
async function fetchGNewsByTopic(topic, limit) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('GNEWS_API_KEY non définie');
    return [];
  }
  
  try {
    // GNews: https://gnews.io/docs/v4#search
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=fr&country=fr&max=${parseInt(limit)}&apikey=${apiKey}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    
    if (!data || !data.articles) {
      console.warn(`GNews: réponse invalide pour le topic "${topic}"`);
      return [];
    }
    
    const articles = data.articles || [];
    return articles.map(a => ({
      contentId: a.url,
      title: a.title,
      description: a.description,
      url: a.url,
      imageUrl: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name || extractSourceFromLink(a.url),
      categories: [{ name: topic }],
      engagement: { views: 0 }
    }));
  } catch (error) {
    console.error(`Erreur GNews pour le topic "${topic}":`, error.response?.data || error.message);
    return [];
  }
}

async function fetchGNewsTopHeadlines(category, limit) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('GNEWS_API_KEY non définie');
    return [];
  }
  
  try {
    // Endpoint Top Headlines
    const url = `https://gnews.io/api/v4/top-headlines?category=${encodeURIComponent(category)}&lang=fr&country=fr&max=${parseInt(limit)}&apikey=${apiKey}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    
    if (!data || !data.articles) {
      console.warn(`GNews: réponse invalide pour la catégorie "${category}"`);
      return [];
    }
    
    const articles = data.articles || [];
    return articles.map(a => ({
      contentId: a.url,
      title: a.title,
      description: a.description,
      url: a.url,
      imageUrl: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name || extractSourceFromLink(a.url),
      categories: [{ name: category }],
      engagement: { views: 0 }
    }));
  } catch (error) {
    console.error(`Erreur GNews pour la catégorie "${category}":`, error.response?.data || error.message);
    return [];
  }
}

function mapToGNewsCategory(slug) {
  const s = (slug || '').toLowerCase();
  const mapping = {
    // GNews categories: general, world, nation, business, technology, entertainment, sports, science, health
    'général': 'general', 'general': 'general',
    'monde': 'world', 'world': 'world',
    'nation': 'nation', 'politique': 'nation',
    'entreprise': 'business', 'économie': 'business', 'economie': 'business', 'business': 'business', 'finance': 'business',
    'technologie': 'technology', 'technology': 'technology', 'tech': 'technology',
    'divertissement': 'entertainment', 'entertainment': 'entertainment', 'cinéma': 'entertainment', 'cinema': 'entertainment', 'musique': 'entertainment', 'people': 'entertainment', 'culture': 'entertainment', 'art': 'entertainment',
    'sport': 'sports', 'sports': 'sports',
    'science': 'science',
    'santé': 'health', 'sante': 'health', 'health': 'health'
  };
  return mapping[s] || null;
}

// Fonction pour calculer le score de pertinence
function calculateRelevanceScore(content, preferences) {
  let score = 0;
  
  // Score basé sur les recommandations
  if (content.recommendationScore) {
    score += content.recommendationScore * 0.5;
  }
  
  // Score basé sur les catégories préférées
  if (preferences.categories?.preferred) {
    const categoryMatch = content.categories?.some(cat => 
      preferences.categories.preferred.includes(cat.name.toLowerCase())
    );
    if (categoryMatch) score += 0.3;
  }
  
  // Score basé sur la popularité
  if (content.engagement?.views > 1000) score += 0.2;
  
  return Math.min(score, 1.0);
}

// Fonction pour enrichir le flux avec des recommandations
async function enrichFeedWithRecommendations(contents) {
  return contents.map(content => ({
    ...content,
    relevanceScore: content.engagement?.views / 10000 || 0.1, // Score basique
    enrichedAt: new Date().toISOString()
  }));
}

function dedupeAndSortArticles(articles, limit) {
  if (!articles || articles.length === 0) return [];

  const map = new Map();
  for (const article of articles) {
    const key = article.contentId || article.url;
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, article);
      continue;
    }
    const existing = map.get(key);
    const existingDate = existing.publishedAt ? new Date(existing.publishedAt).getTime() : 0;
    const currentDate = article.publishedAt ? new Date(article.publishedAt).getTime() : 0;
    if (currentDate > existingDate) {
      map.set(key, article);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit || 20);
}

module.exports = router;

