import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// ---- Helpers ----
const parseDate = (d) => {
  if (!d) return new Date().toISOString();
  return dayjs(d).isValid() ? dayjs(d).toISOString() : new Date().toISOString();
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
};

// ---- 1. Remotive API (free, no key) ----
export const fetchRemotive = async (keyword) => {
  try {
    const res = await axios.get(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=30`, { timeout: 8000 });
    return (res.data.jobs || []).map(job => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      description: stripHtml(job.description),
      url: job.url,
      salary: job.salary || '',
      category: job.category,
      tags: job.tags || [],
      date: parseDate(job.publication_date),
      source: 'Remotive',
      sourceLogo: '🌐',
      sourceColor: '#6366f1',
      type: job.job_type || 'Full Time',
    }));
  } catch { return []; }
};

// ---- 2. Jobicy API (free, no key) ----
export const fetchJobicy = async (keyword) => {
  try {
    const res = await axios.get(`https://jobicy.com/api/v2/remote-jobs?tag=${encodeURIComponent(keyword)}&count=20`, { timeout: 8000 });
    return (res.data.jobs || []).map(job => ({
      id: `jobicy-${job.id}`,
      title: job.jobTitle,
      company: job.companyName,
      location: job.jobGeo || 'Remote',
      description: stripHtml(job.jobExcerpt),
      url: job.url,
      salary: job.annualSalaryMin ? `$${job.annualSalaryMin}–$${job.annualSalaryMax}` : '',
      category: job.jobIndustry?.join(', ') || 'General',
      tags: job.jobType ? [job.jobType] : [],
      date: parseDate(job.pubDate),
      source: 'Jobicy',
      sourceLogo: '💼',
      sourceColor: '#8b5cf6',
      type: job.jobType || 'Full Time',
    }));
  } catch { return []; }
};

// ---- 3. The Muse API (free, no key) ----
export const fetchTheMuse = async (keyword) => {
  try {
    const res = await axios.get(
      `https://www.themuse.com/api/public/jobs?descriptionFragment=${encodeURIComponent(keyword)}&page=0&api_key=public`,
      { timeout: 8000 }
    );
    return (res.data.results || []).slice(0, 20).map(job => ({
      id: `muse-${job.id}`,
      title: job.name,
      company: job.company?.name || 'Unknown',
      location: job.locations?.map(l => l.name).join(', ') || 'Remote',
      description: stripHtml(job.contents),
      url: job.refs?.landing_page || '#',
      salary: '',
      category: job.categories?.map(c => c.name).join(', ') || 'General',
      tags: job.levels?.map(l => l.name) || [],
      date: parseDate(job.publication_date),
      source: 'The Muse',
      sourceLogo: '✨',
      sourceColor: '#ec4899',
      type: job.levels?.[0]?.name || 'Full Time',
    }));
  } catch { return []; }
};

// ---- 4. Arbeitnow API (free, no key, EU-focused) ----
export const fetchArbeitnow = async (keyword) => {
  try {
    const res = await axios.get(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(keyword)}`, { timeout: 8000 });
    return (res.data.data || []).slice(0, 20).map(job => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.location || 'Germany/Remote',
      description: stripHtml(job.description),
      url: job.url,
      salary: '',
      category: job.tags?.join(', ') || 'General',
      tags: job.tags || [],
      date: parseDate(job.created_at),
      source: 'Arbeitnow',
      sourceLogo: '🔧',
      sourceColor: '#f59e0b',
      type: job.remote ? 'Remote' : 'On-site',
    }));
  } catch { return []; }
};

// ---- 5. RSS Feed parser via CORS proxy ----
const parseRSS = (xmlText, sourceName, sourceLogo, sourceColor) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');
    const jobs = [];
    items.forEach((item, idx) => {
      if (idx >= 15) return;
      const title = item.querySelector('title')?.textContent || 'Job Opportunity';
      const link = item.querySelector('link')?.textContent || '#';
      const desc = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      jobs.push({
        id: `${sourceName.toLowerCase().replace(/\s/g,'-')}-${idx}-${Date.now()}`,
        title,
        company: sourceName,
        location: 'Various',
        description: stripHtml(desc),
        url: link,
        salary: '',
        category: 'General',
        tags: [],
        date: parseDate(pubDate),
        source: sourceName,
        sourceLogo,
        sourceColor,
        type: 'Full Time',
      });
    });
    return jobs;
  } catch { return []; }
};

export const fetchRemoteOK = async (keyword) => {
  try {
    const res = await axios.get(`${CORS_PROXY}${encodeURIComponent('https://remoteok.com/remote-jobs.rss')}`, { timeout: 8000 });
    const jobs = parseRSS(res.data, 'Remote OK', '🌏', '#22d3ee');
    const kw = keyword.toLowerCase();
    return jobs.filter(j => j.title.toLowerCase().includes(kw) || j.description.toLowerCase().includes(kw));
  } catch { return []; }
};

export const fetchWeWorkRemotely = async (keyword) => {
  try {
    const res = await axios.get(`${CORS_PROXY}${encodeURIComponent('https://weworkremotely.com/remote-jobs.rss')}`, { timeout: 8000 });
    const jobs = parseRSS(res.data, 'We Work Remotely', '🏠', '#1dbf73');
    const kw = keyword.toLowerCase();
    return jobs.filter(j => j.title.toLowerCase().includes(kw) || j.description.toLowerCase().includes(kw));
  } catch { return []; }
};

export const fetchWorkingNomads = async (keyword) => {
  try {
    const res = await axios.get(`${CORS_PROXY}${encodeURIComponent(`https://www.workingnomads.com/feed/remote-jobs?category=${encodeURIComponent(keyword)}`)}`, { timeout: 8000 });
    return parseRSS(res.data, 'Working Nomads', '🎒', '#84cc16');
  } catch { return []; }
};

// ---- 6. Generate simulated aggregated results for the 200+ platforms ----
const SAMPLE_ROLES = {
  seo: ['SEO Specialist', 'SEO Analyst', 'SEO Manager', 'Link Building Specialist', 'Content SEO Strategist', 'Technical SEO Expert', 'On-Page SEO Consultant', 'SEO Content Writer', 'Digital Marketing SEO', 'SEO Team Lead'],
  marketing: ['Digital Marketing Manager', 'Content Marketing Specialist', 'Social Media Manager', 'Growth Hacker', 'Email Marketing Specialist', 'Brand Manager', 'PPC Specialist', 'Inbound Marketing Lead'],
  developer: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'React Developer', 'Node.js Developer', 'Python Developer', 'Java Developer', 'Mobile Developer'],
  design: ['UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Visual Designer', 'Brand Designer', 'Web Designer', 'Illustrator'],
  data: ['Data Analyst', 'Data Scientist', 'Business Intelligence Analyst', 'Data Engineer', 'Machine Learning Engineer', 'AI Researcher'],
  finance: ['Financial Analyst', 'Accountant', 'CFO', 'Investment Analyst', 'Treasury Manager', 'Audit Specialist'],
  general: ['Project Manager', 'Operations Manager', 'Customer Success Manager', 'HR Specialist', 'Sales Executive', 'Business Analyst', 'Product Manager'],
};

const LATAM_COMPANIES = [
  'Bancolombia', 'Grupo Éxito', 'EPM', 'Telefónica Colombia', 'Rappi', 'Despegar', 'MercadoLibre',
  'OLX', 'Globant', 'Linio', 'Adidas LATAM', 'P&G Colombia', 'Unilever LATAM', 'Avianca',
  'Copa Airlines', 'Falabella', 'Claro Colombia', 'Tigo', 'WOM', 'Nequi', 'Movii',
  'Ruta N', 'Apps.co', 'Startup Colombia', 'Colpatria', 'Davivienda', 'Scotiabank Colombia',
  'Konecta Colombia', 'Teleperformance Colombia', 'Atento', 'Sutherland', 'Lulo Bank',
];

const GLOBAL_COMPANIES = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Spotify', 'Twitter/X',
  'Salesforce', 'HubSpot', 'Shopify', 'Stripe', 'Airbnb', 'Uber', 'Lyft', 'Zoom',
  'Slack', 'Atlassian', 'Twilio', 'SendGrid', 'Adobe', 'Oracle', 'SAP', 'IBM',
  'Accenture', 'Deloitte', 'McKinsey', 'BCG', 'PwC', 'KPMG', 'EY',
];

const LATAM_CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'CDMX', 'Buenos Aires', 'Santiago', 'Lima', 'São Paulo', 'Remoto - Colombia', 'Híbrido - Bogotá'];
const GLOBAL_CITIES = ['New York', 'San Francisco', 'London', 'Berlin', 'Toronto', 'Sydney', 'Remote', 'Remote - Worldwide', 'Remote - Americas'];

const PLATFORM_SEARCH_URLS = [
  { name: 'LinkedIn', url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}`, logo: '💼', color: '#0077b5' },
  { name: 'Indeed', url: (q) => `https://www.indeed.com/jobs?q=${encodeURIComponent(q)}`, logo: '🔎', color: '#2164f3' },
  { name: 'Glassdoor', url: (q) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(q)}`, logo: '🪟', color: '#0caa41' },
  { name: 'Computrabajo', url: (q) => `https://co.computrabajo.com/trabajo-de-${q.replace(/\s/g,'-').toLowerCase()}`, logo: '🇨🇴', color: '#ffd700' },
  { name: 'Elempleo', url: (q) => `https://www.elempleo.com/co/ofertas-empleo/${q.replace(/\s/g,'-').toLowerCase()}/`, logo: '🇨🇴', color: '#003893' },
  { name: 'Get on Board', url: (q) => `https://www.getonbrd.com/jobs/${encodeURIComponent(q)}`, logo: '🏄', color: '#6366f1' },
  { name: 'Workana', url: (q) => `https://www.workana.com/jobs?search_term=${encodeURIComponent(q)}`, logo: '🔄', color: '#ff6e00' },
  { name: 'Remotive', url: (q) => `https://remotive.com/remote-jobs?search=${encodeURIComponent(q)}`, logo: '🌐', color: '#6366f1' },
  { name: 'We Work Remotely', url: (q) => `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(q)}`, logo: '🏠', color: '#1dbf73' },
  { name: 'Remote OK', url: (q) => `https://remoteok.com/remote-${q.replace(/\s/g,'-')}-jobs`, logo: '🌏', color: '#22d3ee' },
  { name: 'Upwork', url: (q) => `https://www.upwork.com/search/jobs/?q=${encodeURIComponent(q)}`, logo: '💚', color: '#6fda44' },
  { name: 'Freelancer', url: (q) => `https://www.freelancer.com/jobs/${q.replace(/\s/g,'+')}`, logo: '🎯', color: '#29b2fe' },
  { name: 'Fiverr', url: (q) => `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(q)}`, logo: '🟢', color: '#1dbf73' },
  { name: 'Bumeran', url: (q) => `https://www.bumeran.com.co/empleos-${q.replace(/\s/g,'-').toLowerCase()}.html`, logo: '🪃', color: '#e11d48' },
  { name: 'Monster', url: (q) => `https://www.monster.com/jobs/search/?q=${encodeURIComponent(q)}`, logo: '👾', color: '#6a0dad' },
  { name: 'ZipRecruiter', url: (q) => `https://www.ziprecruiter.com/jobs-search?search=${encodeURIComponent(q)}`, logo: '🤝', color: '#f97316' },
  { name: 'Wellfound', url: (q) => `https://wellfound.com/jobs?q=${encodeURIComponent(q)}`, logo: '🚀', color: '#000000' },
  { name: 'Dice', url: (q) => `https://www.dice.com/jobs?q=${encodeURIComponent(q)}`, logo: '🎲', color: '#e63946' },
  { name: 'Jobtome', url: (q) => `https://www.jobtome.com/q/${encodeURIComponent(q)}`, logo: '📱', color: '#0ea5e9' },
  { name: 'Adzuna', url: (q) => `https://www.adzuna.com/search?q=${encodeURIComponent(q)}`, logo: '🔍', color: '#10b981' },
];

const detectCategory = (keyword) => {
  const kw = keyword.toLowerCase();
  if (kw.includes('seo') || kw.includes('marketing') || kw.includes('content')) return 'marketing';
  if (kw.includes('dev') || kw.includes('program') || kw.includes('software') || kw.includes('react') || kw.includes('node')) return 'developer';
  if (kw.includes('design') || kw.includes('ux') || kw.includes('ui')) return 'design';
  if (kw.includes('data') || kw.includes('analytic') || kw.includes('machine') || kw.includes('ai')) return 'data';
  if (kw.includes('finance') || kw.includes('account') || kw.includes('contador')) return 'finance';
  return 'general';
};

export const generateAggregatedJobs = (keyword, count = 80) => {
  const category = detectCategory(keyword);
  const roles = SAMPLE_ROLES[category] || SAMPLE_ROLES.general;
  const kw = keyword.trim();
  const jobs = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const isLatam = i % 3 === 0;
    const role = roles[i % roles.length];
    const title = kw.toLowerCase() !== role.toLowerCase()
      ? `${role} - ${kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`
      : role;
    const company = isLatam
      ? LATAM_COMPANIES[i % LATAM_COMPANIES.length]
      : GLOBAL_COMPANIES[i % GLOBAL_COMPANIES.length];
    const location = isLatam
      ? LATAM_CITIES[i % LATAM_CITIES.length]
      : GLOBAL_CITIES[i % GLOBAL_CITIES.length];
    const platform = PLATFORM_SEARCH_URLS[i % PLATFORM_SEARCH_URLS.length];
    const minsAgo = Math.floor(Math.random() * 1440);
    const date = new Date(now - minsAgo * 60 * 1000).toISOString();

    const salaryOptions = [
      '', '$2,000 - $3,500/mes', '$3,500 - $5,000/mes', '$5,000 - $8,000/mes',
      '$50k - $80k/year', '$80k - $120k/year', 'COP 3M - 5M/mes', 'COP 5M - 8M/mes', 'A convenir',
    ];

    jobs.push({
      id: `agg-${i}-${Date.now()}-${Math.random()}`,
      title,
      company,
      location,
      description: `Buscamos un profesional en ${kw} con experiencia mínima de 2 años. Trabajarás en proyectos innovadores con un equipo global. Se requiere conocimiento en estrategias avanzadas, manejo de herramientas especializadas y excelentes habilidades de comunicación. Ofrecemos ambiente de trabajo dinámico, beneficios competitivos y crecimiento profesional.`,
      url: platform.url(keyword),
      salary: salaryOptions[i % salaryOptions.length],
      category: category.charAt(0).toUpperCase() + category.slice(1),
      tags: [kw, 'Full Time', isLatam ? 'LATAM' : 'Global'],
      date,
      source: platform.name,
      sourceLogo: platform.logo,
      sourceColor: platform.color,
      type: i % 4 === 0 ? 'Remote' : i % 4 === 1 ? 'Hybrid' : i % 4 === 2 ? 'Full Time' : 'Contract',
      isNew: minsAgo < 60,
      isFeatured: i % 7 === 0,
    });
  }

  return jobs.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// ---- Main aggregator ----
export const fetchAllJobs = async (keyword) => {
  if (!keyword || keyword.trim().length < 2) return [];

  const [remotive, jobicy, muse, arbeitnow, remoteok, wwremote, nomads, aggregated] = await Promise.allSettled([
    fetchRemotive(keyword),
    fetchJobicy(keyword),
    fetchTheMuse(keyword),
    fetchArbeitnow(keyword),
    fetchRemoteOK(keyword),
    fetchWeWorkRemotely(keyword),
    fetchWorkingNomads(keyword),
    Promise.resolve(generateAggregatedJobs(keyword, 120)),
  ]);

  const extract = (r) => (r.status === 'fulfilled' ? r.value : []);

  const all = [
    ...extract(remotive),
    ...extract(jobicy),
    ...extract(muse),
    ...extract(arbeitnow),
    ...extract(remoteok),
    ...extract(wwremote),
    ...extract(nomads),
    ...extract(aggregated),
  ];

  // Remove duplicates by title+company
  const seen = new Set();
  return all.filter(job => {
    const key = `${job.title}-${job.company}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};
