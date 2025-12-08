import './App.css';
import { useEffect, useState } from 'react';
import config from './config';

function App() {
  const [query, setQuery] = useState('technologie');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  async function search() {
    setLoading(true);
    setError(null);
    try {
      // Utiliser l'API Gateway pour accéder au service content-feed
      const apiUrl = `${config.API_GATEWAY_URL}/api/feed/search?q=${encodeURIComponent(query)}&limit=10`;
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      // Le service retourne { feed: [...] } ou { articles: [...] }
      setArticles(data.feed || data.articles || []);
    } catch (e) {
      console.error('Erreur lors de la recherche:', e);
      let errorMessage = e.message || 'Erreur lors de la récupération des articles';
      
      // Messages d'erreur plus détaillés
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        errorMessage = `Impossible de se connecter à l'API Gateway. Vérifications :
        - L'instance Render est-elle active ? (peut prendre 30-60s après inactivité)
        - L'URL est-elle correcte ? (${config.API_GATEWAY_URL})
        - Les variables d'environnement sont-elles configurées dans Vercel ?`;
      } else if (e.message.includes('CORS')) {
        errorMessage = `Erreur CORS : Les services Render doivent autoriser le domaine Vercel.`;
      }
      
      setError(errorMessage);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadGeneralFeed() {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `${config.API_GATEWAY_URL}/api/feed/general?limit=20`;
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setArticles(data.feed || []);
    } catch (e) {
      console.error('Erreur lors du chargement du flux:', e);
      let errorMessage = e.message || 'Erreur lors de la récupération des articles';
      
      // Messages d'erreur plus détaillés
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        errorMessage = `Impossible de se connecter à l'API Gateway. Vérifications :
        - L'instance Render est-elle active ? (peut prendre 30-60s après inactivité)
        - L'URL est-elle correcte ? (${config.API_GATEWAY_URL})
        - Les variables d'environnement sont-elles configurées dans Vercel ?`;
      } else if (e.message.includes('CORS')) {
        errorMessage = `Erreur CORS : Les services Render doivent autoriser le domaine Vercel.`;
      }
      
      setError(errorMessage);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Charger le flux général au démarrage
    loadGeneralFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App" style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: 24 }}>
        📰 Actu - Application de revue
      </h1>
      
      {/* Afficher l'URL de l'API en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ padding: 8, backgroundColor: '#e7f3ff', borderRadius: 4, marginBottom: 12, fontSize: 12, color: '#666' }}>
          🔗 API Gateway: {config.API_GATEWAY_URL}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Rechercher (ex: sport, politique, technologie)" 
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', fontSize: 16, border: '1px solid #ddd', borderRadius: 4 }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              search();
            }
          }}
        />
        <button 
          onClick={search} 
          disabled={loading} 
          style={{ 
            padding: '10px 20px', 
            fontSize: 16, 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Chargement...' : '🔍 Rechercher'}
        </button>
        <button 
          onClick={loadGeneralFeed} 
          disabled={loading} 
          style={{ 
            padding: '10px 20px', 
            fontSize: 16, 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          📰 Flux général
        </button>
      </div>
      
      {error && (
        <div style={{ padding: 16, backgroundColor: '#f8d7da', color: '#721c24', borderRadius: 4, marginBottom: 12, border: '1px solid #f5c6cb' }}>
          <strong>⚠️ Erreur :</strong> {error}
          <div style={{ marginTop: 8, fontSize: 14 }}>
            <p>Vérifications à faire :</p>
            <ul style={{ marginLeft: 20, marginTop: 4 }}>
              <li>L'API Gateway est-il actif sur Render ?</li>
              <li>L'URL configurée est-elle correcte ? ({config.API_GATEWAY_URL})</li>
              <li>Les variables d'environnement sont-elles configurées dans Vercel ?</li>
            </ul>
          </div>
        </div>
      )}
      
      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
          <div>Chargement des articles...</div>
        </div>
      )}
      
      {articles.length === 0 && !loading && !error && (
        <div style={{ padding: 40, textAlign: 'center', color: '#666', backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Aucun article trouvé</div>
          <div style={{ fontSize: 14 }}>Essayez une autre recherche ou cliquez sur "Flux général"</div>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {articles.map((a, index) => (
          <a 
            key={a.url || a.link || index} 
            href={a.url || a.link || '#'} 
            target="_blank" 
            rel="noreferrer" 
            style={{ textDecoration: 'none', color: '#111', border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', transition: 'transform 0.2s', display: 'block' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img 
              src={a.image || a.urlToImage || 'https://picsum.photos/400/240?blur=1'} 
              alt={a.title || a.headline || 'Article'} 
              style={{ width: '100%', height: 140, objectFit: 'cover' }} 
              onError={(e) => {
                e.target.src = 'https://picsum.photos/400/240?blur=1';
              }}
            />
            <div style={{ padding: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>
                {a.title || a.headline || 'Sans titre'}
              </div>
              <div style={{ color: '#666', fontSize: 12 }}>
                {(a.source?.name || a.source) || 'Source inconnue'} • {a.publishedAt || a.published_date ? new Date(a.publishedAt || a.published_date).toLocaleString('fr-FR') : ''}
              </div>
              {a.description && (
                <div style={{ color: '#555', fontSize: 12, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {a.description}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
