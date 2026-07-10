# "In Transit" removal — note to self

**Date:** 2026-07-10
**Why:** Paul Reeping pointed out that the *In Transit* figures don't come from CompStat
(the by-offense breakdown is an NYC Open Data complaint-level query; the homicide counts are
hand-entered NYPD Transit Bureau numbers) and, being a system-wide total, don't pertain to any
locality — unlike everything else on the dashboard. So the tab and its data were pulled.

This was done as a **hide, not a delete**, so it can be restored in a few minutes. Every change
site is tagged with the comment marker `TRANSIT-REMOVED` — `grep -rn "TRANSIT-REMOVED" src` finds
them all.

---

## What changed

1. **`src/App.js` — tab hidden.** The `['transit', 'In Transit']` entry in `MAIN_TABS` is
   commented out. Because `TAB_KEYS` is derived from `MAIN_TABS`, a stale deep link
   (`?tab=transit`) now falls back to the headlines page automatically — no separate guard needed.

2. **`src/App.js` — Crime Types / patterns bleed scrubbed.** `additional_stats` carries a
   system-wide `"Transit"` line (citywide ~1,131 YTD) that was showing up as a row in the **Crime
   Types** table and was eligible for the **Headlines** "patterns and outliers" callouts. The
   `minors` list now `.filter(m => m.name !== 'Transit')`, so it's gone from both. (The `Housing`
   line is left in — see "Left in place" below.)

3. **`src/App.js` — render branch kept, marked.** `{mainTab === 'transit' && <Transit … />}` and
   the `import Transit from './tabs/Transit'` are left intact but unreachable, so restoring is a
   one-line change. (Note: with `CI=true`, an *unused* import would fail the build — that's why the
   import and branch stay rather than being commented out.)

4. **`src/tabs/About.js` — copy cleaned.**
   - The CompStat-report paragraph no longer lists "transit and" among the additional offenses.
   - Under **NYC Open Data**, the "Transit offense breakdown" paragraph was removed and the intro
     changed from "Three live queries" to "Two live queries" (shooting incidents + precinct locator).
   - The entire **Transit homicides** section (`<H>` + `<P>`) was removed.

## Left in place (deliberate)

- **`src/tabs/Transit.js`** — the whole component is untouched. Nothing renders it, and it fires
  no network queries while it isn't mounted.
- **`src/shared.js`** — the `'Transit'`/`'Housing'` entries in `EXPANDED_CRIME_NAMES` stay; they're
  just a label lookup and are harmless when unused.
- **`src/tabs/CouncilDistricts.js`** — the `cls === 'TRANSIT'` → "Shooting in the transit system"
  label is **shooting-incident location** data (a real point plotted on the district map), not the
  In Transit tab's data. It genuinely pertains to a locality, so it stays.
- **`GEO_INERT_TABS` / `YTD_ONLY_TABS`** in `App.js` still list `'transit'`. Dead but harmless
  (nothing can set `mainTab` to `'transit'`), and keeping them makes the restore cleaner.

## Open question flagged to Ted

The `Housing` line in `additional_stats` is the same *kind* of thing as Transit — a system-wide
NYPD bureau total, not a locality figure — and it still appears in the Crime Types table. Paul only
named transit, so it was left alone. If you want it gone too, add `'Housing'` to the same
`.filter()` in `App.js` (change to `m => !['Transit', 'Housing'].includes(m.name)`).

---

## How to fully restore

1. In `src/App.js`, **uncomment** the `['transit', 'In Transit']` line in `MAIN_TABS`.
2. In `src/App.js`, **delete the `.filter(m => m.name !== 'Transit')`** from the `minors`
   definition (put it back to `const minors = extract(geoData.additional_stats).sort(...)`).
3. In `src/tabs/About.js`, restore the three copy edits (git history for this file, or this doc,
   shows the original wording). Steps 1–2 are the functional restore; step 3 is just prose.
4. Rebuild and redeploy (`npm run build`, then publish `build/` to the `gh-pages` branch).

The functional tab comes back with steps 1–2 alone. A quick check:
`grep -rn "TRANSIT-REMOVED" src` — clear all three markers and the tab is fully live again.
