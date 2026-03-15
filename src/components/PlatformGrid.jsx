import { JOB_PLATFORMS, getSearchUrl } from '../data/platforms';
import { ExternalLink } from 'lucide-react';

export default function PlatformGrid({ keyword }) {
  const grouped = {};
  JOB_PLATFORMS.forEach(p => {
    const cat = p.country;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  return (
    <div className="platform-grid-section">
      <div className="section-header">
        <h2 className="section-title">
          🌍 Busca en <span className="highlight">{JOB_PLATFORMS.length}+</span> Plataformas
        </h2>
        <p className="section-subtitle">
          Haz clic en cualquier plataforma para buscar <strong>"{keyword || '...'}"</strong> directamente
        </p>
      </div>

      {Object.entries(grouped).map(([country, platforms]) => (
        <div key={country} className="platform-country-group">
          <h3 className="platform-country-title">{country}</h3>
          <div className="platform-chips">
            {platforms.map(p => (
              <a
                key={p.id}
                href={getSearchUrl(p, keyword || 'jobs')}
                target="_blank"
                rel="noopener noreferrer"
                className="platform-chip"
                style={{ borderColor: `${p.color}44`, '--chip-color': p.color }}
                title={`Buscar en ${p.name}`}
              >
                <span className="platform-chip-logo">{p.logo}</span>
                <span className="platform-chip-name">{p.name}</span>
                <ExternalLink size={10} className="platform-chip-ext" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
