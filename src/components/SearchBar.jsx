import { useState, useCallback } from 'react';
import { Search, Loader2, TrendingUp } from 'lucide-react';

const SUGGESTIONS = [
  'SEO Colombia', 'Desarrollador React', 'Data Scientist remoto', 'Marketing Digital Bogotá',
  'Full Stack Developer', 'Diseñador UX/UI', 'Community Manager', 'Product Manager LATAM',
  'Python Developer remote', 'Analista de datos', 'DevOps Engineer', 'Content Writer español',
  'Project Manager Colombia', 'Node.js Backend', 'Social Media Manager',
];

export default function SearchBar({ onSearch, loading, totalResults }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }, [value, onSearch]);

  const handleSuggestion = (s) => {
    setValue(s);
    onSearch(s);
    setFocused(false);
  };

  return (
    <div className="search-container">
      <div className="search-hero">
        <div className="search-badge">
          <span className="pulse-dot" />
          <span>+200 plataformas · Actualización en tiempo real</span>
        </div>
        <h1 className="search-title">
          Busca empleos en todo<br />
          <span className="gradient-text">el mundo</span>
        </h1>
        <p className="search-subtitle">
          Integra más de 200 plataformas de empleo globales. Introduce una palabra clave y encuentra oportunidades al instante.
        </p>

        <form onSubmit={handleSubmit} className="search-form">
          <div className={`search-input-wrap ${focused ? 'focused' : ''}`}>
            <Search className="search-icon" size={22} />
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Ej: empleo SEO Colombia, React developer remoto..."
              className="search-input"
              autoComplete="off"
            />
            <button type="submit" className="search-btn" disabled={loading || !value.trim()}>
              {loading ? <Loader2 size={18} className="spin" /> : <><Search size={18} /> Buscar</>}
            </button>
          </div>

          {focused && !loading && (
            <div className="suggestions-dropdown">
              <div className="suggestions-label">
                <TrendingUp size={14} /> Búsquedas populares
              </div>
              {SUGGESTIONS.filter(s => !value || s.toLowerCase().includes(value.toLowerCase())).slice(0, 8).map(s => (
                <button key={s} type="button" className="suggestion-item" onMouseDown={() => handleSuggestion(s)}>
                  <Search size={13} />
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>

        {totalResults > 0 && (
          <p className="search-results-info">
            <span className="results-count">{totalResults.toLocaleString()}</span> oportunidades encontradas
          </p>
        )}
      </div>
    </div>
  );
}
