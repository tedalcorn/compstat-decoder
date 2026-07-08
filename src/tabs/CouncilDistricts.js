import React, { useMemo } from 'react';
import { geoPath, geoMercator } from 'd3-geo';
import precinctGeoJSON from '../data/nyc_precincts.json';
import councilData from '../data/council_districts.json';
import {
  PRECINCT_NEIGHBORHOODS, safeNum, formatPct, pctColor,
  toOrdinalPrecinct, Download,
} from '../shared';

/* ------------------------------------------------------------------ */
/* COUNCIL DISTRICTS TAB                                               */
/* For each of the 51 Council districts: which NYPD precincts serve    */
/* it (with each precinct's share of the district's area, computed     */
/* from official boundary files) and how crime is trending in each.    */
/* Modeled on the D15 precinct-overlap map.                            */
/* ------------------------------------------------------------------ */

// Categorical pastels for the overlapping precincts, echoing the D15 model map.
const PRECINCT_COLORS = ['#aac4e4', '#f9c99b', '#f2a79e', '#b5d9a8', '#cfcbe6', '#eab8cf', '#dbd3a4', '#a5d8d3'];

const MIN_LABEL_SHARE = 0.04; // don't label slivers on the map; the table has them all

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

export default function CouncilDistricts({ rawData, activeTab, districtNum, setDistrictNum, onSelectPrecinct, downloadCSV }) {
  const districts = councilData.districts;
  const district = districts.find(d => d.district === districtNum) || districts[0];

  const period = rawData?.citywide?.report_period || {};
  const endYear = period?.week_end ? new Date(period.week_end).getFullYear() : new Date().getFullYear();
  const yy = (y) => `’${String(y).slice(-2)}`;

  // Pull each overlapping precinct's CompStat totals from the live feed, split into
  // the full major index and its violent / property subsets.
  const rows = useMemo(() => {
    const VIOLENT = ['Murder', 'Rape', 'Robbery', 'Fel. Assault'];
    const PROPERTY = ['Burglary', 'Gr. Larceny', 'G.L.A.'];
    return district.precincts.map((o, i) => {
      const geoKey = toOrdinalPrecinct(o.precinct);
      const d = rawData?.[geoKey];
      const tally = (names) => {
        if (!d?.seven_major_felonies) return { cur: null, pri: null, pct: null, diff: null };
        let cur = 0, pri = 0;
        Object.entries(d.seven_major_felonies).forEach(([name, s]) => {
          if (names && !names.includes(name)) return;
          cur += safeNum(activeTab === 'ytd' ? s?.year_to_date?.current_year : s?.week_to_date?.current_year);
          pri += safeNum(activeTab === 'ytd' ? s?.year_to_date?.prior_year : s?.week_to_date?.prior_year);
        });
        return { cur, pri, pct: pri > 0 ? ((cur - pri) / pri) * 100 : null, diff: cur - pri };
      };
      return {
        precinct: o.precinct,
        geoKey,
        share: o.share,
        color: PRECINCT_COLORS[i % PRECINCT_COLORS.length],
        hoods: PRECINCT_NEIGHBORHOODS[geoKey] || '',
        all: tally(null),
        violent: tally(VIOLENT),
        property: tally(PROPERTY),
      };
    });
  }, [district, rawData, activeTab]);

  const periodWord = activeTab === 'ytd' ? 'YTD' : 'this week';

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-2 gap-4">
        <h2 className="text-2xl font-black font-serif">By Council District</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setDistrictNum(district.district <= 1 ? 51 : district.district - 1)}
            className="px-2.5 py-2 text-[11px] font-black border border-gray-300 rounded hover:bg-gray-50" aria-label="Previous district">←</button>
          <select
            value={district.district}
            onChange={e => setDistrictNum(parseInt(e.target.value, 10))}
            className="bg-white border border-gray-300 text-[12px] font-bold py-2 px-2 rounded focus:outline-none focus:border-black max-w-[280px]"
          >
            {districts.map(d => (
              <option key={d.district} value={d.district}>District {d.district}{d.member ? ` — ${d.member}` : ''}</option>
            ))}
          </select>
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
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Major felonies by precinct · Year-on-year change ({periodWord})</h4>
            <button
              onClick={() => {
                const header = ['Precinct', 'Neighborhoods', 'Share of district area',
                  `All ${yy(endYear)}`, `All ${yy(endYear - 1)}`, 'All change (%)',
                  `Violent ${yy(endYear)}`, `Violent ${yy(endYear - 1)}`, 'Violent change (%)',
                  `Property ${yy(endYear)}`, `Property ${yy(endYear - 1)}`, 'Property change (%)'];
                const data = rows.map(r => [r.geoKey, r.hoods, (r.share * 100).toFixed(1) + '%',
                  r.all.cur ?? '', r.all.pri ?? '', typeof r.all.pct === 'number' ? r.all.pct.toFixed(2) : '',
                  r.violent.cur ?? '', r.violent.pri ?? '', typeof r.violent.pct === 'number' ? r.violent.pct.toFixed(2) : '',
                  r.property.cur ?? '', r.property.pri ?? '', typeof r.property.pct === 'number' ? r.property.pct.toFixed(2) : '']);
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
              {rows.map(r => {
                const changeCell = (t) => (
                  <td className="py-2.5 text-right tabular-nums text-[13px] font-bold" style={{ color: pctColor(t.pct) }}>
                    {typeof t.pct === 'number' ? formatPct(t.pct) : '—'}
                    {t.diff != null && <div className="text-[10px] font-normal text-gray-400">{t.diff > 0 ? '+' : ''}{t.diff.toLocaleString()}</div>}
                  </td>
                );
                return (
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
                    {changeCell(r.all)}
                    {changeCell(r.violent)}
                    {changeCell(r.property)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
