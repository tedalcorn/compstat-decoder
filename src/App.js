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
/* MARKDOWN RENDERER                                                  */
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const suggestedQuestions = activeGeo === 'citywide' ? CITYWIDE_QUESTIONS : LOCAL_QUESTIONS;

  useEffect(() => {
    setQuery('');
    setError('');
    setHistory([]);
  }, [activeGeo, activeTab]);

  const buildContext = () => {
    const { totals, all, driver, historicAnchor, localAnomaly, localBrightSpot, topSurge, topDrop } = parsedData;
    const periodStr = `${period?.week_start || ''} – ${period?.week_end || ''}`;
    const timeLabel = activeTab === 'ytd' ? 'year-to-date' : 'week-to-date';
    const geoLabel = activeGeo === 'citywide' ? 'Citywide (all of NYC)' : formatGeoName(activeGeo);

    const offenseLines = all.map(o =>
      `  ${o.name}: ${o.current.toLocaleString()} incidents (${formatPct(o.pct)} vs prior year${o.currentRate !== null ? `, ${o.currentRate.toFixed(1)}/10k residents` : ''})`
    ).join('\n');

    const historicLines = all
      .filter(o => typeof o.hist?.['31_yr_pct'] === 'number')
      .map(o => `  ${o.name}: ${formatPct(o.hist['31_yr_pct'])} vs 1993 peak`)
      .join('\n');

    let precinctTable = '';
    if (activeGeo === 'citywide' && rawData) {
      const pctKeys = Object.keys(rawData).filter(k => k.includes('Precinct'));
      if (pctKeys.length > 0) {
        const lines = pctKeys.sort((a, b) => parseInt(a) - parseInt(b)).map(pct => {
          const d = rawData[pct];
          const pop = GEO_POPULATIONS[pct] || 0;
          const hood = PRECINCT_NEIGHBORHOODS[pct] || '';
          const felonies = d.seven_major_felonies || {};
          const addl = d.additional_stats || {};
          const crimes = { ...felonies, ...addl };
          let total = 0;
          const crimeNums = Object.entries(crimes).map(([name, stats]) => {
            const c = safeNum(activeTab === 'ytd' ? stats?.year_to_date?.current_year : stats?.week_to_date?.current_year);
            total += (felonies[name] ? c : 0);
            return `${name}:${c}`;
          });
          const rate = pop > 0 ? ((total / pop) * 10000).toFixed(1) : '?';
          return `  ${pct} (${hood}): ${crimeNums.join(', ')} | Total 7 major: ${total} | ${rate}/10k | Pop ~${formatPop(pop)}`;
        });
        precinctTable = `\n\nPRECINCT-LEVEL DATA (${timeLabel}):\n${lines.join('\n')}`;
      }
    }

    return `NYPD CompStat Data — ${geoLabel} — ${timeLabel} through ${periodStr}

SUMMARY TOTALS:
  Major index felonies: ${totals.mCur.toLocaleString()} (${formatPct(totals.mPct)} vs prior year's ${totals.mPri.toLocaleString()})
  Violent share: ${((totals.vCur / (totals.mCur || 1)) * 100).toFixed(0)}%
  Property share: ${((totals.pCur / (totals.mCur || 1)) * 100).toFixed(0)}%
  Murders: ${totals.murder}
  Shooting victims: ${totals.shootingVic}
  Shots-fired per murder (lethality gap): ${totals.murder > 0 ? totals.lethalityRatio.toFixed(1) : 'N/A'}

ALL TRACKED OFFENSES:
${offenseLines}

${historicLines ? `31-YEAR HISTORICAL CONTEXT (vs 1993 peak):\n${historicLines}` : ''}

${driver ? `PRIMARY DRIVER OF CHANGE: ${driver.name} accounts for ${driver.share.toFixed(0)}% of the overall shift (${formatSignedInt(driver.diff)} incidents)` : ''}
${localAnomaly ? `LOCAL ANOMALY: ${localAnomaly.name} rate (${localAnomaly.localRate.toFixed(1)}/10k) is ${localAnomaly.ratio.toFixed(1)}x the citywide average (${localAnomaly.cityRate.toFixed(1)}/10k)` : ''}
${localBrightSpot ? `LOCAL BRIGHT SPOT: ${localBrightSpot.name} rate (${localBrightSpot.localRate.toFixed(1)}/10k) is ${((1 - localBrightSpot.ratio) * 100).toFixed(0)}% below citywide average` : ''}
${topSurge && topSurge.pct > 0 ? `LARGEST INCREASE: ${topSurge.name} (+${topSurge.pct.toFixed(1)}%)` : ''}
${topDrop && topDrop.pct < 0 ? `LARGEST DECREASE: ${topDrop.name} (${topDrop.pct.toFixed(1)}%)` : ''}
${historicAnchor ? `MOST HISTORICALLY IMPROVED: ${historicAnchor.name} (${formatPct(historicAnchor.hist['31_yr_pct'])} since 1993)` : ''}${precinctTable}`;
  };

  const handleQuery = async (q) => {
    const questionText = q || query;
    if (!questionText.trim()) return;
    
    setQuery('');
    setLoading(true);
    setError('');

    const dataContext = buildContext();
    const systemPrompt = `You are a concise, plain-language crime data analyst for Vital City, a NYC policy publication. You have access to current NYPD CompStat data shown below, including precinct-level breakdowns when available. Answer the user's question directly and precisely — 2 to 4 sentences maximum. Cite specific numbers from the data. When comparing precincts, use per-capita rates (per 10k residents) rather than raw counts, since precincts vary enormously in population. Do not editorialize beyond what the data supports. If asked something the data cannot answer, say so in one sentence. Never use bullet points or headers. Write in flowing prose.`;

    const messages = [];
    history.forEach(h => {
      messages.push({ role: 'user', content: h.q });
      messages.push({ role: 'assistant', content: h.a });
    });
    messages.push({
      role: 'user',
      content: messages.length === 0
        ? `DATA:\n${dataContext}\n\nQUESTION: ${questionText}`
        : questionText
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 1000,
          system: systemPrompt + `\n\nDATA:\n${dataContext}`,
          messages
        })
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const text = data?.content?.[0]?.text || '';
      if (!text) throw new Error('Empty response');
      setHistory(prev => [...prev, { q: questionText, a: text }]);
    } catch (e) {
      console.error(e);
      setError('Unable to get a response. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuery(); }
  };

  const startOver = () => { setQuery(''); setError(''); setHistory([]); };

  return (
    <section className="mb-10 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={14} className="text-gray-400" />
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">Ask About This Data</span>
      </div>

      {history.length > 0 && (
        <div className="mb-4 space-y-4">
          {history.map((h, i) => (
            <div key={i} className="border border-gray-100 rounded bg-gray-50 px-5 py-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">{h.q}</p>
              <p className="font-serif text-[15px] leading-relaxed text-gray-700">{h.a}</p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="border border-gray-200 rounded bg-gray-50 px-5 py-5 mb-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">{query}</p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block animate-bounce" style={{animationDelay: `${i * 0.15}s`}} />
              ))}
            </div>
            <span className="text-[12px] text-gray-400 font-medium">Reading the data…</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="border border-gray-200 rounded bg-gray-50 px-5 py-5 mb-4">
          <p className="font-serif text-[15px] text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={history.length > 0
            ? "Ask a follow-up…"
            : `Ask anything about ${activeGeo === 'citywide' ? 'citywide crime' : formatGeoName(activeGeo)} data…`
          }
          className="flex-1 text-[13px] font-medium py-3 px-4 rounded border border-gray-300 bg-white focus:outline-none focus:border-black transition-colors placeholder-gray-400"
          disabled={loading}
        />
        <button
          onClick={() => handleQuery()}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 px-5 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded disabled:opacity-30 hover:bg-gray-800 transition-colors"
        >
          <Send size={13} />
          Ask
        </button>
        {history.length > 0 && (
          <button
            onClick={startOver}
            className="flex items-center justify-center px-3 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-500 hover:text-black transition-colors"
            title="Start over"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestedQuestions
          .filter(q => !history.some(h => h.q === q))
          .slice(0, history.length > 0 ? 2 : 4)
          .map(q => (
            <button
              key={q}
              onClick={() => { handleQuery(q); }}
              disabled={loading}
              className="text-[11px] font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:border-black hover:text-black transition-colors bg-white disabled:opacity-40"
            >
              {q}
            </button>
          ))}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN APP                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const [activeTab, setActiveTab] = useState('ytd');
  const [activeGeo, setActiveGeo] = useState('citywide');
  const [rawData, setRawData] = useState(FALLBACK_DATA);
  const [loading, setLoading] = useState(false);
  const [trendFilter, setTrendFilter] = useState('all');
  const [isLocating, setIsLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    
    const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/data/latest_compstat.json`;
    const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/data/latest_compstat.json`;
    
    const tryFetch = async (url) => {
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp;
    };
    
    try {
      const resp = await tryFetch(`${RAW_URL}?t=${Date.now()}`);
      const json = await resp.json();
      if (json && json.citywide) { setRawData(json); return; }
      throw new Error('Invalid data shape');
    } catch (e1) {
      console.warn("Raw fetch failed:", e1.message, "— trying GitHub API...");
      try {
        const resp = await tryFetch(API_URL);
        const meta = await resp.json();
        if (meta.content) {
          const decoded = atob(meta.content.replace(/\n/g, ''));
          const json = JSON.parse(decoded);
          if (json && json.citywide) { setRawData(json); return; }
        }
        if (meta.download_url) {
          const resp2 = await tryFetch(meta.download_url);
          const json = await resp2.json();
          if (json && json.citywide) { setRawData(json); return; }
        }
        throw new Error('API response invalid');
      } catch (e2) {
        console.warn("All fetch attempts failed:", e2.message);
        setFetchError(true);
      }
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) { setLocateMsg("Location not supported"); setTimeout(() => setLocateMsg(""), 3000); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://data.cityofnewyork.us/resource/78dh-3ptz.json?$where=intersects(the_geom, 'POINT(${longitude} ${latitude})')`);
        const data = await res.json();
        if (data && data.length > 0) {
          const pName = toOrdinalPrecinct(data[0].precinct);
          if (rawData[pName]) { setActiveGeo(pName); setLocateMsg(`Found: ${pName}`); }
          else { setLocateMsg("Precinct data unavailable"); }
        } else { setLocateMsg("Not in an NYPD Precinct"); }
      } catch (err) { setLocateMsg("Location connection error"); }
      finally { setIsLocating(false); setTimeout(() => setLocateMsg(""), 4000); }
    }, () => { setLocateMsg("Location permission denied"); setIsLocating(false); setTimeout(() => setLocateMsg(""), 3000); });
  };

  const { boroughs, precincts } = useMemo(() => {
    const keys = Object.keys(rawData).filter(k => k !== 'citywide');
    return {
      boroughs: keys.filter(k => !k.includes('Precinct')).sort(),
      precincts: keys.filter(k => k.includes('Precinct')).sort((a, b) => parseInt(a) - parseInt(b))
    };
  }, [rawData]);

  const filteredSearch = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return Object.entries(PRECINCT_NEIGHBORHOODS).filter(([pct, hoods]) =>
      pct.toLowerCase().includes(q) || hoods.toLowerCase().includes(q)
    ).map(([pct, hoods]) => ({ pct, hoods }));
  }, [searchQuery]);

  const parsedData = useMemo(() => {
    const geoData = rawData[activeGeo] || rawData['citywide'];
    const citywideData = rawData['citywide'];
    const pop = activeGeo === 'citywide' ? CITYWIDE_POPULATION : (GEO_POPULATIONS[activeGeo] || null);
    const extract = (obj) => Object.entries(obj || {}).map(([name, stats]) => {
      const current = activeTab === 'ytd' ? stats?.year_to_date?.current_year : stats?.week_to_date?.current_year;
      const prior = activeTab === 'ytd' ? stats?.year_to_date?.prior_year : stats?.week_to_date?.prior_year;
      const pct = activeTab === 'ytd' ? stats?.year_to_date?.pct_change : stats?.week_to_date?.pct_change;
      const c = safeNum(current); const p = safeNum(prior);
      return { name, current: c, prior: p, pct, diff: c - p, hist: stats?.historical || {}, currentRate: pop ? (c / pop) * 10000 : null };
    });
    const felonies = extract(geoData.seven_major_felonies).sort((a, b) => b.current - a.current);
    const minors = extract(geoData.additional_stats).sort((a, b) => b.current - a.current);
    const all = [...felonies, ...minors].sort((a, b) => b.current - a.current);
    let mCur = 0, mPri = 0, pCur = 0, vCur = 0, murder = 0, shootingVic = 0;
    felonies.forEach(f => {
      mCur += f.current; mPri += f.prior;
      if (f.name === 'Murder') murder = f.current;
      if (PROPERTY_CRIMES.includes(f.name)) pCur += f.current;
      if (VIOLENT_CRIMES.includes(f.name)) vCur += f.current;
    });
    minors.forEach(m => { if (m.name === 'Shooting Vic.') shootingVic = m.current; });
    const citywideRates = {};
    if (citywideData) {
      const cwAll = { ...(citywideData.seven_major_felonies || {}), ...(citywideData.additional_stats || {}) };
      Object.entries(cwAll).forEach(([n, s]) => {
        const c = activeTab === 'ytd' ? s?.year_to_date?.current_year : s?.week_to_date?.current_year;
        citywideRates[n] = (safeNum(c) / CITYWIDE_POPULATION) * 10000;
      });
    }
    const mDiff = mCur - mPri;
    let driverObj = null;
    if (mDiff !== 0 && felonies.length > 0) {
      const d = felonies.reduce((p, c) => (Math.abs(c.diff) > Math.abs(p.diff) && Math.sign(c.diff) === Math.sign(mDiff)) ? c : p, {diff: 0});
      if (d && d.name) driverObj = { name: d.name, diff: d.diff, share: Math.abs((d.diff / mDiff) * 100) };
    }
    const historicAnchor = felonies.filter(f => f.hist && typeof f.hist['31_yr_pct'] === 'number').reduce((p, c) => (!p || c.hist['31_yr_pct'] < p.hist['31_yr_pct']) ? c : p, null);
    const notableTrends = all.filter(item => item.prior >= VOLATILITY_THRESHOLD && typeof item.pct === 'number').sort((a, b) => b.pct - a.pct);
    let localAnomaly = null, localBrightSpot = null;
    if (activeGeo !== 'citywide' && pop && citywideData) {
      let maxRatio = 0, minRatio = Infinity;
      all.forEach(item => {
        if (item.currentRate !== null && citywideRates[item.name] && item.current >= 5) {
          const ratio = item.currentRate / citywideRates[item.name];
          if (ratio > maxRatio && ratio > 1.25) { maxRatio = ratio; localAnomaly = { name: item.name, localRate: item.currentRate, cityRate: citywideRates[item.name], ratio }; }
        }
      });
      felonies.forEach(item => {
        if (item.currentRate !== null && citywideRates[item.name] && item.prior >= 5) {
          const ratio = item.currentRate / citywideRates[item.name];
          if (ratio < minRatio && ratio < 0.75) { minRatio = ratio; localBrightSpot = { name: item.name, localRate: item.currentRate, cityRate: citywideRates[item.name], ratio }; }
        }
      });
    }
    return { period: geoData.report_period || {}, felonies, minors, all, driver: driverObj, historicAnchor, topSurge: notableTrends[0], topDrop: notableTrends[notableTrends.length - 1], citywideRates, localAnomaly, localBrightSpot, totals: { mCur, mPri, pCur, vCur, mPct: calcPct(mCur, mPri) ?? 0, diff: mDiff, murder, shootingVic, citywideRate: (mCur / CITYWIDE_POPULATION) * 10000, lethalityRatio: murder > 0 ? (shootingVic / murder) : 0 } };
  }, [rawData, activeTab, activeGeo]);

  const hotspots = useMemo(() => {
    const keys = Object.keys(rawData).filter(k => k !== 'citywide' && k.includes('Precinct'));
    let volumes = [], allPrecinctCrimes = [];
    keys.forEach(pct => {
      const data = rawData[pct]; let vSum = 0;
      Object.entries(data.seven_major_felonies || {}).forEach(([crime, stats]) => {
        const c = safeNum(activeTab === 'ytd' ? stats?.year_to_date?.current_year : stats?.week_to_date?.current_year);
        const p = safeNum(activeTab === 'ytd' ? stats?.year_to_date?.prior_year : stats?.week_to_date?.prior_year);
        if (VIOLENT_CRIMES.includes(crime)) vSum += c;
        if (p >= VOLATILITY_THRESHOLD) allPrecinctCrimes.push({ precinct: pct, crime, pct: ((c - p) / p) * 100, current: c, prior: p });
      });
      volumes.push({ precinct: pct, violent: vSum });
    });
    const sortedV = [...volumes].filter(v => v.violent > 0).sort((a,b) => b.violent - a.violent);
    let inequality = null;
    if (sortedV.length > 10) {
      const top5 = sortedV.slice(0, 5); const top5Sum = top5.reduce((s, p) => s + p.violent, 0); const top5Pop = top5.reduce((s, p) => s + (GEO_POPULATIONS[p.precinct] || 0), 0);
      let bottomSum = 0, bottomCount = 0, bottomPop = 0;
      for (let i = sortedV.length - 1; i >= 0 && bottomSum < top5Sum; i--) { bottomSum += sortedV[i].violent; bottomCount++; bottomPop += (GEO_POPULATIONS[sortedV[i].precinct] || 0); }
      inequality = { topCount: 5, topSum: top5Sum, topPop: top5Pop, bottomCount, bottomPop };
    }
    allPrecinctCrimes.sort((a, b) => b.pct - a.pct);
    return { inequality, topPctSpike: allPrecinctCrimes[0], topPctDrop: allPrecinctCrimes[allPrecinctCrimes.length - 1] };
  }, [rawData, activeTab]);

  const { totals, all, driver, historicAnchor, topSurge, topDrop, citywideRates, localAnomaly, localBrightSpot } = parsedData;
  const isTouristPrecinct = ["14th Precinct", "18th Precinct", "22nd Precinct"].includes(activeGeo);
  const activePop = GEO_POPULATIONS[activeGeo] || (activeGeo === 'citywide' ? CITYWIDE_POPULATION : null);
  const formattedMPct = typeof totals.mPct === 'number' ? Number(Math.abs(totals.mPct)).toFixed(1) : '0.0';
  const formattedHist = historicAnchor?.hist?.['31_yr_pct'] !== undefined ? Number(Math.abs(historicAnchor.hist['31_yr_pct'])).toFixed(1) : '0.0';

  const buildTrendCards = () => {
    const cards = [];
    if (activeGeo === 'citywide') {
      if (driver) {
        const driverShareText = driver.diff > 0
          ? `The overall surge was largely driven by **${driver.name}** index offenses, which account for **${driver.share.toFixed(0)}%** of the total citywide upward shift.`
          : `Nearly **${driver.share.toFixed(0)}%** of the total citywide drop in major index offenses can be attributed to **${driver.name}**, which saw **${Math.abs(driver.diff).toLocaleString()} fewer cases** than last year.`;
        cards.push({ id: 'driver', icon: Target, title: 'Primary Driver', content: driverShareText });
      }
      if (hotspots?.inequality) cards.push({ id: 'inequality', icon: Activity, title: 'Geographic Disparities', content: `The **5 most dangerous precincts** (home to ~${formatPop(hotspots.inequality.topPop)} residents) carry the exact same violent index crime burden as the **${hotspots.inequality.bottomCount} safest precincts combined** (home to ~${formatPop(hotspots.inequality.bottomPop)} residents).` });
      if (hotspots?.topPctSpike || hotspots?.topPctDrop) {
        const flashContent = (
          <ul className="space-y-3 mt-1 text-[14px]">
            {hotspots.topPctSpike && <li>{`In **${formatGeoName(hotspots.topPctSpike.precinct)}**, **${hotspots.topPctSpike.crime}** offenses have spiked by **${hotspots.topPctSpike.pct.toFixed(1)}%**.`}</li>}
            {hotspots.topPctDrop && <li className="pt-2 border-t border-gray-100">{`In **${formatGeoName(hotspots.topPctDrop.precinct)}**, **${hotspots.topPctDrop.crime}** offenses have fallen by **${Math.abs(hotspots.topPctDrop.pct).toFixed(1)}%**.`}</li>}
          </ul>
        );
        cards.push({ id: 'flashpoints', icon: MapPin, title: 'Significant Local Shifts', content: flashContent });
      }
      cards.push({ id: 'lethality', icon: AlertCircle, title: 'The Lethality Gap', content: `For every **1 homicide**, there were **${totals.lethalityRatio.toFixed(1)} shooting victims**. (A widening gap often points to improved trauma care rather than fewer street shootings).` });
    } else {
      if (driver && driver.share >= 25) {
        cards.push({ id: 'local_driver', icon: Target, title: 'Local Driver', content: `The change in **${driver.name}** volume (shifting by ${formatSignedInt(driver.diff)} incidents) accounts for **${driver.share.toFixed(0)}%** of this area's trajectory.` });
      }
      if (localAnomaly && !isTouristPrecinct) cards.push({ id: 'anomaly', icon: AlertTriangle, title: 'Elevated Local Risk', content: `The rate for **${localAnomaly.name}** here is **${localAnomaly.localRate.toFixed(1)} per 10k residents**, which is **${localAnomaly.ratio.toFixed(1)}x** higher than the citywide average (${localAnomaly.cityRate.toFixed(1)}).` });
      else if (topSurge && topSurge.pct > 0) cards.push({ id: 'surge', icon: TrendingUp, title: 'Local Trajectory', content: `**${topSurge.name}** index offenses have increased by **${topSurge.pct.toFixed(1)}%** compared to last year.` });
      if (localBrightSpot && !isTouristPrecinct) cards.push({ id: 'brightspot', icon: ShieldCheck, title: 'Local Bright Spot', content: `The rate of **${localBrightSpot.name}** offenses here sits **${((1 - localBrightSpot.ratio)*100).toFixed(0)}% below** the citywide average.` });
      else if (topDrop && topDrop.pct < 0) cards.push({ id: 'drop', icon: TrendingDown, title: 'Local Trajectory', content: `**${topDrop.name}** index offenses have fallen by **${Math.abs(topDrop.pct).toFixed(1)}%** here compared to last year.` });
    }
    return cards;
  };

  const trendCards = buildTrendCards();
  const risingOffenses = useMemo(() => all.filter(o => o.pct > 0).sort((a, b) => b.pct - a.pct) || [], [all]);
  const fallingOffenses = useMemo(() => all.filter(o => o.pct < 0).sort((a, b) => a.pct - b.pct) || [], [all]);

  return (
    <div className="min-h-screen pb-12 font-sans bg-white text-black text-[15px]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">

        <header className="pt-6 pb-3 mb-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-black">NYPD CompStat Ledger</span>
            <span className="text-gray-300">•</span>
            <span className="text-[12px] font-medium text-gray-500 tabular-nums">{parsedData.period?.week_start || 'N/A'} – {parsedData.period?.week_end || 'N/A'}</span>
            <button onClick={loadReport} className="ml-2 text-gray-400 hover:text-black transition-colors"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></button>
            {fetchError && <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Using embedded data</span>}
            <div className="relative ml-1">
              <button onClick={() => setShowHelp(!showHelp)} className={`text-gray-400 hover:text-black transition-colors ${showHelp ? 'text-black' : ''}`}><Info size={14} /></button>
              {showHelp && <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-gray-200 shadow-2xl rounded p-4 z-50">
                <div className="flex justify-between mb-3"><h4 className="font-black text-black uppercase tracking-widest text-[10px]">How to use this tool</h4><button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-black font-bold px-2">&times;</button></div>
                <ul className="space-y-3 text-[13px] text-gray-600 font-serif">
                  <li>Use dropdown or search to zoom to a precinct.</li>
                  <li>View per-capita rates next to volume for context.</li>
                  <li>Faded rows indicate sample sizes under 30 (high volatility).</li>
                  <li>Use the query box to ask plain-language questions about whatever data is in view.</li>
                </ul>
              </div>}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto relative z-20">
            <div className="flex flex-col flex-1 md:w-80 relative">
              <div className="flex gap-2">
                {!showSearch ? (
                  <div className="relative flex-1">
                    <select value={activeGeo} onChange={e => setActiveGeo(e.target.value)} className="w-full appearance-none text-[11px] font-black uppercase tracking-wider py-2.5 pl-4 pr-8 rounded border border-gray-300 bg-white focus:outline-none">
                      <option value="citywide">Citywide</option>
                      <optgroup label="Boroughs">{boroughs.map(b => <option key={b} value={b}>{b}</option>)}</optgroup>
                      <optgroup label="Precincts">{precincts.map(p => <option key={p} value={p}>{formatGeoName(p)}</option>)}</optgroup>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 pointer-events-none text-gray-500" />
                  </div>
                ) : (
                  <div className="relative flex-1">
                    <input autoFocus type="text" placeholder="Type a neighborhood..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onBlur={() => setTimeout(() => setShowSearch(false), 200)} className="w-full text-[12px] font-bold py-2.5 px-4 rounded border border-indigo-400 focus:outline-none" />
                    {searchQuery && <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded z-50 max-h-60 overflow-y-auto">
                      {filteredSearch.length > 0 ? filteredSearch.map(r => (
                        <button key={r.pct} onMouseDown={() => { setActiveGeo(r.pct); setShowSearch(false); setSearchQuery(''); }} className="w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50">
                          <div className="font-bold text-sm text-black">{r.pct}</div>
                          <div className="text-[11px] text-gray-500">{r.hoods}</div>
                        </button>
                      )) : <div className="p-3 text-sm text-gray-500">No matches found.</div>}
                    </div>}
                  </div>
                )}
                <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }} className="flex items-center justify-center px-3 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600"><SearchIcon size={14} /></button>
                <button onClick={handleLocateUser} disabled={isLocating} className="flex items-center justify-center px-3 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50">{isLocating ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}</button>
              </div>
              {locateMsg && <span className="absolute -bottom-5 left-0 text-[10px] font-bold uppercase tracking-widest text-indigo-600">{locateMsg}</span>}
            </div>
            <div className="flex w-fit border border-black rounded overflow-hidden">
              <button onClick={() => setActiveTab('wtd')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'wtd' ? 'bg-black text-white' : 'bg-white'}`}>Weekly</button>
              <button onClick={() => setActiveTab('ytd')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'ytd' ? 'bg-black text-white' : 'bg-white'}`}>Yearly</button>
            </div>
          </div>
        </header>

        <section className="mb-10">
          {isTouristPrecinct && <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-400 text-sm font-serif italic text-gray-700"><strong>Context Note:</strong> {formatGeoName(activeGeo)} is a high-traffic hub with few residents; crime rates primarily reflect commercial/visitor density.</div>}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.08] tracking-tight mb-3 text-black max-w-4xl">
            Major index offenses are {totals.diff > 0 ? 'up' : 'down'} {formattedMPct}% {activeTab === 'ytd' ? 'year-to-date' : 'this week'} vs. prior year.
          </h1>
          <p className="text-base md:text-lg font-serif text-gray-600 mb-6 max-w-3xl leading-snug">
            Violent index offenses account for <strong className="text-black">{Number((totals.vCur / (totals.mCur || 1)) * 100).toFixed(0)}%</strong> of the {totals.mCur.toLocaleString()} major felonies reported {activeGeo === 'citywide' ? 'citywide' : `in the ${activeGeo}`}, while the remaining <strong className="text-black">{Number((totals.pCur / (totals.mCur || 1)) * 100).toFixed(0)}%</strong> are property-related.
          </p>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <div className="flex items-end gap-3">
              <span className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter leading-none">{totals.mCur.toLocaleString()}</span>
              <div className="pb-1.5 flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Index Total</span>
                <span className={`text-base font-bold tabular-nums ${totals.mPct > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {totals.mPct > 0 ? '+' : (totals.mPct < 0 ? '-' : '')}{formattedMPct}% vs {totals.mPri.toLocaleString()} last yr
                </span>
              </div>
            </div>
            {activePop && activeGeo !== 'citywide' && !isTouristPrecinct && (
              <div className="pb-1.5 flex flex-col pl-6 border-l border-gray-200">
                <span className="text-sm font-medium text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Users size={14} /> Per 10k Residents</span>
                <span className="text-lg font-bold text-black tabular-nums">{((totals.mCur / activePop) * 10000).toFixed(1)} incidents</span>
                <span className="text-xs font-medium text-gray-500 mt-1">Citywide: {(totals.citywideRate || 0).toFixed(1)} per 10k</span>
              </div>
            )}
          </div>
        </section>

        <QueryBox
          parsedData={parsedData}
          activeGeo={activeGeo}
          activeTab={activeTab}
          period={parsedData.period}
          rawData={rawData}
        />

        <section className="mb-12 pt-8 border-t border-gray-200">
          <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 mb-5">Trends to Watch</h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${trendCards.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8`}>
            {trendCards.map(card => {
              const IconComp = card.icon;
              return (
                <div key={card.id} className="p-6 bg-gray-50 rounded-sm">
                  <div className="flex items-center gap-2 mb-3"><IconComp size={16} className="text-black" /><h3 className="text-[10px] font-black uppercase tracking-widest text-black">{card.title}</h3></div>
                  <div className="font-serif text-[15px] leading-relaxed text-gray-700">{renderMarkdown(card.content)}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-12 pt-8 border-t-[3px] border-black">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-5">
            <h2 className="text-2xl font-black font-serif">All Tracked Offenses</h2>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-2 md:mt-0">Ranked by Incident Volume</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
            <div className="max-w-lg"><UnifiedMagnitudeChart data={all} isTourist={isTouristPrecinct} citywideRates={citywideRates} activeGeo={activeGeo} /></div>
            <div className="max-w-lg"><DivergingBarChart data={all} /></div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b-2 border-black pb-4 gap-4">
            <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-black">{trendFilter === 'all' ? 'Detailed Data Ledger' : trendFilter === 'up' ? 'Rising Offenses' : 'Falling Offenses'}</h3>
            <div className="flex bg-gray-100 p-1 rounded border border-gray-200 w-full md:w-auto">
              <button onClick={() => setTrendFilter('all')} className={`flex-1 md:flex-none px-4 py-1.5 text-[10px] font-black uppercase ${trendFilter === 'all' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>All</button>
              <button onClick={() => setTrendFilter('up')} className={`flex-1 md:flex-none px-4 py-1.5 text-[10px] font-black uppercase ${trendFilter === 'up' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}>Rising</button>
              <button onClick={() => setTrendFilter('down')} className={`flex-1 md:flex-none px-4 py-1.5 text-[10px] font-black uppercase ${trendFilter === 'down' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}>Falling</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200">
                  <th className="py-3">Crime Category</th>
                  <th className="py-3 text-right">Prior Year</th>
                  <th className="py-3 text-right">Current</th>
                  <th className="py-3 text-right">Change</th>
                  {trendFilter === 'all' && <th className="py-3 text-center" style={{color: VC.indigo}}>31-Yr Trend</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(trendFilter === 'all' ? all : (trendFilter === 'up' ? risingOffenses : fallingOffenses)).map(item => {
                  const isVolatile = item.prior < VOLATILITY_THRESHOLD;
                  return (
                    <tr key={item.name} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-3 font-bold text-sm text-black">{item.name}{isVolatile && <span className="ml-1 text-gray-400">*</span>}</td>
                      <td className={`py-3 text-right tabular-nums text-gray-500 ${isVolatile ? 'opacity-50' : ''}`}><div className="text-sm">{item.prior.toLocaleString()}</div></td>
                      <td className={`py-3 text-right tabular-nums text-black ${isVolatile ? 'opacity-50' : ''}`}>
                        <div className="text-sm font-black">{item.current.toLocaleString()}</div>
                        {item.currentRate !== null && !isTouristPrecinct && <div className="text-[10px] font-normal text-gray-500">{item.currentRate.toFixed(1)}/10k (CW: {citywideRates[item.name]?.toFixed(1)})</div>}
                      </td>
                      <td className={`py-3 text-right text-xs font-bold tabular-nums ${item.pct > 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatPct(item.pct)}</td>
                      {trendFilter === 'all' && <td className="py-3 text-center text-xs font-medium tabular-nums text-gray-500">{typeof item.hist?.['31_yr_pct'] === 'number' ? formatPct(item.hist['31_yr_pct']) : '—'}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-[11px] font-serif italic text-gray-500 border-t border-gray-100 pt-4">
            * Indicates a base sample size under 30 (statistically volatile).
            {historicAnchor && activeGeo === 'citywide' && <span className="block mt-1">While current shifts dominate headlines, <strong>{historicAnchor.name}</strong> remains <strong>{formattedHist}% below</strong> its 1993 peak.</span>}
          </div>
        </section>
      </div>
    </div>
  );
}