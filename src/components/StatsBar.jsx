import { Globe2, RefreshCw, Layers, Clock } from 'lucide-react';
import { JOB_PLATFORMS } from '../data/platforms';

export default function StatsBar({ jobCount, lastUpdate, onRefresh, loading }) {
  return (
    <div className="stats-bar">
      <div className="stat-item">
        <Globe2 size={16} className="stat-icon blue" />
        <div>
          <div className="stat-value">{JOB_PLATFORMS.length}+</div>
          <div className="stat-label">Plataformas</div>
        </div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <Layers size={16} className="stat-icon purple" />
        <div>
          <div className="stat-value">{jobCount.toLocaleString()}</div>
          <div className="stat-label">Empleos</div>
        </div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <Clock size={16} className="stat-icon green" />
        <div>
          <div className="stat-value">1 min</div>
          <div className="stat-label">Actualización</div>
        </div>
      </div>
      <div className="stat-divider" />
      <button
        className={`refresh-btn ${loading ? 'loading' : ''}`}
        onClick={onRefresh}
        disabled={loading}
        title="Actualizar resultados"
      >
        <RefreshCw size={15} className={loading ? 'spin' : ''} />
        <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
      </button>
    </div>
  );
}
