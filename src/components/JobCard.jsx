import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { MapPin, Clock, Briefcase, DollarSign, ExternalLink, Star } from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('es');

const TYPE_COLORS = {
  'Remote': '#22d3ee',
  'Hybrid': '#a855f7',
  'Full Time': '#10b981',
  'Contract': '#f59e0b',
  'Part Time': '#0ea5e9',
  'Freelance': '#f97316',
};

export default function JobCard({ job }) {
  const timeAgo = dayjs(job.date).fromNow();
  const typeColor = TYPE_COLORS[job.type] || '#6366f1';

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`job-card ${job.isFeatured ? 'featured' : ''} ${job.isNew ? 'new-job' : ''}`}
    >
      {job.isNew && <div className="new-badge">🔥 Nuevo</div>}
      {job.isFeatured && <div className="featured-badge"><Star size={10} /> Destacado</div>}

      <div className="job-card-header">
        <div className="company-logo-wrap" style={{ background: `${job.sourceColor}22`, borderColor: `${job.sourceColor}44` }}>
          <span className="company-logo-emoji">{job.sourceLogo}</span>
        </div>
        <div className="job-header-info">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.company}</p>
        </div>
        <ExternalLink size={16} className="job-ext-link" />
      </div>

      <div className="job-meta">
        <span className="job-meta-item">
          <MapPin size={12} /> {job.location}
        </span>
        <span className="job-meta-item">
          <Clock size={12} /> {timeAgo}
        </span>
        {job.salary && (
          <span className="job-meta-item salary">
            <DollarSign size={12} /> {job.salary}
          </span>
        )}
      </div>

      <p className="job-description">{job.description || 'Haz clic para ver los detalles completos del puesto...'}</p>

      <div className="job-footer">
        <div className="job-tags">
          <span className="job-type-badge" style={{ background: `${typeColor}22`, color: typeColor, borderColor: `${typeColor}44` }}>
            <Briefcase size={10} /> {job.type}
          </span>
          {job.tags.slice(0, 2).map(tag => (
            <span key={tag} className="job-tag">{tag}</span>
          ))}
        </div>
        <div className="job-source-badge" style={{ background: `${job.sourceColor}15`, color: job.sourceColor }}>
          {job.sourceLogo} {job.source}
        </div>
      </div>
    </a>
  );
}
