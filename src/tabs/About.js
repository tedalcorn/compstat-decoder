import React from 'react';

/* ------------------------------------------------------------------ */
/* ABOUT TAB                                                           */
/* Data sources, methodology and project info — moved off every page   */
/* into its own tab.                                                   */
/* ------------------------------------------------------------------ */
export default function About({ parsedData, fetchError }) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-black font-serif mb-6">About this project</h2>

      <p className="font-serif text-[16px] leading-relaxed text-gray-700 mb-8">
        Published by <a href="https://vitalcitynyc.org/" className="underline hover:text-black" target="_blank" rel="noopener noreferrer">Vital City</a>, an independent New York policy journal. NYC Crime Breakdown reads the NYPD's weekly CompStat report and pairs it with NYC Open Data and Census figures to put the week's numbers in longer-run and geographic context. The project is open source; data refreshes every Monday after NYPD posts the new CompStat report.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[13px] text-gray-600">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Data sources</h3>
          <ul className="space-y-1.5 leading-snug">
            <li>NYPD CompStat 2.0 weekly report (scraped from <a href="https://compstat.nypdonline.org/" className="underline hover:text-black" target="_blank" rel="noopener noreferrer">compstat.nypdonline.org</a>)</li>
            <li>NYC Open Data — NYPD Complaint Data Historic (<code className="text-[11px]">qgea-i56i</code>) &amp; Current YTD (<code className="text-[11px]">5uac-w243</code>)</li>
            <li>NYPD historical annual indices, 1993–present (NYPD Historical NYC Crime Data)</li>
            <li>U.S. Census ACS population estimates for per-100k rate calculations</li>
            <li>Real-Time Crime Index by AH Datalytics for peer-city comparison</li>
            <li>NYC Open Data council district &amp; precinct boundary files for the district-precinct crosswalk</li>
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Methodology notes</h3>
          <ul className="space-y-1.5 leading-snug">
            <li>"Year-to-date" follows NYPD's CompStat week ending on Sunday — same-period prior-year comparison.</li>
            <li>"Tourist hubs" (14th, 18th, 22nd precincts) have residential populations far below daytime populations, so per-100k rates are flagged with a hatch overlay. % change is unaffected.</li>
            <li>Pre-pandemic baseline = mean and range of 2017–2019 annual totals.</li>
            <li>Current-year trend dot uses an annualized projection: <code className="text-[11px]">current_ytd / (prior_year_ytd / prior_year_full)</code>.</li>
            <li>Precinct-level pattern callouts filter for a base of at least 5 incidents in the prior period to avoid volatile small-sample noise.</li>
            <li>Council-district precinct shares = share of the district's land area inside each precinct, from the official 2023 council lines. By-district figures are always year-to-date — weekly counts are too small at that geography to be meaningful.</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 text-[13px] text-gray-500 leading-snug">
        <p className="mb-2">
          Updated {(parsedData.period?.week_end || '—').replace(/\/20(\d\d)$/, '/$1')} (CompStat week ending). Page rendered {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.{fetchError && ' Live fetch unavailable — showing embedded data.'}
        </p>
        <p><a href="https://github.com/tedalcorn/compstat-ledger" className="underline hover:text-black" target="_blank" rel="noopener noreferrer">View source on GitHub →</a></p>
      </div>
    </div>
  );
}
