import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [query, setQuery] = useState('technologie');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const apiKey = process.env.REACT_APP_GNEWS_API_KEY;

  async function search() {
    if (!apiKey) {
      alert('Clé GNews absente. Définissez REACT_APP_GNEWS_API_KEY.');
      return;
    }
    setLoading(true);
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=fr&country=fr&max=10&apikey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (e) {
      console.error(e);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Recherche initiale
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App" style={{ padding: 16 }}>
      <h2>Recherche GNews (client)</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Mot-clé (ex: sport, politique)" />
        <button onClick={search} disabled={loading}>{loading ? 'Chargement...' : 'Rechercher'}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {articles.map((a) => (
          <a key={a.url} href={a.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#111', border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
            <img src={a.image || 'https://picsum.photos/400/240?blur=1'} alt={a.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            <div style={{ padding: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{a.title}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{(a.source && a.source.name) || 'Source inconnue'} • {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ''}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
