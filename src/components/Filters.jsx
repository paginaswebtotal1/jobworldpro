import { Filter, X } from 'lucide-react';

const JOB_TYPES = ['All', 'Remote', 'Hybrid', 'Full Time', 'Contract', 'Freelance'];
const SORT_OPTIONS = ['Más reciente', 'Relevancia', 'Empresa A-Z'];
const SOURCES = ['All', 'Remotive', 'Jobicy', 'The Muse', 'Arbeitnow', 'We Work Remotely', 'Remote OK', 'LinkedIn', 'Computrabajo', 'Workana', 'Elempleo'];

export default function Filters({ filters, onChange, totalShown, total }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  const hasActive = filters.type !== 'All' || filters.sort !== 'Más reciente' || filters.source !== 'All' || filters.search !== '';

  return (
    <div className="filters-bar">
      <div className="filters-left">
        <Filter size={15} className="filter-icon" />
        <span className="filter-label">Filtros:</span>

        <div className="filter-group">
          <label>Tipo</label>
          <select value={filters.type} onChange={e => set('type', e.target.value)} className="filter-select">
            {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Plataforma</label>
          <select value={filters.source} onChange={e => set('source', e.target.value)} className="filter-select">
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar</label>
          <select value={filters.sort} onChange={e => set('sort', e.target.value)} className="filter-select">
            {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group filter-text">
          <input
            type="text"
            placeholder="Filtrar por empresa..."
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            className="filter-input"
          />
          {filters.search && (
            <button onClick={() => set('search', '')} className="filter-clear-btn"><X size={12} /></button>
          )}
        </div>

        {hasActive && (
          <button
            className="filter-reset-btn"
            onClick={() => onChange({ type: 'All', sort: 'Más reciente', source: 'All', search: '' })}
          >
            <X size={12} /> Limpiar filtros
          </button>
        )}
      </div>

      <div className="filters-right">
        <span className="results-summary">
          Mostrando <strong>{totalShown}</strong> de <strong>{total}</strong> empleos
        </span>
      </div>
    </div>
  );
}
