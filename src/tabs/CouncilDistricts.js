import React, { useMemo, useState } from 'react';
import { geoPath, geoMercator } from 'd3-geo';
import precinctGeoJSON from '../data/nyc_precincts.json';
import councilData from '../data/council_districts.json';
import {
  PRECINCT_NEIGHBORHOODS, MAJOR_VIOLENT, MAJOR_PROPERTY,
  safeNum, formatPct, pctColor, toOrdinalPrecinct, SearchIcon, Download,
} from '../shared';

/* ------------------------------------------------------------------ */
/* COUNCIL DISTRICTS TAB                                               */
/* For each of the 51 Council districts: which NYPD precincts serve    */
/* it (with each precinct's share of the district's area, computed     */
/* from official boundary files) and how crime is trending in each,    */
/* against the citywide average. Always year-to-date — weekly counts   */
/* are too small at this geography to be meaningful.                   */
/* Modeled on the D15 precinct-overlap map.                            */
/* ------------------------------------------------------------------ */

// Categorical pastels for the overlapping precincts, echoing the D15 model map.
const PRECINCT_COLORS = ['#aac4e4', '#f9c99b', '#f2a79e', '#b5d9a8', '#cfcbe6', '#eab8cf', '#dbd3a4', '#a5d8d3'];

const MIN_LABEL_SHARE = 0.04; // don't label slivers on the map; the table has them all

// This tab is always year-to-date; district geographies are too small for weekly counts.
// Sum a set of major-felony offenses (YTD) over one CompStat geography record.
const tallyGeo = (geoRecord, names) => {
  if (!geoRecord?.seven_major_felonies) return { cur: null, pri: null, pct: null, diff: null };
  let cur = 0, pri = 0;
  Object.entries(geoRecord.seven_major_felonies).forEach(([name, s]) => {
    if (names && !names.includes(name)) return;
    cur += safeNum(s?.year_to_date?.current_year);
    pri += safeNum(s?.year_to_date?.prior_year);
  });
  return { cur, pri, pct: pri > 0 ? ((cur - pri) / pri) * 100 : null, diff: cur - pri };
};

const DistrictMap = ({ district, onSelectPrecinct, width = 560, height = 520 }) => {
  const { pathFn, districtFeature, shareByPrecinct, colorByPrecinct } = useMemo(() => {
    const districtFeature = { type: 'Feature', properties: {}, geometry: district.geometry };
    const projection = geoMercator().fitExtent([[36, 36], [width - 36, height - 36]], districtFeature);
    const pathFn = geoPath().projection(projection);
    const shareByPrecinct = {};
    const colorByPrecinct = {};
    district.precincts.forEach((o, i) => {
      shareByPrecinct[o.precinct] = o.share;
      colorByPrecinct[o.precinct] = PRECINCT_COLORS[i % PRECINCT_COLORS.length];
    });
    return { pathFn, districtFeature, shareByPrecinct, colorByPrecinct };
  }, [district, width, height]);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-gray-50 rounded-sm border border-gray-200">
        {/* Context: every precinct, gray */}
        {precinctGeoJSON.features.map(f => {
          const pNum = parseInt(f.properties.precinct, 10);
          const inDistrict = shareByPrecinct[pNum] != null;
          return (
            <path
              key={`base-${f.properties.precinct}`}
              d={pathFn(f)}
              fill={inDistrict ? colorByPrecinct[pNum] : '#ebebeb'}
              fillOpacity={inDistrict ? 0.55 : 1}
              stroke="#fff"
              strokeWidth={0.75}
              style={{ cursor: inDistrict ? 'pointer' : 'default' }}
              onClick={() => inDistrict && onSelectPrecinct(toOrdinalPrecinct(pNum))}
            />
          );
        })}
        {/* District outline on top */}
        <path d={pathFn(districtFeature)} fill="none" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" pointerEvents="none" />
        {/* Labels for the overlapping precincts */}
        {precinctGeoJSON.features.map(f => {
          const pNum = parseInt(f.properties.precinct, 10);
          const share = shareByPrecinct[pNum];
          if (share == null || share < MIN_LABEL_SHARE) return null;
          const [cx, cy] = pathFn.centroid(f);
          if (!isFinite(cx) || !isFinite(cy) || cx < 0 || cx > width || cy < 0 || cy > height) return null;
          const short = toOrdinalPrecinct(pNum).replace(' Precinct', '');
          return (
            <g key={`label-${pNum}`} pointerEvents="none">
              <text x={cx} y={cy - 3} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1f2937" stroke="#fff" strokeWidth="3" paintOrder="stroke">{short} Pct</text>
              <text x={cx} y={cy + 11} textAnchor="middle" fontSize="11" fontWeight="600" fill="#4b5563" stroke="#fff" strokeWidth="3" paintOrder="stroke">{Math.round(share * 100)}% of district</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* Type-to-search district picker — the flat 51-item dropdown was unwieldy.
   Matches on district number or council-member name. */
const DistrictSearch = ({ districts, district, setDistrictNum }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return districts;
    return districts.filter(d =>
      String(d.district) === q ||
      String(d.district).startsWith(q) ||
      (d.member || '').toLowerCase().includes(q)
    );
  }, [query, districts]);

  return (
    <div className="relative w-72 max-w-full">
      <SearchIcon size={13} className="absolute left-2.5 top-[11px] pointer-events-none text-gray-400" />
      <input
        type="text"
        placeholder={open ? 'District number or member name…' : ''}
        value={open ? query : `District ${district.district}${district.member ? ` — ${district.member}` : ''}`}
        onChange={e => setQuery(e.target.value)}
        onFocus={e => { setOpen(true); setQuery(''); e.target.value = ''; }}
        onBlur={() => setTimeout(() => { setOpen(false); setQuery(''); }, 200)}
        className={`w-full text-[12px] font-bold py-2 pl-8 pr-2 rounded border bg-white focus:outline-none truncate ${open ? 'border-indigo-400' : 'border-gray-300'}`}
      />
      {open && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded z-50 max-h-80 overflow-y-auto">
          {results.length === 0 && <div className="px-3 py-3 text-sm text-gray-500">No matches.</div>}
          {results.map(d => (
            <button
              key={d.district}
              onMouseDown={() => { setDistrictNum(d.district); setOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${d.district === district.district ? 'bg-gray-50' : ''}`}
            >
              <span className="text-[12px] font-black text-black">District {d.district}</span>
              {d.member && <span className="text-[12px] text-gray-500"> — {d.member}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function CouncilDistricts({ rawData, activeTab, districtNum, setDistrictNum, onSelectPrecinct, downloadCSV }) {
  const districts = councilData.districts;
  const district = districts.find(d => d.district === districtNum) || districts[0];

  const period = rawData?.citywide?.report_period || {};
  const endYear = period?.week_end ? new Date(period.week_end).getFullYear() : new Date().getFullYear();
  const yy = (y) => `’${String(y).slice(-2)}`;

  // Each overlapping precinct's YTD major-index totals, split into violent / property subsets.
  const rows = useMemo(() => {
    return district.precincts.map((o, i) => {
      const geoKey = toOrdinalPrecinct(o.precinct);
      const d = rawData?.[geoKey];
      return {
        precinct: o.precinct,
        geoKey,
        share: o.share,
        color: PRECINCT_COLORS[i % PRECINCT_COLORS.length],
        hoods: PRECINCT_NEIGHBORHOODS[geoKey] || '',
        all: tallyGeo(d, null),
        violent: tallyGeo(d, MAJOR_VIOLENT),
        property: tallyGeo(d, MAJOR_PROPERTY),
      };
    });
  }, [district, rawData]);

  // Citywide reference — the same three measures, as a comparison line.
  const citywide = useMemo(() => {
    const cw = rawData?.citywide;
    return {
      all: tallyGeo(cw, null),
      violent: tallyGeo(cw, MAJOR_VIOLENT),
      property: tallyGeo(cw, MAJOR_PROPERTY),
    };
  }, [rawData]);

  const changeCell = (t, key = '') => (
    <td key={key} className="py-2.5 text-right tabular-nums text-[13px] font-bold" style={{ color: pctColor(t.pct) }}>
      {typeof t.pct === 'number' ? formatPct(t.pct) : '—'}
      {t.diff != null && <div className="text-[10px] font-normal text-gray-400">{t.diff > 0 ? '+' : ''}{t.diff.toLocaleString()}</div>}
    </td>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <h2 className="text-2xl font-black font-serif">By Council District</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setDistrictNum(district.district <= 1 ? 51 : district.district - 1)}
            className="px-2.5 py-2 text-[11px] font-black border border-gray-300 rounded hover:bg-gray-50" aria-label="Previous district">←</button>
          <DistrictSearch districts={districts} district={district} setDistrictNum={setDistrictNum} />
          <button
            onClick={() => setDistrictNum(district.district >= 51 ? 1 : district.district + 1)}
            className="px-2.5 py-2 text-[11px] font-black border border-gray-300 rounded hover:bg-gray-50" aria-label="Next district">→</button>
        </div>
      </div>

      <div className="mb-6 flex items-baseline gap-3 flex-wrap">
        <h3 className="text-lg font-black">Council District {district.district}</h3>
        {district.member && <span className="text-[14px] font-serif text-gray-600">{district.member}</span>}
        <span className="text-[12px] text-gray-400">{district.precincts.length} precincts</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <DistrictMap district={district} onSelectPrecinct={onSelectPrecinct} />

        <div>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Major felonies by precinct · Year-on-year change (YTD)</h4>
            <button
              onClick={() => {
                const header = ['Precinct', 'Neighborhoods', 'Share of district area',
                  `All ${yy(endYear)}`, `All ${yy(endYear - 1)}`, 'All change (%)',
                  `Violent ${yy(endYear)}`, `Violent ${yy(endYear - 1)}`, 'Violent change (%)',
                  `Property ${yy(endYear)}`, `Property ${yy(endYear - 1)}`, 'Property change (%)'];
                const line = (label, share, m) => [label, '', share,
                  m.all.cur ?? '', m.all.pri ?? '', typeof m.all.pct === 'number' ? m.all.pct.toFixed(2) : '',
                  m.violent.cur ?? '', m.violent.pri ?? '', typeof m.violent.pct === 'number' ? m.violent.pct.toFixed(2) : '',
                  m.property.cur ?? '', m.property.pri ?? '', typeof m.property.pct === 'number' ? m.property.pct.toFixed(2) : ''];
                const data = rows.map(r => { const l = line(r.geoKey, (r.share * 100).toFixed(1) + '%', r); l[1] = r.hoods; return l; });
                data.push(line('Citywide', '100%', citywide));
                downloadCSV(`council_district_${district.district}_precincts.csv`, [header, ...data]);
              }}
              title="Download this table as CSV"
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black border border-gray-300 rounded px-2.5 py-1 hover:bg-gray-50 transition-colors">
              <Download size={11} /> CSV
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b-2 border-black">
                <th className="py-2">Precinct</th>
                <th className="py-2 text-right">Share of district</th>
                <th className="py-2 text-right">All</th>
                <th className="py-2 text-right">Violent</th>
                <th className="py-2 text-right">Property</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.precinct} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onSelectPrecinct(r.geoKey)}>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0" style={{ background: r.color }} />
                      <div>
                        <div className="text-[13px] font-bold text-black leading-tight">{r.geoKey.replace(' Precinct', ' Pct')}</div>
                        {r.hoods && <div className="text-[11px] text-gray-500 leading-tight">{r.hoods}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-[13px] font-bold text-gray-700">{Math.round(r.share * 100)}%</td>
                  {changeCell(r.all, 'all')}
                  {changeCell(r.violent, 'violent')}
                  {changeCell(r.property, 'property')}
                </tr>
              ))}
              {/* Citywide comparison line */}
              <tr className="border-t-2 border-gray-300 bg-gray-50/60">
                <td className="py-2.5 pr-2">
                  <div className="text-[13px] font-black text-black uppercase tracking-wide">Citywide</div>
                  <div className="text-[11px] text-gray-500">Average for comparison</div>
                </td>
                <td className="py-2.5 text-right tabular-nums text-[13px] text-gray-400">—</td>
                {changeCell(citywide.all, 'cw-all')}
                {changeCell(citywide.violent, 'cw-violent')}
                {changeCell(citywide.property, 'cw-property')}
              </tr>
            </tbody>
          </table>

          {activeTab === 'wtd' && (
            <p className="mt-3 text-[11px] font-serif italic text-gray-500 leading-snug">
              Council-district figures are always year-to-date — weekly counts are too small at this geography to read reliably.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
