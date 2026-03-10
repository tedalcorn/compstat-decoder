import React, { useState, useEffect, useMemo, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/* 1. DATA CONSTANTS & CONFIGURATION                                  */
/* ------------------------------------------------------------------ */
const GITHUB_USER = "joshgreenman1973";
const REPO_NAME = "nypd-compstat-scraper";
const CITYWIDE_POPULATION = 8336817;
const VOLATILITY_THRESHOLD = 30;

const VC = {
  black: "#050507", white: "#fff", cloud: "#ddd", orange: "#ff7c53",
  periwinkle: "#9b9fbc", magenta: "#e7466d", charcoal: "#707175",
  indigo: "#394882", cerulean: "#217ebe", green: "#57aa4a"
};

const VIOLENT_CRIMES = ["Murder", "Rape", "Robbery", "Fel. Assault", "Misd. Assault", "Shooting Inc.", "Shooting Vic.", "Hate Crimes"];
const PROPERTY_CRIMES = ["Burglary", "Gr. Larceny", "G.L.A.", "Petit Larceny", "Retail Theft"];

const FALLBACK_DATA = {
  "citywide": {
    "source": "Citywide",
    "report_period": { "week_start": "3/2/2026", "week_end": "3/8/2026" },
    "seven_major_felonies": {
      "Murder": { "year_to_date": { "current_year": 36, "prior_year": 61, "pct_change": -41.0 }, "historical": { "31_yr_pct": -89.9 } },
      "Rape": { "year_to_date": { "current_year": 384, "prior_year": 354, "pct_change": 8.5 }, "historical": { "31_yr_pct": -30.1 } },
      "Robbery": { "year_to_date": { "current_year": 2158, "prior_year": 2329, "pct_change": -7.3 }, "historical": { "31_yr_pct": -86.2 } },
      "Fel. Assault": { "year_to_date": { "current_year": 4349, "prior_year": 4455, "pct_change": -2.4 }, "historical": { "31_yr_pct": -32.4 } },
      "Burglary": { "year_to_date": { "current_year": 1898, "prior_year": 2421, "pct_change": -21.6 }, "historical": { "31_yr_pct": -89.5 } },
      "Gr. Larceny": { "year_to_date": { "current_year": 6715, "prior_year": 7120, "pct_change": -5.7 }, "historical": { "31_yr_pct": -55.7 } },
      "G.L.A.": { "year_to_date": { "current_year": 1845, "prior_year": 1977, "pct_change": -6.7 }, "historical": { "31_yr_pct": -83.5 } }
    },
    "additional_stats": {}
  }
};

const GEO_POPULATIONS = {
  "1st Precinct": 75000, "5th Precinct": 55000, "6th Precinct": 60000, "7th Precinct": 50000, "9th Precinct": 75000,
  "10th Precinct": 50000, "13th Precinct": 75000, "14th Precinct": 25000, "17th Precinct": 80000, "18th Precinct": 30000,
  "19th Precinct": 210000, "20th Precinct": 105000, "22nd Precinct": 500,
  "23rd Precinct": 75000, "24th Precinct": 105000, "25th Precinct": 50000, "26th Precinct": 50000, "28th Precinct": 50000,
  "30th Precinct": 60000, "32nd Precinct": 75000, "33rd Precinct": 80000, "34th Precinct": 115000,
  "40th Precinct": 95000, "41st Precinct": 55000, "42nd Precinct": 85000, "43rd Precinct": 175000, "44th Precinct": 145000,
  "45th Precinct": 120000, "46th Precinct": 135000, "47th Precinct": 155000, "48th Precinct": 85000, "49th Precinct": 120000,
  "50th Precinct": 105000, "52nd Precinct": 140000,
  "60th Precinct": 100000, "61st Precinct": 155000, "62nd Precinct": 185000, "63rd Precinct": 100000, "66th Precinct": 195000,
  "67th Precinct": 155000, "68th Precinct": 130000, "69th Precinct": 95000, "70th Precinct": 160000, "71st Precinct": 105000,
  "72nd Precinct": 130000, "73rd Precinct": 85000, "75th Precinct": 190000, "76th Precinct": 50000, "77th Precinct": 95000,
  "78th Precinct": 65000, "79th Precinct": 90000, "81st Precinct": 65000, "83rd Precinct": 115000, "84th Precinct": 50000,
  "88th Precinct": 55000, "90th Precinct": 130680, "94th Precinct": 71556,
  "100th Precinct": 55913, "101st Precinct": 78328,
  "102nd Precinct": 145000, "103rd Precinct": 110000, "104th Precinct": 175000, "105th Precinct": 190000, "106th Precinct": 125000,
  "107th Precinct": 150000, "108th Precinct": 120000, "109th Precinct": 250000, "110th Precinct": 170000, "111th Precinct": 115000,
  "112th Precinct": 110000, "113th Precinct": 115000, "114th Precinct": 195000, "115th Precinct": 175000,
  "120th Precinct": 115000, "121st Precinct": 125000, "122nd Precinct": 145000, "123rd Precinct": 100000,
  "Bronx": 1472654, "Brooklyn South": 1368037, "Brooklyn North": 1368037, "Manhattan South": 594251, "Manhattan North": 1100000, "Queens South": 1202732, "Queens North": 1202732, "Staten Island": 495747
};

const PRECINCT_NEIGHBORHOODS = {
  "1st Precinct": "Tribeca, Wall St", "5th Precinct": "Chinatown, Little Italy", "6th Precinct": "Greenwich Village",
  "7th Precinct": "Lower East Side", "9th Precinct": "East Village", "10th Precinct": "Chelsea",
  "13th Precinct": "Gramercy, Stuy Town", "14th Precinct": "Midtown South", "17th Precinct": "Midtown East",
  "18th Precinct": "Midtown North", "19th Precinct": "Upper East Side", "20th Precinct": "Upper West Side",
  "22nd Precinct": "Central Park", "23rd Precinct": "East Harlem South", "24th Precinct": "Morningside Heights",
  "25th Precinct": "East Harlem North", "26th Precinct": "Manhattanville", "28th Precinct": "Central Harlem",
  "30th Precinct": "Hamilton Heights", "32nd Precinct": "Central Harlem North", "33rd Precinct": "Washington Heights",
  "34th Precinct": "Inwood, Wash. Heights", "40th Precinct": "Mott Haven", "41st Precinct": "Hunts Point",
  "42nd Precinct": "Morrisania", "43rd Precinct": "Soundview", "44th Precinct": "Highbridge",
  "45th Precinct": "Co-op City", "46th Precinct": "Fordham", "47th Precinct": "Wakefield",
  "48th Precinct": "East Tremont", "49th Precinct": "Pelham Parkway", "50th Precinct": "Riverdale",
  "52nd Precinct": "Bedford Park", "60th Precinct": "Coney Island", "61st Precinct": "Sheepshead Bay",
  "62nd Precinct": "Bensonhurst", "63rd Precinct": "Flatlands", "66th Precinct": "Borough Park",
  "67th Precinct": "East Flatbush", "68th Precinct": "Bay Ridge", "69th Precinct": "Canarsie",
  "70th Precinct": "Flatbush", "71st Precinct": "Crown Heights South", "72nd Precinct": "Sunset Park",
  "73rd Precinct": "Brownsville", "75th Precinct": "East New York", "76th Precinct": "Red Hook",
  "77th Precinct": "Crown Heights North", "78th Precinct": "Park Slope", "79th Precinct": "Bed-Stuy West",
  "81st Precinct": "Bed-Stuy East", "83rd Precinct": "Bushwick", "84th Precinct": "Brooklyn Heights, DUMBO",
  "88th Precinct": "Fort Greene", "90th Precinct": "Williamsburg", "94th Precinct": "Greenpoint",
  "100th Precinct": "Rockaways", "101st Precinct": "Far Rockaway", "102nd Precinct": "Richmond Hill",
  "103rd Precinct": "Jamaica", "104th Precinct": "Ridgewood, Maspeth", "105th Precinct": "Queens Village",
  "106th Precinct": "Ozone Park", "107th Precinct": "Fresh Meadows", "108th Precinct": "Long Island City",
  "109th Precinct": "Flushing", "110th Precinct": "Elmhurst", "111th Precinct": "Bayside",
  "112th Precinct": "Forest Hills", "113th Precinct": "South Jamaica", "114th Precinct": "Astoria",
  "115th Precinct": "Jackson Heights", "120th Precinct": "St. George", "121st Precinct": "Bulls Head",
  "122nd Precinct": "New Dorp", "123rd Precinct": "Tottenville"
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */
const safeNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const calcPct = (current, prior) => {
  const c = safeNum(current); const p = safeNum(prior);
  if (!p) return c === 0 ? 0 : null;
  return ((c - p) / p) * 100;
};
const formatPct = (v) => (typeof v !== 'number' || Number.isNaN(v)) ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
const formatSignedInt = (v) => { const n = safeNum(v); return `${n > 0 ? "+" : ""}${n.toLocaleString()}`; };
const formatPop = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  return Math.round(n / 1000) + 'k';
};
const formatGeoName = (geo) => {
  if (PRECINCT_NEIGHBORHOODS[geo]) return `${geo} (${PRECINCT_NEIGHBORHOODS[geo]})`;
  return geo;
};
const toOrdinalPrecinct = (n) => {
  const num = parseInt(n, 10);
  if ([11, 12, 13].includes(num % 100)) return num + "th Precinct";
  const last = num % 10;
  if (last === 1) return num + "st Precinct";
  if (last === 2) return num + "nd Precinct";
  if (last === 3) return num + "rd Precinct";
  return num + "th Precinct";
};

/* ------------------------------------------------------------------ */
/* MARKDOWN RENDERER (used in trend cards and elsewhere)              */
/* ------------------------------------------------------------------ */
const renderMarkdown = (node) => {
  if (typeof node === 'string') {
    const parts = node.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }
  // Recursively process React elements so **markdown** inside JSX children works
  if (React.isValidElement(node)) {
    const { children, ...rest } = node.props;
    if (children) {
      const processed = React.Children.map(children, child => renderMarkdown(child));
      return React.cloneElement(node, rest, processed);
    }
  }
  return node;
};

/* ------------------------------------------------------------------ */
/* ICONS                                                              */
/* ------------------------------------------------------------------ */
const Icon = ({ children, size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);
const RefreshCw = (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></Icon>;
const TrendingUp = (p) => <Icon {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>;
const TrendingDown = (p) => <Icon {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></Icon>;
const ChevronDown = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>;
const Target = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const Activity = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>;
const AlertCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></Icon>;
const MapPin = (p) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon>;
const Info = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></Icon>;
const Users = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></Icon>;
const Navigation = (p) => <Icon {...p}><polygon points="3 11 22 2 13 21 11 13 3 11"/></Icon>;
const AlertTriangle = (p) => <Icon {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></Icon>;
const ShieldCheck = (p) => <Icon {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></Icon>;
const Sparkles = (p) => <Icon {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></Icon>;
const Send = (p) => <Icon {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></Icon>;
const X = (p) => <Icon {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Icon>;

/* ------------------------------------------------------------------ */
/* CHARTS                                                             */
/* ------------------------------------------------------------------ */
const DivergingBarChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const validData = data.filter(d => typeof d.pct === 'number' && d.pct !== null && (d.prior > 5 || d.current > 5));
  if (validData.length === 0) return null;
  const maxAbsPct = Math.max(...validData.map(d => Math.abs(d.pct)));
  const scaleMax = Math.max(10, maxAbsPct);
  const rowHeight = 34;
  const totalHeight = validData.length * rowHeight + 16;
  const VIEWBOX_WIDTH = 540;
  const CENTER_X = 270;
  const MAX_BAR_WIDTH = 180;
  return (
    <div className="w-full font-sans">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-b pb-2 mb-3 text-gray-400">
        <span>Trajectory (% Change vs Prior Yr)</span>
      </div>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${totalHeight}`} className="w-full h-auto">
        <line x1={CENTER_X} y1="0" x2={CENTER_X} y2={totalHeight} stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="5 5" />
        {validData.map((row, i) => {
          const y = i * rowHeight + 16;
          const isIncrease = row.pct > 0;
          const isSmallN = row.prior < VOLATILITY_THRESHOLD;
          const barWidth = (Math.abs(row.pct) / scaleMax) * MAX_BAR_WIDTH;
          const textColor = isIncrease ? VC.orange : VC.green;
          return (
            <g key={row.name}>
              <text x="0" y={y + 5} fontSize="13" fontWeight="bold" fill={VC.black} opacity={isSmallN ? 0.5 : 1}>{row.name}{isSmallN ? '*' : ''}</text>
              <rect x={isIncrease ? CENTER_X : CENTER_X - barWidth} y={y - 9} width={barWidth} height="20" fill={textColor} fillOpacity={isSmallN ? 0.3 : 1} rx="3" />
              <text x={isIncrease ? CENTER_X + barWidth + 8 : CENTER_X - barWidth - 8} y={y + 5} textAnchor={isIncrease ? "start" : "end"} fontSize="12" fontWeight="bold" fill={textColor} opacity={isSmallN ? 0.5 : 1}>{formatPct(row.pct)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const UnifiedMagnitudeChart = ({ data, isTourist, citywideRates, activeGeo }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(1, ...data.map(d => d.current || 0));
  const rowHeight = 34;
  const totalHeight = data.length * rowHeight + 16;
  const VIEWBOX_WIDTH = 680;
  const START_X = 130;
  const MAX_BAR_WIDTH = 280;
  return (
    <div className="w-full font-sans">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b pb-2 mb-3 text-gray-400">
        <span>Incident Volume</span>
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1 text-[9px] font-bold" style={{color: VC.magenta}}><span className="w-1.5 h-1.5 rounded-full inline-block" style={{background: VC.magenta}}></span>Person</span>
          <span className="flex items-center gap-1 text-[9px] font-bold" style={{color: VC.indigo}}><span className="w-1.5 h-1.5 rounded-full inline-block" style={{background: VC.indigo}}></span>Property</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${totalHeight}`} className="w-full h-auto">
        {data.map((row, i) => {
          const y = i * rowHeight + 16;
          const barWidth = Math.max((row.current / maxVal) * MAX_BAR_WIDTH, 4);
          const color = VIOLENT_CRIMES.includes(row.name) ? VC.magenta : PROPERTY_CRIMES.includes(row.name) ? VC.indigo : VC.periwinkle;
          return (
            <g key={row.name}>
              <text x={START_X - 14} y={y + 5} textAnchor="end" fontSize="13" fontWeight="bold" fill={VC.black}>{row.name}</text>
              <rect x={START_X} y={y - 10} width={barWidth} height="22" fill={color} rx="3" />
              <text x={START_X + barWidth + 8} y={y + 5} fontSize="13" fontWeight="bold" fill={VC.black}>
                {row.current.toLocaleString()}
                {row.currentRate !== null && !isTourist && (
                  <tspan fontSize="11" fill={VC.charcoal} fontWeight="normal">{' '}({row.currentRate.toFixed(1)}/10k{activeGeo !== 'citywide' && citywideRates[row.name] !== undefined ? ` vs ${citywideRates[row.name].toFixed(1)} CW` : ''})</tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* AI QUERY BOX                                                       */
/* ------------------------------------------------------------------ */
const CITYWIDE_QUESTIONS = [
  "What's the biggest story in this data?",
  "Which crime is most improved vs. last year?",
  "Is the 78th Precinct safer than the 41st?",
  "Which precincts have the highest crime rates?",
];

const LOCAL_QUESTIONS = [
  "Is this area safer or more dangerous than average?",
  "What's the biggest story here?",
  "Which crimes are rising fastest in this precinct?",
  "How does this compare to citywide trends?",
];

const QueryBox = ({ parsedData, activeGeo, activeTab, period, rawData }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // array of {q, a}

  const suggestedQuestions = activeGeo === 'citywide' ? CITYWIDE_QUESTIONS : LOCAL_QUESTIONS;

  // Reset conversation when geography or time period changes
  useEffect(() => {
    setQuery('');
    setResponse('');
    setError('');
    setHistory([]);
  }, [activeGeo, activeTab]);

  const buildContext = () => {
    const { totals, all, driver, historicAnchor, localAnomaly, localBrightSpot, topSurge, topDrop } = parsedData;
    const periodStr = `${period?.week_start || ''} – ${period?.week_end || ''}`;
    const timeLabel = activeTab === 'ytd' ? 'year-to-date' : 'week-to-date';
    const geoLabel = activeGeo === 'citywide' ? 'Citywide (all of NYC)' : formatGeoName(