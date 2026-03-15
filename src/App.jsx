import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SearchBar from './components/SearchBar';
import JobCard from './components/JobCard';
import Filters from './components/Filters';
import PlatformGrid from './components/PlatformGrid';
import LiveTicker from './components/LiveTicker';
import StatsBar from './components/StatsBar';
import { fetchAllJobs } from './services/jobService';
import { JOB_PLATFORMS } from './data/platforms';
import './App.css';

const PAGE_SIZE = 24;
const AUTO_REFRESH_MS = 60000;

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: 'All', sort: 'Más reciente', source: 'All', search: '' });
  const [activeTab, setActiveTab] = useState('results');
  const timerRef = useRef(null);
  const searchedRef = useRef(false);

  const doSearch = useCallback(async (kw, silent = false) => {
    if (!kw) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const results = await fetchAllJobs(kw);
      setJobs(results);
      setLastUpdate(new Date());
      setPage(1);
      searchedRef.current = true;
    } catch (e) {
      setError('Error al obtener empleos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((kw) => {
    setKeyword(kw);
    setActiveTab('results');
    doSearch(kw);
  }, [doSearch]);

  useEffect(() => {
    if (!keyword) return;
    timerRef.current = setInterval(() => {
      doSearch(keyword, true);
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [keyword, doSearch]);

  const filteredJobs = useMemo(() => {
    let list = [...jobs];
    if (filters.type !== 'All') list = list.filter(j => j.type === filters.type);
    if (filters.source !== 'All') list = list.filter(j => j.source === filters.source);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(j =>
        j.company.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
    }
    if (filters.sort === 'Empresa A-Z') list.sort((a, b) => a.company.localeCompare(b.company));
    else if (filters.sort === 'Relevancia') {
      const kw = keyword.toLowerCase();
      list.sort((a, b) => {
        const aScore = (a.title.toLowerCase().includes(kw) ? 2 : 0) + (a.description.toLowerCase().includes(kw) ? 1 : 0);
        const bScore = (b.title.toLowerCase().includes(kw) ? 2 : 0) + (b.description.toLowerCase().includes(kw) ? 1 : 0);
        return bScore - aScore;
      });
    }
    return list;
  }, [jobs, filters, keyword]);

  const paginatedJobs = useMemo(() => filteredJobs.slice(0, page * PAGE_SIZE), [filteredJobs, page]);
  const hasMore = paginatedJobs.length < filteredJobs.length;

  const sourceStats = useMemo(() => {
    const map = {};
    jobs.forEach(j => { map[j.source] = (map[j.source] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [jobs]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🔍</span>
            <span className="logo-text">JobWorld<span className="logo-pro">Pro</span></span>
          </div>
          <nav className="header-nav">
            <span className="nav-item">100% Gratuito</span>
            <span className="nav-dot" />
            <span className="nav-item live">● En vivo</span>
          </nav>
        </div>
      </header>

      <LiveTicker lastUpdate={lastUpdate} />

      <SearchBar onSearch={handleSearch} loading={loading} totalResults={filteredJobs.length} />

      {keyword && (
        <StatsBar
          jobCount={jobs.length}
          lastUpdate={lastUpdate}
          onRefresh={() => doSearch(keyword)}
          loading={loading}
        />
      )}

      <main className="app-main">
        {!searchedRef.current && !loading && (
          <div className="welcome-state">
            <div className="welcome-graphic">
              <div className="globe-ring ring1" />
              <div className="globe-ring ring2" />
              <div className="globe-ring ring3" />
              <span className="globe-emoji">🌐</span>
            </div>
            <h2>Busca empleos en todo el mundo</h2>
            <p>Introduce cualquier cargo, habilidad o palabra clave para buscar en más de 200 plataformas de empleo simultáneamente.</p>
            <div className="welcome-chips">
              {['SEO Colombia', 'React Developer', 'Data Analyst', 'UX Designer', 'Marketing Digital'].map(s => (
                <button key={s} className="welcome-chip" onClick={() => handleSearch(s)}>{s}</button>
              ))}
            </div>
            <button className="view-platforms-btn" onClick={() => setActiveTab('platforms')}>
              Ver todas las plataformas →
            </button>
          </div>
        )}

        {loading && !jobs.length && (
          <div className="loading-state">
            <div className="loading-spinner-big" />
            <p>Buscando en <strong>200+ plataformas</strong> mundiales...</p>
            <div className="loading-sources">
              {['LinkedIn', 'Remotive', 'Jobicy', 'The Muse', 'Computrabajo', 'Indeed', 'Glassdoor', 'Arbeitnow'].map(s => (
                <span key={s} className="loading-source">{s}</span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span>⚠️</span> {error}
            <button onClick={() => doSearch(keyword)} className="retry-btn">Reintentar</button>
          </div>
        )}

        {keyword && !loading && (
          <div className="tabs-wrapper">
            <div className="tabs">
              <button className={`tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
                💼 Resultados <span className="tab-count">{filteredJobs.length}</span>
              </button>
              <button className={`tab ${activeTab === 'platforms' ? 'active' : ''}`} onClick={() => setActiveTab('platforms')}>
                🌍 Plataformas <span className="tab-count">{JOB_PLATFORMS.length}+</span>
              </button>
              <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
                📊 Por Fuente
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && keyword && !loading && (
          <>
            <Filters
              filters={filters}
              onChange={setFilters}
              totalShown={paginatedJobs.length}
              total={filteredJobs.length}
            />
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <span>🔍</span>
                <p>No se encontraron empleos con los filtros seleccionados.</p>
                <button onClick={() => setFilters({ type: 'All', sort: 'Más reciente', source: 'All', search: '' })}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="jobs-grid">
                  {paginatedJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                {hasMore && (
                  <div className="load-more-wrap">
                    <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
                      Cargar más empleos ({filteredJobs.length - paginatedJobs.length} restantes)
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'platforms' && (
          <PlatformGrid keyword={keyword} />
        )}

        {activeTab === 'stats' && keyword && (
          <div className="stats-section">
            <h2 className="stats-title">Resultados por plataforma para <em>"{keyword}"</em></h2>
            <div className="stats-grid">
              {sourceStats.map(([source, count]) => {
                const pct = Math.round((count / jobs.length) * 100);
                const job = jobs.find(j => j.source === source);
                return (
                  <div key={source} className="source-stat-card">
                    <div className="source-stat-header">
                      <span className="source-logo">{job?.sourceLogo || '📋'}</span>
                      <span className="source-name">{source}</span>
                      <span className="source-count">{count}</span>
                    </div>
                    <div className="source-bar-wrap">
                      <div className="source-bar" style={{ width: `${pct}%`, background: job?.sourceColor || '#6366f1' }} />
                    </div>
                    <span className="source-pct">{pct}% del total</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-logo">🔍 JobWorldPro</div>
          <p className="footer-tagline">+200 plataformas · 100% gratuito · Actualización cada minuto</p>
          <p className="footer-disclaimer">
            JobWorldPro agrega información de plataformas de empleo públicas. Las vacantes son publicadas por empleadores externos.
          </p>
        </div>
      </footer>
    </div>
  );
}
