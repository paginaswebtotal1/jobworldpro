import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
dayjs.extend(relativeTime);
dayjs.locale('es');

const TICKER_ITEMS = [
  { title: 'SEO Specialist', company: 'MercadoLibre', time: 2 },
  { title: 'React Developer', company: 'Rappi', time: 5 },
  { title: 'Data Analyst', company: 'Bancolombia', time: 8 },
  { title: 'Digital Marketing Manager', company: 'Globant', time: 12 },
  { title: 'Full Stack Developer', company: 'Google', time: 15 },
  { title: 'UX Designer', company: 'Shopify', time: 19 },
  { title: 'Content Strategist', company: 'HubSpot', time: 23 },
  { title: 'DevOps Engineer', company: 'Amazon', time: 27 },
  { title: 'Product Manager', company: 'Meta', time: 31 },
  { title: 'ML Engineer', company: 'Despegar', time: 35 },
  { title: 'Community Manager', company: 'Avianca', time: 41 },
  { title: 'Backend Developer (Python)', company: 'Stripe', time: 45 },
  { title: 'Social Media Analyst', company: 'Claro', time: 52 },
  { title: 'Financial Analyst', company: 'Davivienda', time: 58 },
];

export default function LiveTicker({ lastUpdate }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-ticker">
      <div className="ticker-label">
        <Zap size={14} className="ticker-zap" />
        <span>EN VIVO</span>
      </div>
      <div className="ticker-track">
        <div className="ticker-content" style={{ animation: `ticker-scroll ${TICKER_ITEMS.length * 4}s linear infinite` }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">
              🟢 <strong>{item.title}</strong> en <em>{item.company}</em> — hace {item.time} min
              <span className="ticker-sep">·</span>
            </span>
          ))}
        </div>
      </div>
      {lastUpdate && (
        <div className="ticker-update">
          ↻ {dayjs(lastUpdate).fromNow()}
        </div>
      )}
    </div>
  );
}
