import './App.css';
import { useEffect, useState } from 'react';
import config from './config';

function App() {
  const [query, setQuery] = useState('technologie');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [authError, setAuthError] = useState(null);
  const [activeSection, setActiveSection] = useState('international'); // 'international' ou 'local'

  async function search() {
    setLoading(true);
    setError(null);
    setActiveSection('international'); // Réinitialiser à internationale par défaut
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
    setSelectedCategory(null);
    setActiveSection('international'); // Réinitialiser à internationale par défaut
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

  async function loadCategories() {
    try {
      const apiUrl = `${config.API_GATEWAY_URL}/api/categories`;
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.warn('Erreur lors du chargement des catégories:', e);
      // Si les catégories ne se chargent pas, on utilise des catégories par défaut
      setCategories([
        { name: 'Politique', slug: 'politique', icon: '🏛️', color: '#dc3545' },
        { name: 'Sport', slug: 'sport', icon: '⚽', color: '#28a745' },
        { name: 'Technologie', slug: 'technologie', icon: '💻', color: '#007bff' },
        { name: 'Santé', slug: 'sante', icon: '🏥', color: '#17a2b8' },
        { name: 'Économie', slug: 'economie', icon: '📈', color: '#ffc107' },
        { name: 'Culture', slug: 'culture', icon: '🎭', color: '#6f42c1' },
        { name: 'International', slug: 'international', icon: '🌍', color: '#20c997' },
        { name: 'Sciences', slug: 'sciences', icon: '🔬', color: '#fd7e14' }
      ]);
    }
  }

  async function loadCategoryFeed(categorySlug) {
    setLoading(true);
    setError(null);
    setSelectedCategory(categorySlug);
    setActiveSection('international'); // Réinitialiser à internationale par défaut
    try {
      const apiUrl = `${config.API_GATEWAY_URL}/api/feed/category/${encodeURIComponent(categorySlug)}?limit=20`;
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
      console.error('Erreur lors du chargement du flux par catégorie:', e);
      let errorMessage = e.message || 'Erreur lors de la récupération des articles';
      
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

  // Fonctions d'authentification
  async function handleLogin(e) {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch(`${config.API_GATEWAY_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      setShowLogin(false);
      // Charger les articles après connexion
      loadGeneralFeed();
    } catch (e) {
      setAuthError(e.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch(`${config.API_GATEWAY_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur d\'inscription');
      }
      
      // Après inscription, se connecter automatiquement
      setLoginForm({ email: registerForm.email, password: registerForm.password });
      await handleLogin(e);
    } catch (e) {
      setAuthError(e.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setArticles([]);
  }

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', e);
      }
    }
    
    // Charger les catégories et le flux général au démarrage
    loadCategories();
    if (isAuthenticated || !token) {
      loadGeneralFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App" style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      {/* En-tête avec authentification */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ color: '#333', margin: 0 }}>
          📰 Actu - Application de revue
        </h1>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#666', fontSize: 14 }}>
              👤 {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogin(!showLogin)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            {showLogin ? 'Annuler' : 'Connexion / Inscription'}
          </button>
        )}
      </div>

      {/* Formulaire de connexion/inscription */}
      {showLogin && !isAuthenticated && (
        <div style={{ 
          maxWidth: 400, 
          margin: '0 auto 24px', 
          padding: 20, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setShowLogin(true)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Connexion
            </button>
            <button
              onClick={() => setShowLogin(true)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Inscription
            </button>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={handleLogin} style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>Connexion</h3>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Se connecter
            </button>
          </form>

          {/* Formulaire d'inscription */}
          <form onSubmit={handleRegister}>
            <h3 style={{ marginBottom: 12 }}>Inscription</h3>
            <input
              type="text"
              placeholder="Prénom"
              value={registerForm.firstName}
              onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
            />
            <input
              type="text"
              placeholder="Nom"
              value={registerForm.lastName}
              onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              S'inscrire
            </button>
          </form>

          {authError && (
            <div style={{ marginTop: 12, padding: 10, backgroundColor: '#f8d7da', color: '#721c24', borderRadius: 4, fontSize: 14 }}>
              ⚠️ {authError}
            </div>
          )}
        </div>
      )}
      
      {/* Afficher l'URL de l'API en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ padding: 8, backgroundColor: '#e7f3ff', borderRadius: 4, marginBottom: 12, fontSize: 12, color: '#666' }}>
          🔗 API Gateway: {config.API_GATEWAY_URL}
        </div>
      )}

      {/* Affichage des catégories - Sélection de type de contenu */}
      {categories.length > 0 && (
        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6' }}>
          <h2 style={{ fontSize: 18, marginBottom: 12, color: '#333' }}>
            📂 Sélectionnez un type de contenu
          </h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            Cliquez sur une catégorie pour afficher les articles correspondants
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => {
                  console.log(`Sélection de la catégorie: ${category.slug}`);
                  loadCategoryFeed(category.slug);
                }}
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  fontSize: 15,
                  backgroundColor: selectedCategory === category.slug ? (category.color || '#007bff') : 'white',
                  color: selectedCategory === category.slug ? 'white' : '#333',
                  border: `2px solid ${selectedCategory === category.slug ? (category.color || '#007bff') : '#dee2e6'}`,
                  borderRadius: 25,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontWeight: selectedCategory === category.slug ? 'bold' : 'normal',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: selectedCategory === category.slug ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  transform: selectedCategory === category.slug ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!loading && selectedCategory !== category.slug) {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && selectedCategory !== category.slug) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <span style={{ fontSize: 20 }}>{category.icon || '📰'}</span>
                <span>{category.name}</span>
                {selectedCategory === category.slug && (
                  <span style={{ marginLeft: 4 }}>✓</span>
                )}
              </button>
            ))}
          </div>
          {selectedCategory && (
            <div style={{ marginTop: 12, padding: 8, backgroundColor: '#d4edda', borderRadius: 4, fontSize: 14, color: '#155724' }}>
              ✓ Catégorie sélectionnée : <strong>{categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}</strong>
            </div>
          )}
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
          <div style={{ fontSize: 14 }}>Sélectionnez une catégorie ci-dessus ou cliquez sur "Flux général"</div>
        </div>
      )}

      {/* Toggle pour basculer entre International et Local */}
      {articles.length > 0 && (() => {
        const internationalArticles = articles.filter(a => a.section === 'international' || a.origin === 'gnews' || a.origin === 'africa-news');
        const localArticles = articles.filter(a => a.section === 'local' || a.origin === 'local');
        
        const hasInternational = internationalArticles.length > 0;
        const hasLocal = localArticles.length > 0;
        
        return (
          <>
            {/* Toggle Section International/Local */}
            {(hasInternational || hasLocal) && (
              <div style={{ 
                marginTop: 20, 
                marginBottom: 20, 
                display: 'flex', 
                gap: 12, 
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                borderRadius: 8,
                border: '1px solid #dee2e6'
              }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>Afficher :</span>
                <button
                  onClick={() => setActiveSection('international')}
                  disabled={!hasInternational}
                  style={{
                    padding: '10px 20px',
                    fontSize: 15,
                    backgroundColor: activeSection === 'international' ? '#007bff' : (hasInternational ? 'white' : '#e9ecef'),
                    color: activeSection === 'international' ? 'white' : (hasInternational ? '#333' : '#999'),
                    border: `2px solid ${activeSection === 'international' ? '#007bff' : (hasInternational ? '#dee2e6' : '#e9ecef')}`,
                    borderRadius: 6,
                    cursor: hasInternational ? 'pointer' : 'not-allowed',
                    fontWeight: activeSection === 'international' ? 'bold' : 'normal',
                    transition: 'all 0.3s ease',
                    opacity: hasInternational ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => {
                    if (hasInternational && activeSection !== 'international') {
                      e.currentTarget.style.backgroundColor = '#e7f3ff';
                      e.currentTarget.style.borderColor = '#007bff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasInternational && activeSection !== 'international') {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#dee2e6';
                    }
                  }}
                >
                  <span>🌍</span>
                  <span>International</span>
                  {hasInternational && (
                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                      ({internationalArticles.length})
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveSection('local')}
                  disabled={!hasLocal}
                  style={{
                    padding: '10px 20px',
                    fontSize: 15,
                    backgroundColor: activeSection === 'local' ? '#28a745' : (hasLocal ? 'white' : '#e9ecef'),
                    color: activeSection === 'local' ? 'white' : (hasLocal ? '#333' : '#999'),
                    border: `2px solid ${activeSection === 'local' ? '#28a745' : (hasLocal ? '#dee2e6' : '#e9ecef')}`,
                    borderRadius: 6,
                    cursor: hasLocal ? 'pointer' : 'not-allowed',
                    fontWeight: activeSection === 'local' ? 'bold' : 'normal',
                    transition: 'all 0.3s ease',
                    opacity: hasLocal ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => {
                    if (hasLocal && activeSection !== 'local') {
                      e.currentTarget.style.backgroundColor = '#d4edda';
                      e.currentTarget.style.borderColor = '#28a745';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasLocal && activeSection !== 'local') {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#dee2e6';
                    }
                  }}
                >
                  <span>🏠</span>
                  <span>Local (Cameroun)</span>
                  {hasLocal && (
                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                      ({localArticles.length})
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Section International */}
            {activeSection === 'international' && hasInternational && (
              <div style={{ marginTop: 20, marginBottom: 30 }}>
                <h2 style={{ 
                  fontSize: 22, 
                  marginBottom: 16, 
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingBottom: 8,
                  borderBottom: '2px solid #007bff'
                }}>
                  <span>🌍</span>
                  <span>À l'international</span>
                  <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>
                    ({internationalArticles.length} article{internationalArticles.length > 1 ? 's' : ''})
                  </span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {internationalArticles.map((a, index) => (
                    <a 
                      key={a.url || a.link || `int-${index}`} 
                      href={a.url || a.link || '#'} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ textDecoration: 'none', color: '#111', border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', transition: 'transform 0.2s', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <img 
                        src={a.imageUrl || a.image || a.urlToImage || 'https://picsum.photos/400/240?blur=1'} 
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
            )}

            {/* Section Local */}
            {activeSection === 'local' && hasLocal && (
              <div style={{ marginTop: 20, marginBottom: 20 }}>
                <h2 style={{ 
                  fontSize: 22, 
                  marginBottom: 16, 
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingBottom: 8,
                  borderBottom: '2px solid #28a745'
                }}>
                  <span>🏠</span>
                  <span>Local (Cameroun)</span>
                  <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>
                    ({localArticles.length} article{localArticles.length > 1 ? 's' : ''})
                  </span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {localArticles.map((a, index) => (
                    <a 
                      key={a.url || a.link || `local-${index}`} 
                      href={a.url || a.link || '#'} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ textDecoration: 'none', color: '#111', border: '1px solid #28a745', borderRadius: 8, overflow: 'hidden', transition: 'transform 0.2s', display: 'block', boxShadow: '0 2px 4px rgba(40,167,69,0.1)' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <img 
                        src={a.imageUrl || a.image || a.urlToImage || 'https://picsum.photos/400/240?blur=1'} 
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
                        {a.countryName && (
                          <div style={{ color: '#28a745', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                            🇨🇲 {a.countryName}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Message si aucune section disponible */}
            {activeSection === 'international' && !hasInternational && hasLocal && (
              <div style={{ padding: 40, textAlign: 'center', color: '#666', backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
                <div style={{ fontSize: 18, marginBottom: 8 }}>Aucun article international disponible</div>
                <button
                  onClick={() => setActiveSection('local')}
                  style={{
                    padding: '10px 20px',
                    fontSize: 16,
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginTop: 12
                  }}
                >
                  Voir les articles locaux
                </button>
              </div>
            )}

            {activeSection === 'local' && !hasLocal && hasInternational && (
              <div style={{ padding: 40, textAlign: 'center', color: '#666', backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
                <div style={{ fontSize: 18, marginBottom: 8 }}>Aucun article local disponible</div>
                <button
                  onClick={() => setActiveSection('international')}
                  style={{
                    padding: '10px 20px',
                    fontSize: 16,
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginTop: 12
                  }}
                >
                  Voir les articles internationaux
                </button>
              </div>
            )}

            {/* Si aucun article dans les deux sections mais articles existent */}
            {!hasInternational && !hasLocal && articles.length > 0 && (
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
                      src={a.imageUrl || a.image || a.urlToImage || 'https://picsum.photos/400/240?blur=1'} 
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
            )}
          </>
        );
      })()}
    </div>
  );
}

export default App;
