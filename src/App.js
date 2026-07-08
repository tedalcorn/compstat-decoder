import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FALLBACK_DATA, GITHUB_USER, REPO_NAME, CITYWIDE_POPULATION, VOLATILITY_THRESHOLD,
  GEO_POPULATIONS, PRECINCT_NEIGHBORHOODS, TOURIST_PRECINCTS, VIOLENT_CRIMES, PROPERTY_CRIMES,
  safeNum, calcPct, formatGeoName, precinctPatrolBorough, PATROL_BOROUGH_NAMES,
  SearchIcon, Link2, Activity,
  RTCI_CSV_URL, parseRTCIcsv, RTCI_FALLBACK, RTCI_FALLBACK_PERIOD, RTCI_FALLBACK_UPDATED,
} from './shared';
import HistoricView from './HistoricView';
import Headlines from './tabs/Headlines';
import CrimeNumbers from './tabs/CrimeNumbers';
import ByPrecinct from './tabs/ByPrecinct';
import Transit from './tabs/Transit';
import CouncilDistricts from './tabs/CouncilDistricts';

const MAIN_TABS = [
  ['headlines', 'Headlines'],
  ['numbers', 'Crime Numbers'],
  ['transit', 'Transit'],
  ['precincts', 'By Precinct'],
  ['council', 'By Council District'],
];
const TAB_KEYS = MAIN_TABS.map(t => t[0]);

/* ------------------------------------------------------------------ */
/* MAIN APP — TABBED DASHBOARD                                        */
/* ------------------------------------------------------------------ */
export default function App() {
  // Initialize state from URL query string so deep-links work on first load.
  // Subsequent state changes write back to the URL via replaceState (no history clutter).
  const initialParams = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [appView, setAppView] = useState(initialParams.get('view') || 'live');
  const [mainTab, setMainTab] = useState(TAB_KEYS.includes(initialParams.get('tab')) ? initialParams.get('tab') : 'headlines');
  const [activeTab, setActiveTab] = useState(initialParams.get('range') === 'wtd' ? 'wtd' : 'ytd'); // ytd | wtd
  const [activeGeo, setActiveGeo] = useState(initialParams.get('geo') || 'citywide');
  const [districtNum, setDistrictNum] = useState(() => {
    const d = parseInt(initialParams.get('district'), 10);
    return d >= 1 && d <= 51 ? d : 15;
  });
  const [rawData, setRawData] = useState(FALLBACK_DATA);
  const [geoFocused, setGeoFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchError, setFetchError] = useState(false);
  const [rtciData, setRtciData] = useState(null);

  // Map state ('volume' was retired as a map mode; normalize legacy links to 'rate')
  const [mapCrime, setMapCrime] = useState(initialParams.get('mapCrime') || 'all');
  const [mapMode, setMapMode] = useState(['rate', 'change'].includes(initialParams.get('mapMode')) ? initialParams.get('mapMode') : 'rate');

  const loadReport = useCallback(async () => {
    setFetchError(false);
    const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/data/latest_compstat.json`;
    try {
      const resp = await fetch(`${RAW_URL}?t=${Date.now()}`);
      const json = await resp.json();
      if (json && json.citywide) { setRawData(json); return; }
    } catch (e1) {
      setFetchError(true);
    }
  }, []);

  useEffect(() => { loadReport(); }, [loadReport]);

  // Sync state to URL whenever any deep-linkable state changes — uses replaceState
  // so toggles don't pollute the browser's back stack.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (appView !== 'live') params.set('view', appView);
    if (mainTab !== 'headlines') params.set('tab', mainTab);
    if (activeTab !== 'ytd') params.set('range', activeTab);
    if (activeGeo !== 'citywide') params.set('geo', activeGeo);
    if (mapMode !== 'rate') params.set('mapMode', mapMode);
    if (mapCrime !== 'all') params.set('mapCrime', mapCrime);
    if (districtNum !== 15) params.set('district', String(districtNum));
    const qs = params.toString();
    const newUrl = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
    if (newUrl !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [appView, mainTab, activeTab, activeGeo, mapMode, mapCrime, districtNum]);

  // Copy the current URL (with all view state) to the clipboard so users can share specific views.
  const [copyLinkLabel, setCopyLinkLabel] = useState('Copy link');
  const handleCopyLink = useCallback(() => {
    try {
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
      setCopyLinkLabel('Copied!');
      setTimeout(() => setCopyLinkLabel('Copy link'), 1500);
    } catch {
      setCopyLinkLabel('Copy failed');
      setTimeout(() => setCopyLinkLabel('Copy link'), 1500);
    }
  }, []);

  // Generic CSV download helper. Takes a filename and an array of arrays (header + rows).
  const downloadCSV = useCallback((filename, rows) => {
    const escapeCell = (c) => {
      const s = c == null ? '' : String(c);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = rows.map(r => r.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  // Fetch RTCI city comparison data
  useEffect(() => {
    fetch(RTCI_CSV_URL)
      .then(r => r.ok ? r.text() : Promise.reject('fetch failed'))
      .then(csv => {
        const parsed = parseRTCIcsv(csv);
        if (parsed) setRtciData(parsed);
      })
      .catch(() => {
        const fallbackMap = {};
        RTCI_FALLBACK.forEach(c => { fallbackMap[c.city] = c; });
        setRtciData({ cities: fallbackMap, period: RTCI_FALLBACK_PERIOD, updated: RTCI_FALLBACK_UPDATED });
      });
  }, []);

  // Selecting a geography routes to a tab that can actually show it.
  const selectGeo = (geo) => {
    setActiveGeo(geo);
    if (!['headlines', 'numbers'].includes(mainTab)) setMainTab('headlines');
  };
  const selectPrecinctForNumbers = (geoKey) => {
    setActiveGeo(geoKey);
    setMainTab('numbers');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const boroughs = useMemo(() => {
    return Object.keys(rawData).filter(k => k !== 'citywide' && !k.includes('Precinct')).sort();
  }, [rawData]);

  const geoSearchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const matchedBoroughs = boroughs.filter(b => !q || b.toLowerCase().includes(q));
    const matchedPrecincts = Object.entries(PRECINCT_NEIGHBORHOODS)
      .filter(([pct, hoods]) => !q || pct.toLowerCase().includes(q) || hoods.toLowerCase().includes(q))
      .map(([pct, hoods]) => ({ pct, hoods }));
    return { boroughs: matchedBoroughs, precincts: matchedPrecincts, showCitywide: !q || 'citywide'.includes(q) };
  }, [searchQuery, boroughs]);

  const parsedData = useMemo(() => {
    const geoData = rawData[activeGeo] || rawData['citywide'];
    const citywideData = rawData['citywide'];
    const pop = activeGeo === 'citywide' ? CITYWIDE_POPULATION : (GEO_POPULATIONS[activeGeo] || null);
    const extract = (obj) => Object.entries(obj || {}).map(([name, stats]) => {
      const current = activeTab === 'ytd' ? stats?.year_to_date?.current_year : stats?.week_to_date?.current_year;
      const prior = activeTab === 'ytd' ? stats?.year_to_date?.prior_year : stats?.week_to_date?.prior_year;
      const pct = activeTab === 'ytd' ? stats?.year_to_date?.pct_change : stats?.week_to_date?.pct_change;
      const c = safeNum(current); const p = safeNum(prior);
      return { name, current: c, prior: p, pct, diff: c - p, hist: stats?.historical || {}, currentRate: pop ? (c / pop) * 100000 : null };
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
    let cwMCur = 0;
    if (citywideData) {
      const cwFelonies = citywideData.seven_major_felonies || {};
      const cwAddl = citywideData.additional_stats || {};
      const cwAll = { ...cwFelonies, ...cwAddl };

      Object.entries(cwAll).forEach(([n, s]) => {
        const c = activeTab === 'ytd' ? s?.year_to_date?.current_year : s?.week_to_date?.current_year;
        citywideRates[n] = (safeNum(c) / CITYWIDE_POPULATION) * 100000;
      });

      Object.values(cwFelonies).forEach(stats => {
        const c = activeTab === 'ytd' ? stats?.year_to_date?.current_year : stats?.week_to_date?.current_year;
        cwMCur += safeNum(c);
      });
    }

    const mDiff = mCur - mPri;
    let driverObj = null;
    if (mDiff !== 0 && felonies.length > 0) {
      const d = felonies.reduce((p, c) => (Math.abs(c.diff) > Math.abs(p.diff) && Math.sign(c.diff) === Math.sign(mDiff)) ? c : p, {diff: 0});
      if (d && d.name) driverObj = { name: d.name, diff: d.diff, share: Math.abs((d.diff / mDiff) * 100) };
    }

    let topSurge = null, topDrop = null;
    felonies.forEach(f => {
      if (f.prior >= VOLATILITY_THRESHOLD) {
        if (f.pct > 0 && (!topSurge || f.pct > topSurge.pct)) topSurge = f;
        if (f.pct < 0 && (!topDrop || f.pct < topDrop.pct)) topDrop = f;
      }
    });

    let localAnomaly = null, localBrightSpot = null;
    const isTourist = TOURIST_PRECINCTS.includes(activeGeo);
    if (activeGeo !== 'citywide' && pop && citywideData && !isTourist) {
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

    return {
      period: geoData.report_period || {},
      felonies, minors, all, driver: driverObj, citywideRates, localAnomaly, localBrightSpot, topSurge, topDrop,
      totals: {
        mCur, mPri, pCur, vCur,
        mPct: calcPct(mCur, mPri) ?? 0,
        diff: mDiff,
        murder,
        shootingVic,
        citywideRate: (cwMCur / CITYWIDE_POPULATION) * 100000,
        lethalityRatio: murder > 0 ? (shootingVic / murder) : 0
      }
    };
  }, [rawData, activeTab, activeGeo]);

  // Dynamic <title> so browser tabs and social previews carry the latest reporting period.
  useEffect(() => {
    if (parsedData?.period?.week_end) {
      const fmt = (s) => {
        try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
        catch { return s; }
      };
      const end = fmt(parsedData.period.week_end);
      document.title = `NYC Crime Breakdown · Updated ${end}`;
    }
  }, [parsedData.period?.week_end, parsedData.period?.week_start]);

  const hotspots = useMemo(() => {
    // Scope the pattern-detection pool: citywide looks across all precincts; a borough
    // looks only at its own precincts. (Precinct views use their own vs-citywide rules.)
    const isBorough = PATROL_BOROUGH_NAMES.includes(activeGeo);
    const keys = Object.keys(rawData).filter(k => k !== 'citywide' && k.includes('Precinct'))
      .filter(k => !isBorough || precinctPatrolBorough(k) === activeGeo);
    const topCount = isBorough ? 3 : 5;
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
    if (sortedV.length > topCount * 2) {
      const top = sortedV.slice(0, topCount); const topSum = top.reduce((s, p) => s + p.violent, 0); const topPop = top.reduce((s, p) => s + (GEO_POPULATIONS[p.precinct] || 0), 0);
      let bottomSum = 0, bottomCount = 0, bottomPop = 0;
      for (let i = sortedV.length - 1; i >= 0 && bottomSum < topSum; i--) { bottomSum += sortedV[i].violent; bottomCount++; bottomPop += (GEO_POPULATIONS[sortedV[i].precinct] || 0); }
      if (bottomCount > topCount) inequality = { topCount, topSum, topPop, bottomCount, bottomPop };
    }
    allPrecinctCrimes.sort((a, b) => b.pct - a.pct);
    return { inequality, topPctSpike: allPrecinctCrimes[0], topPctDrop: allPrecinctCrimes[allPrecinctCrimes.length - 1] };
  }, [rawData, activeTab, activeGeo]);

  const isTouristPrecinct = TOURIST_PRECINCTS.includes(activeGeo);
  const activePop = GEO_POPULATIONS[activeGeo] || (activeGeo === 'citywide' ? CITYWIDE_POPULATION : null);

  // Compute per-100k rates for all precincts (for map + ranking bars)
  const precinctRates = useMemo(() => {
    const precinctKeys = Object.keys(rawData).filter(k => k.includes('Precinct'));
    return precinctKeys.map(pct => {
      const pop = GEO_POPULATIONS[pct];
      const d = rawData[pct];
      const felonies = d.seven_major_felonies || {};
      const addl = d.additional_stats || {};
      let count = 0, priorCount = 0;
      const getCurrent = (stats) => safeNum(activeTab === 'ytd' ? stats?.year_to_date?.current_year : stats?.week_to_date?.current_year);
      const getPrior = (stats) => safeNum(activeTab === 'ytd' ? stats?.year_to_date?.prior_year : stats?.week_to_date?.prior_year);
      if (mapCrime === 'all') {
        Object.values(felonies).forEach(s => { count += getCurrent(s); priorCount += getPrior(s); });
      } else if (mapCrime === 'violent') {
        ['Murder', 'Rape', 'Robbery', 'Fel. Assault'].forEach(c => { if (felonies[c]) { count += getCurrent(felonies[c]); priorCount += getPrior(felonies[c]); } });
      } else if (mapCrime === 'property') {
        ['Burglary', 'Gr. Larceny', 'G.L.A.'].forEach(c => { if (felonies[c]) { count += getCurrent(felonies[c]); priorCount += getPrior(felonies[c]); } });
      } else {
        const all = { ...felonies, ...addl };
        if (all[mapCrime]) { count = getCurrent(all[mapCrime]); priorCount = getPrior(all[mapCrime]); }
      }
      const precinctNum = pct.replace(/\D+/g, '').replace(/^0+/, '');
      const pctChange = priorCount > 0 ? ((count - priorCount) / priorCount) * 100 : null;
      return { precinct: pct, precinctNum, rate: pop ? (count / pop) * 100000 : null, count, priorCount, pctChange, isTourist: TOURIST_PRECINCTS.includes(pct) };
    });
  }, [rawData, activeTab, mapCrime]);

  // ==========================================
  // HISTORIC VIEW
  // ==========================================
  if (appView === 'historic') {
    return <HistoricView onBack={() => setAppView('live')} />;
  }

  // ==========================================
  // LIVE COMPSTAT DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen pb-12 font-sans bg-white text-black text-[15px]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">

        {/* Single-row navigation: brand, section tabs, geography, period toggle */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 -mx-5 sm:-mx-8 px-5 sm:px-8 mb-8 py-2 flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-black flex-shrink-0 mr-1">NYC Crime Breakdown</span>
          <nav className="flex items-center" aria-label="Sections">
            {MAIN_TABS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMainTab(key)}
                aria-pressed={mainTab === key}
                className={`text-[12.5px] font-bold px-1.5 py-1.5 border-b-2 transition-colors flex-shrink-0 whitespace-nowrap ${mainTab === key ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative w-36">
              <SearchIcon size={13} className="absolute left-2.5 top-[9px] pointer-events-none text-gray-400" />
              <input
                type="text"
                placeholder={geoFocused ? "Neighborhood or precinct..." : ""}
                value={geoFocused ? searchQuery : (activeGeo === 'citywide' ? 'Citywide' : formatGeoName(activeGeo))}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={e => { setGeoFocused(true); setSearchQuery(''); e.target.value = ''; }}
                onBlur={() => setTimeout(() => { setGeoFocused(false); setSearchQuery(''); }, 200)}
                className={`w-full text-[11px] font-bold py-1.5 pl-8 pr-2 rounded border bg-white focus:outline-none truncate ${geoFocused ? 'border-indigo-400' : 'border-gray-300'}`}
              />
              {geoFocused && (
                <div className="absolute top-full right-0 w-72 mt-1 bg-white border border-gray-200 shadow-xl rounded z-50 max-h-72 overflow-y-auto">
                  {geoSearchResults.showCitywide && (
                    <button onMouseDown={() => { selectGeo('citywide'); setGeoFocused(false); setSearchQuery(''); }} className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 ${activeGeo === 'citywide' ? 'bg-gray-50 font-black' : ''}`}>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-black">Citywide</div>
                    </button>
                  )}
                  {geoSearchResults.boroughs.length > 0 && (
                    <>
                      <div className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Boroughs</div>
                      {geoSearchResults.boroughs.map(b => (
                        <button key={b} onMouseDown={() => { selectGeo(b); setGeoFocused(false); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${activeGeo === b ? 'bg-gray-50 font-black' : ''}`}>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-black">{b}</div>
                        </button>
                      ))}
                    </>
                  )}
                  {geoSearchResults.precincts.length > 0 && (
                    <>
                      <div className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-100">Precincts</div>
                      {geoSearchResults.precincts.map(r => (
                        <button key={r.pct} onMouseDown={() => { selectGeo(r.pct); setGeoFocused(false); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${activeGeo === r.pct ? 'bg-gray-50' : ''}`}>
                          <div className="text-[12px] font-bold text-black">{r.pct}</div>
                          <div className="text-[10px] text-gray-500">{r.hoods}</div>
                        </button>
                      ))}
                    </>
                  )}
                  {!geoSearchResults.showCitywide && geoSearchResults.boroughs.length === 0 && geoSearchResults.precincts.length === 0 && (
                    <div className="px-3 py-3 text-sm text-gray-500">No matches found.</div>
                  )}
                </div>
              )}
            </div>
            <div className="flex border border-gray-300 rounded overflow-hidden shrink-0">
              <button onClick={() => setActiveTab('wtd')} aria-pressed={activeTab === 'wtd'} title="This CompStat week vs the same week last year" className={`px-2 py-1.5 text-[10px] font-black uppercase tracking-wide transition-colors ${activeTab === 'wtd' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:text-black'}`}>Wk</button>
              <button onClick={() => setActiveTab('ytd')} aria-pressed={activeTab === 'ytd'} title="Year-to-date vs the same period last year" className={`px-2 py-1.5 text-[10px] font-black uppercase tracking-wide transition-colors ${activeTab === 'ytd' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:text-black'}`}>YTD</button>
            </div>
            <button onClick={handleCopyLink} title="Copy a shareable link to this exact view" aria-label="Copy a shareable link to this exact view" className="text-gray-400 hover:text-black transition-colors flex items-center gap-1 px-0.5 py-1 flex-shrink-0">
              <Link2 size={14} />
              {copyLinkLabel !== 'Copy link' && <span className="text-[10px] font-black uppercase tracking-widest">{copyLinkLabel}</span>}
            </button>
            <button onClick={() => setAppView('historic')} title="The 30-year transformation of NYC crime" className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
              <Activity size={12} /> 30-Yr
            </button>
          </div>
        </div>

        {/* Active tab content */}
        {mainTab === 'headlines' && (
          <Headlines
            parsedData={parsedData}
            hotspots={hotspots}
            rawData={rawData}
            activeTab={activeTab}
            activeGeo={activeGeo}
            isTouristPrecinct={isTouristPrecinct}
            activePop={activePop}
            rtciData={rtciData}
            downloadCSV={downloadCSV}
          />
        )}
        {mainTab === 'numbers' && (
          <CrimeNumbers
            parsedData={parsedData}
            activeTab={activeTab}
            activeGeo={activeGeo}
            isTouristPrecinct={isTouristPrecinct}
            downloadCSV={downloadCSV}
          />
        )}
        {mainTab === 'precincts' && (
          <ByPrecinct
            precinctRates={precinctRates}
            mapMode={mapMode}
            setMapMode={setMapMode}
            mapCrime={mapCrime}
            setMapCrime={setMapCrime}
            onSelectPrecinct={selectPrecinctForNumbers}
          />
        )}
        {mainTab === 'transit' && (
          <Transit rawData={rawData} downloadCSV={downloadCSV} />
        )}
        {mainTab === 'council' && (
          <CouncilDistricts
            rawData={rawData}
            activeTab={activeTab}
            districtNum={districtNum}
            setDistrictNum={setDistrictNum}
            onSelectPrecinct={selectPrecinctForNumbers}
            downloadCSV={downloadCSV}
          />
        )}

        {/* Methodology / About footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-[12px] text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Data sources</h3>
            <ul className="space-y-1 leading-snug">
              <li>NYPD CompStat 2.0 weekly report (scraped from <a href="https://compstat.nypdonline.org/" className="underline hover:text-black" target="_blank" rel="noopener noreferrer">compstat.nypdonline.org</a>)</li>
              <li>NYC Open Data — NYPD Complaint Data Historic (<code className="text-[10px]">qgea-i56i</code>) &amp; Current YTD (<code className="text-[10px]">5uac-w243</code>)</li>
              <li>NYPD historical annual indices, 1993–present (NYPD Historical NYC Crime Data)</li>
              <li>U.S. Census ACS population estimates for per-100k rate calculations</li>
              <li>Real-Time Crime Index by AH Datalytics for peer-city comparison</li>
              <li>NYC Open Data council district &amp; precinct boundary files for the district-precinct crosswalk</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Methodology notes</h3>
            <ul className="space-y-1 leading-snug">
              <li>"Year-to-date" follows NYPD's CompStat week ending on Sunday — same-period prior-year comparison.</li>
              <li>"Tourist hubs" (14th, 18th, 22nd precincts) have residential populations far below daytime populations, so per-100k rates are flagged with a hatch overlay. % change is unaffected.</li>
              <li>Pre-pandemic baseline = mean and range of 2017–2019 annual citywide totals.</li>
              <li>Current-year sparkline dot uses an annualized projection: <code className="text-[10px]">current_ytd / (prior_year_ytd / prior_year_full)</code>.</li>
              <li>Outlier badges use z-score against the prior-5-year baseline; |z| ≥ 2 triggers a flag.</li>
              <li>"Significant" YoY shifts at the precinct level filter for a base of at least 5 incidents in the prior period to avoid volatile small-sample noise.</li>
              <li>Council-district precinct shares = share of the district's land area inside each precinct, from the official 2023 council lines.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">About</h3>
            <p className="leading-snug mb-3">
              Published by <a href="https://vitalcitynyc.org/" className="underline hover:text-black" target="_blank" rel="noopener noreferrer">Vital City</a>, an independent New York policy journal. The project is open source; data refreshes every Monday after NYPD posts the new CompStat report.
            </p>
            <p className="leading-snug text-gray-500">
              Updated {(parsedData.period?.week_end || '—').replace(/\/20(\d\d)$/, '/$1')} (CompStat week ending). Page rendered {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.{fetchError && ' Live fetch unavailable — showing embedded data.'}
            </p>
            <p className="mt-3"><a href="https://github.com/joshgreenman1973/compstat-ledger" className="underline hover:text-black" target="_blank" rel="noopener noreferrer">View source on GitHub →</a></p>
          </div>
        </footer>
      </div>
    </div>
  );
}
