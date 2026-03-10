import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter } from 'recharts';

/* ------------------------------------------------------------------ */
/* 1. HISTORICAL DATASETS & CONFIG                                    */
/* ------------------------------------------------------------------ */
const CW = [
  {y:1993,BU:100936,FA:41121,GA:111622,GL:85737,MU:1927,RA:3225,RO:85892},
  {y:1994,BU:90383,FA:39773,GA:94523,GL:75459,MU:1582,RA:3196,RO:72550},
  {y:1995,BU:75649,FA:35528,GA:71798,GL:65425,MU:1181,RA:3018,RO:59733},
  {y:1996,BU:61986,FA:30615,GA:59465,GL:58690,MU:984,RA:2888,RO:49324},
  {y:1997,BU:54866,FA:30259,GA:51312,GL:55686,MU:767,RA:2783,RO:44335},
  {y:1998,BU:47181,FA:28848,GA:43315,GL:51461,MU:629,RA:2476,RO:39003},
  {y:1999,BU:41348,FA:25962,GA:38976,GL:50139,MU:667,RA:2089,RO:35654},
  {y:2000,BU:36858,FA:25881,GA:35596,GL:49398,MU:671,RA:2067,RO:31892},
  {y:2001,BU:31773,FA:23020,GA:29607,GL:46291,MU:649,RA:1930,RO:27827},
  {y:2002,BU:31150,FA:20717,GA:26344,GL:45810,MU:586,RA:1966,RO:25858},
  {y:2003,BU:28614,FA:18722,GA:23147,GL:46502,MU:596,RA:1946,RO:22769},
  {y:2004,BU:25428,FA:18124,GA:20294,GL:47952,MU:570,RA:1758,RO:21100},
  {y:2005,BU:22119,FA:17282,GA:17875,GL:47451,MU:540,RA:1650,RO:19759},
  {y:2006,BU:20398,FA:17010,GA:15770,GL:46254,MU:593,RA:1504,RO:18431},
  {y:2007,BU:18841,FA:17228,GA:13256,GL:44863,MU:496,RA:1305,RO:17705},
  {y:2008,BU:18364,FA:16002,GA:12493,GL:43920,MU:523,RA:1281,RO:16631},
  {y:2009,BU:16624,FA:16631,GA:10681,GL:39272,MU:471,RA:1206,RO:16055},
  {y:2010,BU:16225,FA:16950,GA:10334,GL:37838,MU:536,RA:1373,RO:16182},
  {y:2011,BU:15506,FA:18482,GA:9315,GL:38504,MU:515,RA:1420,RO:16968},
  {y:2012,BU:17235,FA:19381,GA:8093,GL:42497,MU:419,RA:1445,RO:17858},
  {y:2013,BU:16979,FA:20297,GA:7400,GL:45368,MU:335,RA:1378,RO:17872},
  {y:2014,BU:15208,FA:20207,GA:7664,GL:43862,MU:333,RA:1352,RO:16638},
  {y:2015,BU:13071,FA:20271,GA:7332,GL:44007,MU:352,RA:1438,RO:16804},
  {y:2016,BU:11808,FA:20847,GA:6327,GL:44279,MU:335,RA:1438,RO:15654},
  {y:2017,BU:10627,FA:20051,GA:5676,GL:43148,MU:292,RA:1449,RO:14419},
  {y:2018,BU:9768,FA:20208,GA:5428,GL:43558,MU:295,RA:1794,RO:13787},
  {y:2019,BU:10778,FA:20695,GA:5430,GL:43247,MU:319,RA:1755,RO:13369},
  {y:2020,BU:15478,FA:20569,GA:9037,GL:35502,MU:468,RA:1427,RO:13108},
  {y:2021,BU:12811,FA:22835,GA:10415,GL:40870,MU:488,RA:1491,RO:12571},
  {y:2022,BU:15745,FA:26061,GA:13750,GL:51566,MU:438,RA:1617,RO:17411},
  {y:2023,BU:13773,FA:27876,GA:15795,GL:50586,MU:391,RA:1455,RO:16910},
  {y:2024,BU:13067,FA:29452,GA:14193,GL:48445,MU:382,RA:1749,RO:16574},
  {y:2025,BU:12826,FA:29841,GA:13532,GL:48107,MU:309,RA:2049,RO:15092},
];
const MA_CW = {2000:57304,2001:57753,2002:52469,2003:51298,2004:52158,2005:52408,2006:52169,2007:51429,2008:50310,2009:50216,2010:52716,2011:50972,2012:54495,2013:53738,2014:53847,2015:42654,2016:42422,2017:41665,2018:43126,2019:42529,2020:33400,2021:36553,2022:41161,2023:44151,2024:47738};
const BP = [
  {y:1993,Bx:538.5,Bk:541.3,Mn:768.8,Qn:516.8,SI:316.0},
  {y:1997,Bx:301.0,Bk:287.7,Mn:419.3,Qn:279.9,SI:167.0},
  {y:2001,Bx:201.9,Bk:201.4,Mn:283.7,Qn:170.2,SI:90.7},
  {y:2005,Bx:171.5,Bk:166.5,Mn:236.2,Qn:130.0,SI:76.7},
  {y:2009,Bx:144.4,Bk:130.8,Mn:179.9,Qn:104.2,SI:64.5},
  {y:2013,Bx:147.4,Bk:139.8,Mn:173.5,Qn:105.6,SI:72.6},
  {y:2017,Bx:141.0,Bk:109.3,Mn:162.2,Qn:83.9,SI:58.8},
  {y:2019,Bx:136.5,Bk:106.2,Mn:169.4,Qn:82.9,SI:51.0},
  {y:2021,Bx:161.1,Bk:106.3,Mn:171.8,Qn:91.6,SI:52.4},
  {y:2023,Bx:205.7,Bk:120.6,Mn:205.1,Qn:116.1,SI:76.3},
  {y:2025,Bx:210.4,Bk:115.7,Mn:187.2,Qn:111.1,SI:70.3},
];
const PC = [
  {n:'100th',pov:13.9,fa:19.3,ma:46.7,ta:66.0,fs:29.3,sh:0.9,ha:101.2,pl:82.1,gl:24.5},
  {n:'101st',pov:20.7,fa:49.3,ma:72.5,ta:121.8,fs:40.5,sh:1.5,ha:156.0,pl:117.1,gl:24.4},
  {n:'102nd',pov:11.1,fa:20.8,ma:40.0,ta:60.8,fs:34.2,sh:0.2,ha:70.3,pl:82.0,gl:22.4},
  {n:'103rd',pov:13.8,fa:65.6,ma:88.1,ta:153.7,fs:42.7,sh:0.8,ha:155.9,pl:174.9,gl:52.1},
  {n:'104th',pov:10.4,fa:16.0,ma:34.0,ta:50.0,fs:32.0,sh:0.2,ha:61.3,pl:73.1,gl:38.0},
  {n:'105th',pov:7.9,fa:11.4,ma:20.2,ta:31.6,fs:36.1,sh:0.0,ha:47.1,pl:34.8,gl:20.6},
  {n:'106th',pov:9.4,fa:26.1,ma:47.5,ta:73.6,fs:35.5,sh:0.4,ha:73.0,pl:90.3,gl:40.4},
  {n:'107th',pov:12.4,fa:15.7,ma:34.2,ta:49.9,fs:31.4,sh:0.2,ha:59.1,pl:63.9,gl:36.8},
  {n:'108th',pov:9.3,fa:23.5,ma:44.0,ta:67.5,fs:34.8,sh:0.1,ha:82.2,pl:124.5,gl:63.8},
  {n:'109th',pov:14.2,fa:15.7,ma:37.8,ta:53.5,fs:29.4,sh:0.3,ha:60.0,pl:104.6,gl:41.9},
  {n:'10th',pov:11.6,fa:28.7,ma:58.4,ta:87.1,fs:33.0,sh:0.4,ha:107.3,pl:158.5,gl:115.5},
  {n:'110th',pov:13.9,fa:34.9,ma:62.3,ta:97.2,fs:35.9,sh:0.5,ha:66.9,pl:134.9,gl:43.5},
  {n:'111th',pov:7.7,fa:10.0,ma:18.6,ta:28.6,fs:35.0,sh:0.2,ha:49.7,pl:43.2,gl:42.6},
  {n:'112th',pov:8.6,fa:13.7,ma:26.2,ta:39.9,fs:34.4,sh:0.1,ha:62.7,pl:160.7,gl:34.8},
  {n:'113th',pov:10.7,fa:28.2,ma:53.7,ta:81.9,fs:34.4,sh:0.8,ha:91.5,pl:80.6,gl:32.6},
  {n:'114th',pov:12.3,fa:28.6,ma:49.3,ta:77.9,fs:36.7,sh:0.6,ha:102.9,pl:128.7,gl:50.9},
  {n:'115th',pov:14.5,fa:32.8,ma:66.2,ta:99.0,fs:33.1,sh:0.1,ha:57.8,pl:85.4,gl:44.9},
  {n:'120th',pov:14.6,fa:36.5,ma:72.6,ta:109.1,fs:33.4,sh:0.8,ha:139.2,pl:100.0,gl:29.7},
  {n:'121st',pov:12.6,fa:19.3,ma:47.8,ta:67.1,fs:28.8,sh:0.1,ha:106.1,pl:103.2,gl:33.1},
  {n:'122nd',pov:8.3,fa:17.9,ma:26.3,ta:44.2,fs:40.4,sh:0.1,ha:76.1,pl:70.3,gl:29.0},
  {n:'123rd',pov:5.8,fa:9.4,ma:22.2,ta:31.6,fs:29.8,sh:0.0,ha:60.5,pl:40.2,gl:28.0},
  {n:'13th',pov:10.3,fa:30.5,ma:65.6,ta:96.1,fs:31.7,sh:0.1,ha:91.1,pl:311.9,gl:133.7},
  {n:'14th',pov:14.3,fa:213.1,ma:452.5,ta:665.6,fs:32.0,sh:1.2,ha:407.1,pl:1623.3,gl:681.5},
  {n:'17th',pov:6.7,fa:12.7,ma:26.6,ta:39.3,fs:32.3,sh:0.0,ha:64.3,pl:128.6,gl:75.6},
  {n:'18th',pov:11.3,fa:50.7,ma:114.1,ta:164.8,fs:30.8,sh:0.7,ha:159.2,pl:378.2,gl:266.5},
  {n:'19th',pov:7.0,fa:10.4,ma:19.4,ta:29.8,fs:35.0,sh:0.0,ha:48.8,pl:140.0,gl:80.2},
  {n:'1st',pov:5.5,fa:20.4,ma:59.8,ta:80.2,fs:25.4,sh:0.0,ha:87.4,pl:451.5,gl:158.9},
  {n:'20th',pov:8.6,fa:9.2,ma:25.4,ta:34.6,fs:26.6,sh:0.1,ha:63.6,pl:135.3,gl:68.6},
  {n:'23rd',pov:30.6,fa:59.7,ma:87.5,ta:147.2,fs:40.6,sh:1.7,ha:174.9,pl:129.7,gl:62.6},
  {n:'24th',pov:12.4,fa:17.5,ma:33.0,ta:50.5,fs:34.7,sh:0.3,ha:65.4,pl:161.1,gl:48.9},
  {n:'25th',pov:34.1,fa:70.0,ma:128.8,ta:198.8,fs:35.2,sh:1.3,ha:220.1,pl:157.3,gl:77.1},
  {n:'26th',pov:25.5,fa:32.6,ma:51.1,ta:83.7,fs:39.0,sh:1.0,ha:106.9,pl:89.0,gl:75.7},
  {n:'28th',pov:20.5,fa:47.3,ma:87.9,ta:135.2,fs:35.0,sh:1.7,ha:145.0,pl:276.6,gl:79.2},
  {n:'30th',pov:22.4,fa:25.9,ma:59.5,ta:85.4,fs:30.3,sh:0.3,ha:122.9,pl:112.7,gl:54.7},
  {n:'32nd',pov:25.5,fa:56.6,ma:87.9,ta:144.5,fs:39.2,sh:2.1,ha:185.2,pl:118.3,gl:48.2},
  {n:'33rd',pov:21.0,fa:31.5,ma:46.6,ta:78.1,fs:40.3,sh:0.5,ha:78.0,pl:100.7,gl:44.5},
  {n:'34th',pov:15.1,fa:26.5,ma:52.6,ta:79.1,fs:33.5,sh:0.7,ha:62.2,pl:116.1,gl:48.4},
  {n:'40th',pov:39.0,fa:102.4,ma:131.2,ta:233.6,fs:43.8,sh:2.8,ha:221.9,pl:194.7,gl:95.0},
  {n:'41st',pov:31.4,fa:99.7,ma:124.3,ta:224.0,fs:44.5,sh:2.1,ha:197.7,pl:148.5,gl:65.3},
  {n:'42nd',pov:36.1,fa:90.7,ma:112.4,ta:203.1,fs:44.7,sh:3.4,ha:237.6,pl:135.1,gl:66.7},
  {n:'43rd',pov:26.0,fa:45.6,ma:67.2,ta:112.8,fs:40.4,sh:1.8,ha:111.8,pl:116.5,gl:61.3},
  {n:'44th',pov:33.1,fa:66.5,ma:90.8,ta:157.3,fs:42.3,sh:1.7,ha:138.8,pl:116.2,gl:50.0},
  {n:'45th',pov:14.4,fa:29.2,ma:47.3,ta:76.5,fs:38.2,sh:0.9,ha:96.0,pl:103.7,gl:62.6},
  {n:'46th',pov:33.8,fa:67.1,ma:87.3,ta:154.4,fs:43.4,sh:1.7,ha:118.0,pl:72.7,gl:49.8},
  {n:'47th',pov:19.4,fa:62.0,ma:80.4,ta:142.4,fs:43.5,sh:1.9,ha:124.4,pl:90.5,gl:60.9},
  {n:'48th',pov:38.9,fa:84.4,ma:127.7,ta:212.1,fs:39.8,sh:3.2,ha:207.4,pl:154.5,gl:70.2},
  {n:'49th',pov:17.5,fa:46.0,ma:59.0,ta:105.0,fs:43.8,sh:0.7,ha:116.1,pl:152.7,gl:68.7},
  {n:'50th',pov:16.8,fa:21.6,ma:39.2,ta:60.8,fs:35.5,sh:0.7,ha:92.3,pl:107.7,gl:53.3},
  {n:'52nd',pov:26.3,fa:66.4,ma:71.4,ta:137.8,fs:48.2,sh:1.0,ha:116.9,pl:122.8,gl:63.7},
  {n:'5th',pov:23.3,fa:64.5,ma:94.6,ta:159.1,fs:40.5,sh:0.2,ha:134.6,pl:269.4,gl:154.2},
  {n:'60th',pov:25.3,fa:41.4,ma:79.7,ta:121.1,fs:34.2,sh:1.0,ha:103.8,pl:99.1,gl:40.6},
  {n:'61st',pov:15.3,fa:18.1,ma:33.6,ta:51.7,fs:34.9,sh:0.3,ha:53.9,pl:68.1,gl:34.8},
  {n:'62nd',pov:18.4,fa:12.9,ma:37.7,ta:50.6,fs:25.5,sh:0.1,ha:53.8,pl:78.4,gl:30.9},
  {n:'63rd',pov:10.0,fa:14.5,ma:32.1,ta:46.6,fs:31.1,sh:0.5,ha:87.8,pl:118.2,gl:46.1},
  {n:'66th',pov:25.0,fa:11.8,ma:22.7,ta:34.5,fs:34.2,sh:0.0,ha:38.8,pl:50.3,gl:24.4},
  {n:'67th',pov:14.8,fa:48.3,ma:63.8,ta:112.1,fs:43.1,sh:1.9,ha:169.4,pl:76.6,gl:44.8},
  {n:'68th',pov:14.1,fa:11.4,ma:33.3,ta:44.7,fs:25.6,sh:0.0,ha:49.6,pl:75.3,gl:29.2},
  {n:'69th',pov:13.1,fa:27.1,ma:41.3,ta:68.4,fs:39.6,sh:1.2,ha:101.8,pl:64.2,gl:33.7},
  {n:'6th',pov:6.8,fa:25.9,ma:62.8,ta:88.7,fs:29.2,sh:0.5,ha:65.2,pl:257.8,gl:184.1},
  {n:'70th',pov:15.3,fa:26.8,ma:42.6,ta:69.4,fs:38.7,sh:0.7,ha:69.3,pl:89.1,gl:28.6},
  {n:'71st',pov:18.2,fa:42.5,ma:55.5,ta:98.0,fs:43.3,sh:1.1,ha:107.0,pl:93.0,gl:33.0},
  {n:'72nd',pov:17.0,fa:23.6,ma:47.0,ta:70.6,fs:33.4,sh:0.3,ha:45.8,pl:59.6,gl:29.3},
  {n:'73rd',pov:33.1,fa:88.4,ma:119.5,ta:207.9,fs:42.5,sh:3.6,ha:203.6,pl:137.1,gl:52.0},
  {n:'75th',pov:23.2,fa:52.6,ma:78.4,ta:131.0,fs:40.1,sh:1.8,ha:153.0,pl:128.4,gl:45.2},
  {n:'76th',pov:13.4,fa:23.2,ma:42.1,ta:65.3,fs:35.5,sh:0.6,ha:83.0,pl:91.3,gl:40.3},
  {n:'77th',pov:18.1,fa:45.5,ma:48.1,ta:93.6,fs:48.6,sh:1.4,ha:116.1,pl:84.5,gl:44.7},
  {n:'78th',pov:5.8,fa:20.8,ma:34.2,ta:55.0,fs:37.8,sh:0.7,ha:62.0,pl:161.2,gl:53.7},
  {n:'79th',pov:27.8,fa:44.3,ma:57.3,ta:101.6,fs:43.6,sh:1.5,ha:127.4,pl:134.6,gl:41.8},
  {n:'7th',pov:28.1,fa:38.5,ma:79.4,ta:117.9,fs:32.7,sh:0.9,ha:133.7,pl:240.5,gl:81.4},
  {n:'81st',pov:22.0,fa:31.8,ma:63.6,ta:95.4,fs:33.3,sh:1.7,ha:106.4,pl:96.3,gl:38.8},
  {n:'83rd',pov:22.2,fa:34.0,ma:72.8,ta:106.8,fs:31.8,sh:1.1,ha:86.8,pl:92.7,gl:61.6},
  {n:'84th',pov:11.6,fa:59.5,ma:61.7,ta:121.2,fs:49.1,sh:0.6,ha:140.3,pl:256.4,gl:106.2},
  {n:'88th',pov:14.3,fa:31.7,ma:65.5,ta:97.2,fs:32.6,sh:1.3,ha:153.3,pl:112.0,gl:59.2},
  {n:'90th',pov:31.9,fa:22.6,ma:36.1,ta:58.7,fs:38.5,sh:0.4,ha:79.4,pl:97.5,gl:60.6},
  {n:'94th',pov:9.8,fa:20.4,ma:40.5,ta:60.9,fs:33.5,sh:0.6,ha:91.5,pl:129.7,gl:83.0},
  {n:'9th',pov:23.2,fa:24.6,ma:65.2,ta:89.8,fs:27.4,sh:0.3,ha:93.0,pl:216.3,gl:109.9},
];
const K7 = ['BU','FA','GA','GL','MU','RA','RO'];
const CC = {BU:'#394882',FA:'#e7466d',GA:'#9b9fbc',GL:'#ff7c53',MU:'#050507',RA:'#cea9be',RO:'#217ebe'};
const CL = {BU:'Burglary',FA:'Fel. Assault',GA:'Grand Larceny Auto',GL:'Grand Larceny',MU:'Murder',RA:'Rape',RO:'Robbery'};
const BC = {Bx:'#e7466d',Bk:'#394882',Mn:'#ff7c53',Qn:'#707175',SI:'#9b9fbc'};
const BL = {Bx:'Bronx',Bk:'Brooklyn',Mn:'Manhattan',Qn:'Queens',SI:'Staten Island'};

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
/* HELPERS & MINI-COMPONENTS                                          */
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

// Historic Layout Components
const SL=({children})=><div style={{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'#ff7c53',marginBottom:6,fontWeight:700}}>{children}</div>;
const H2=({children})=><h2 style={{fontSize:19,fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.01em',lineHeight:1.2}}>{children}</h2>;
const Ds=({children})=><p style={{fontSize:13,color:'#555',margin:'0 0 18px',lineHeight:1.6}}>{children}</p>;

// Icons
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
const ArrowLeft = (p) => <Icon {...p}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;
const Clock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;

/* ------------------------------------------------------------------ */
/* COMPSTAT LIVE CHARTS                                               */
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
  "How does this compare to the 1993 peak?",
  "What is the 30-year trend for murder?",
  "Which crimes correlate most strongly?",
  "Is the 78th Precinct safer than average?",
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
    const { totals, all, driver, localAnomaly, localBrightSpot } = parsedData;
    const periodStr = `${period?.week_start || ''} – ${period?.week_end || ''}`;
    const timeLabel = activeTab === 'ytd' ? 'year-to-date' : 'week-to-date';
    const geoLabel = activeGeo === 'citywide' ? 'Citywide (all of NYC)' : formatGeoName(activeGeo);

    const offenseLines = all.map(o =>
      `  ${o.name}: ${o.current.toLocaleString()} incidents (${formatPct(o.pct)} vs prior year${o.currentRate !== null ? `, ${o.currentRate.toFixed(1)}/10k residents` : ''})`
    ).join('\n');

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

    return `=== LIVE NYPD COMPSTAT DATA ===
Geography: ${geoLabel}
Timeframe: ${timeLabel} through ${periodStr}

SUMMARY TOTALS:
  Major index felonies: ${totals.mCur.toLocaleString()} (${formatPct(totals.mPct)} vs prior year's ${totals.mPri.toLocaleString()})
  Violent share: ${((totals.vCur / (totals.mCur || 1)) * 100).toFixed(0)}%
  Property share: ${((totals.pCur / (totals.mCur || 1)) * 100).toFixed(0)}%
  Murders: ${totals.murder}

ALL TRACKED OFFENSES:
${offenseLines}

${driver ? `PRIMARY DRIVER OF CHANGE: ${driver.name} accounts for ${driver.share.toFixed(0)}% of the overall shift (${formatSignedInt(driver.diff)} incidents)` : ''}
${localAnomaly ? `LOCAL ANOMALY: ${localAnomaly.name} rate (${localAnomaly.localRate.toFixed(1)}/10k) is ${localAnomaly.ratio.toFixed(1)}x the citywide average` : ''}
${localBrightSpot ? `LOCAL BRIGHT SPOT: ${localBrightSpot.name} rate (${localBrightSpot.localRate.toFixed(1)}/10k) is ${((1 - localBrightSpot.ratio) * 100).toFixed(0)}% below citywide average` : ''}${precinctTable}

=== HISTORICAL DATASETS FOR CONTEXT (1993-2025) ===
If the user asks about historical context, refer to these reference arrays:
CITYWIDE: ${JSON.stringify(CW)}
PRECINCT: ${JSON.stringify(PC)}
`;
  };

  const handleQuery = async (q) => {
    const questionText = q || query;
    if (!questionText.trim()) return;
    
    setQuery('');
    setLoading(true);
    setError('');

    const dataContext = buildContext();
    const systemPrompt = `You are a concise, plain-language crime data analyst for Vital City. You have access to BOTH current weekly/YTD CompStat data AND 30-year historical datasets (1993-2025). Answer directly and precisely — 2 to 4 sentences maximum. Cite specific numbers. When comparing precincts, use per-capita rates (per 10k residents). Never use bullet points or headers.`;

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
          system: systemPrompt,
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
        <button onClick={() => handleQuery()} disabled={loading || !query.trim()} className="flex items-center gap-2 px-5 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded disabled:opacity-30 hover:bg-gray-800 transition-colors">
          <Send size={13} /> Ask
        </button>
        {history.length > 0 && (
          <button onClick={() => { setQuery(''); setError(''); setHistory([]); }} className="flex items-center justify-center px-3 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-500 hover:text-black transition-colors" title="Start over">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.filter(q => !history.some(h => h.q === q)).slice(0, history.length > 0 ? 2 : 4).map(q => (
            <button key={q} onClick={() => { handleQuery(q); }} disabled={loading} className="text-[11px] font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:border-black hover:text-black transition-colors bg-white disabled:opacity-40">
              {q}
            </button>
          ))}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN APP WITH VIEW ROUTING                                         */
/* ------------------------------------------------------------------ */
export default function App() {
  const [appView, setAppView] = useState('live');
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

  const [sec, setSec] = useState('city');
  const [sub, setSub] = useState('dna');
  const [cY1, setCY1] = useState(1993);
  const [cY2, setCY2] = useState(2025);
  const [xM, setXM] = useState('pov');
  const [yM, setYM] = useState('ta');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/data/latest_compstat.json`;
    try {
      const resp = await fetch(`${RAW_URL}?t=${Date.now()}`);
      const json = await resp.json();
      if (json && json.citywide) { setRawData(json); return; }
    } catch (e1) {
      setFetchError(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) { setLocateMsg("Location not supported"); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://data.cityofnewyork.us/resource/78dh-3ptz.json?$where=intersects(the_geom, 'POINT(${longitude} ${latitude})')`);
        const data = await res.json();
        if (data && data.length > 0) {
          const pName = toOrdinalPrecinct(data[0].precinct);
          if (rawData[pName]) setActiveGeo(pName);
        }
      } catch (err) {}
      finally { setIsLocating(false); }
    });
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
    return Object.entries(PRECINCT_NEIGHBORHOODS).filter(([pct, hoods]) => pct.toLowerCase().includes(q) || hoods.toLowerCase().includes(q)).map(([pct, hoods]) => ({ pct, hoods }));
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

  const isTouristPrecinct = ["14th Precinct", "18th Precinct", "22nd Precinct"].includes(activeGeo);
  const activePop = GEO_POPULATIONS[activeGeo] || (activeGeo === 'citywide' ? CITYWIDE_POPULATION : null);
  const formattedMPct = typeof parsedData.totals.mPct === 'number' ? Number(Math.abs(parsedData.totals.mPct)).toFixed(1) : '0.0';

  const buildTrendCards = () => {
    const cards = [];
    const { driver, localAnomaly, localBrightSpot, topSurge, topDrop, totals } = parsedData;
    if (activeGeo === 'citywide') {
      if (driver) {
        const driverShareText = driver.diff > 0
          ? `The overall surge was largely driven by **${driver.name}** index offenses, which account for **${driver.share.toFixed(0)}%** of the total citywide upward shift.`
          : `Nearly **${driver.share.toFixed(0)}%** of the total citywide drop in major index offenses can be attributed to **${driver.name}**, which saw **${Math.abs(driver.diff).toLocaleString()} fewer cases** than last year.`;
        cards.push({ id: 'driver', icon: Target, title: 'Primary Driver', content: driverShareText });
      }
      
      const peakTotal = CW[0].BU + CW[0].FA + CW[0].GA + CW[0].GL + CW[0].MU + CW[0].RA + CW[0].RO;
      const curTotal = CW[CW.length - 1].BU + CW[CW.length - 1].FA + CW[CW.length - 1].GA + CW[CW.length - 1].GL + CW[CW.length - 1].MU + CW[CW.length - 1].RA + CW[CW.length - 1].RO;
      const overallDrop = (((peakTotal - curTotal) / peakTotal) * 100).toFixed(0);
      cards.push({ id: 'historic_drop', icon: Clock, title: '30-Year Context', content: `While current weekly shifts dominate headlines, the overall volume of major index crime remains **${overallDrop}% below** the 1993 peak (${curTotal.toLocaleString()} vs ${peakTotal.toLocaleString()} incidents annually).` });

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
      if (driver && driver.share >= 25) cards.push({ id: 'local_driver', icon: Target, title: 'Local Driver', content: `The change in **${driver.name}** volume (shifting by ${formatSignedInt(driver.diff)} incidents) accounts for **${driver.share.toFixed(0)}%** of this area's trajectory.` });
      if (localAnomaly && !isTouristPrecinct) cards.push({ id: 'anomaly', icon: AlertTriangle, title: 'Elevated Local Risk', content: `The rate for **${localAnomaly.name}** here is **${localAnomaly.localRate.toFixed(1)} per 10k residents**, which is **${localAnomaly.ratio.toFixed(1)}x** higher than the citywide average (${localAnomaly.cityRate.toFixed(1)}).` });
      else if (topSurge && topSurge.pct > 0) cards.push({ id: 'surge', icon: TrendingUp, title: 'Local Trajectory', content: `**${topSurge.name}** index offenses have increased by **${topSurge.pct.toFixed(1)}%** compared to last year.` });
      if (localBrightSpot && !isTouristPrecinct) cards.push({ id: 'brightspot', icon: ShieldCheck, title: 'Local Bright Spot', content: `The rate of **${localBrightSpot.name}** offenses here sits **${((1 - localBrightSpot.ratio)*100).toFixed(0)}% below** the citywide average.` });
      else if (topDrop && topDrop.pct < 0) cards.push({ id: 'drop', icon: TrendingDown, title: 'Local Trajectory', content: `**${topDrop.name}** index offenses have fallen by **${Math.abs(topDrop.pct).toFixed(1)}%** here compared to last year.` });
    }
    return cards;
  };

  const trendCards = buildTrendCards();
  const risingOffenses = useMemo(() => parsedData.all.filter(o => o.pct > 0).sort((a, b) => b.pct - a.pct) || [], [parsedData.all]);
  const fallingOffenses = useMemo(() => parsedData.all.filter(o => o.pct < 0).sort((a, b) => a.pct - b.pct) || [], [parsedData.all]);

  const comp = useMemo(()=>CW.map(d=>{const t=K7.reduce((s,c)=>s+d[c],0);const o={y:d.y,total:t};K7.forEach(c=>{o[c+'p']=d[c]/t*100;});return o;}),[]);
  const idx = useMemo(()=>{const b=CW[0];return CW.map(d=>{const o={y:d.y};K7.forEach(c=>{o[c]=d[c]/b[c]*100;});return o;});},[]);
  const vp = useMemo(()=>{const vC=['FA','MU','RA','RO'],pC=['BU','GA','GL'];return CW.map(d=>({y:d.y,violent:vC.reduce((s,c)=>s+d[c],0),property:pC.reduce((s,c)=>s+d[c],0)}));},[]);
  const cmpD = useMemo(()=>{const d1=CW.find(d=>d.y===cY1),d2=CW.find(d=>d.y===cY2);if(!d1||!d2)return[];return K7.map(c=>({cat:CL[c],from:d1[c],to:d2[c],diff:d2[c]-d1[c],pct:(d2[c]-d1[c])/d1[c]*100})).sort((a,b)=>a.pct-b.pct);},[cY1,cY2]);
  const assaultD = useMemo(()=>CW.filter(d=>d.y>=2000&&d.y<=2024).map(d=>{const ma=MA_CW[d.y]||0;return{y:d.y,fa:d.FA,ma,total:d.FA+ma,faPct:d.FA/(d.FA+ma)*100};}),[]);
  
  const sections = [
    {id:'city',l:'Citywide Trends',subs:[{id:'dna',l:'Crime DNA'},{id:'speed',l:'Seven Speeds'},{id:'phase',l:'Three Declines'},{id:'boro',l:'Boroughs'},{id:'cmp',l:'Compare'}]},
    {id:'assault',l:'The Assault Story',subs:[{id:'full',l:'Full Picture'},{id:'share',l:'Felony Share'},{id:'cliff',l:'The 2015 Cliff'},{id:'ratio',l:'Assault ÷ Murder'}]},
    {id:'geo',l:'Geography',subs:[{id:'scatter',l:'Explorer'},{id:'quartile',l:'Poverty Gradient'},{id:'corr',l:'Correlations'},{id:'harass',l:'Harassment'}]}
  ];
  const curSec = sections.find(s=>s.id===sec);

  // ==========================================
  // HISTORIC VIEW RENDER
  // ==========================================
  if (appView === 'historic') {
    return (
      <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",color:'#050507',background:'#fff',minHeight:'100vh'}}>
        <div style={{background:'#050507',padding:'24px 20px 18px',color:'#fff'}}>
          <div style={{maxWidth:980,margin:'0 auto'}}>
            <button onClick={() => setAppView('live')} style={{background:'none',border:'none',color:'#9b9fbc',cursor:'pointer',fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',display:'flex',alignItems:'center',gap:4,marginBottom:16,padding:0}}><ArrowLeft size={14} /> Back to Live Dashboard</button>
            <h1 style={{fontSize:26,fontWeight:900,lineHeight:1.1,margin:'0 0 8px',letterSpacing:'-0.02em'}}>NYC Crime: The 30-Year View</h1>
            <p style={{fontSize:13,color:'#9b9fbc',margin:0,lineHeight:1.45,maxWidth:640}}>Major felonies, misdemeanor assault, harassment, poverty, and precinct-level geography. What actually changed, what didn't, and what the standard narrative misses.</p>
          </div>
        </div>
        <div style={{background:'#050507',borderBottom:'2px solid #333'}}>
          <div style={{maxWidth:980,margin:'0 auto',display:'flex'}}>
            {sections.map(s=><button key={s.id} onClick={()=>{setSec(s.id);setSub(s.subs[0].id);}} style={{padding:'10px 18px',border:'none',cursor:'pointer',background:sec===s.id?'#fff':'transparent',color:sec===s.id?'#050507':'#9b9fbc',fontSize:12,fontWeight:sec===s.id?700:400,borderRadius:'4px 4px 0 0'}}>{s.l}</button>)}
          </div>
        </div>
        {curSec?.subs.length > 1 && <div style={{borderBottom:'2px solid #ddd',background:'#fff',position:'sticky',top:0,zIndex:10}}>
          <div style={{maxWidth:980,margin:'0 auto',display:'flex',overflowX:'auto'}}>
            {curSec?.subs.map(v=><button key={v.id} onClick={()=>setSub(v.id)} style={{padding:'10px 14px',border:'none',cursor:'pointer',whiteSpace:'nowrap',borderBottom:sub===v.id?'3px solid #ff7c53':'3px solid transparent',background:'none',fontSize:12,fontWeight:sub===v.id?700:400,color:sub===v.id?'#050507':'#707175'}}>{v.l}</button>)}
          </div>
        </div>}
        <div style={{maxWidth:980,margin:'0 auto',padding:'20px 20px 50px'}}>

        {sec==='city'&&sub==='dna'&&<div>
          <SL>Composition</SL><H2>The makeup of crime has transformed</H2>
          <Ds>Grand larceny + felony assault now account for 64% of all major crime, up from 30% in 1993. Burglary and auto theft went from half to a fifth.</Ds>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={comp} margin={{top:5,right:0,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="y" tick={{fontSize:10}} stroke="#999"/>
              <YAxis tick={{fontSize:10}} stroke="#999" tickFormatter={v=>`${v.toFixed(0)}%`} domain={[0,100]}/>
              <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;return <div style={{background:'#fff',border:'1px solid #ddd',padding:'6px 10px',fontSize:11,boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}><div style={{fontWeight:700,marginBottom:3}}>{label}</div>{[...payload].reverse().map((p,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:12}}><span style={{color:p.color}}>{CL[p.dataKey.replace('p','')]}</span><span style={{fontWeight:600}}>{p.value.toFixed(1)}%</span></div>)}</div>;}}/>
              {K7.map(c=><Area key={c} type="monotone" dataKey={c+'p'} stackId="1" fill={CC[c]} stroke={CC[c]} fillOpacity={0.85}/>)}
            </AreaChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px 14px',marginTop:12,justifyContent:'center'}}>{K7.map(c=><div key={c} style={{display:'flex',alignItems:'center',gap:4,fontSize:10}}><div style={{width:8,height:8,background:CC[c],borderRadius:2}}/>{CL[c]}</div>)}</div>
        </div>}

        {sec==='city'&&sub==='speed'&&<div>
          <SL>Divergence</SL><H2>Seven crimes, seven completely different trajectories</H2>
          <Ds>Indexed to 1993=100. Auto theft and burglary collapsed ~88%. Murder fell 84%. Felony assault dropped only 27% and is climbing.</Ds>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={idx} margin={{top:5,right:5,left:-10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="y" tick={{fontSize:10}} stroke="#999"/>
              <YAxis tick={{fontSize:10}} stroke="#999" domain={[0,160]}/><ReferenceLine y={100} stroke="#ccc" strokeDasharray="4 4"/>
              <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;const s=[...payload].sort((a,b)=>b.value-a.value);return <div style={{background:'#fff',border:'1px solid #ddd',padding:'6px 10px',fontSize:11,boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}><div style={{fontWeight:700,marginBottom:3}}>{label}</div>{s.map((p,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:10}}><span style={{color:p.color}}>{CL[p.dataKey]}</span><span style={{fontWeight:600}}>{Number(p.value).toFixed(0)}</span></div>)}</div>;}}/>
              {K7.map(c=><Line key={c} type="monotone" dataKey={c} stroke={CC[c]} strokeWidth={2.5} dot={false}/>)}
            </LineChart>
          </ResponsiveContainer>
        </div>}

        {sec==='city'&&sub==='phase'&&<div>
          <SL>Trajectory</SL><H2>The decline happened in three acts — and a rebound</H2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={vp.filter(d=>d.y>=2005)} margin={{top:5,right:5,left:10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="y" tick={{fontSize:10}} stroke="#999"/>
              <YAxis tick={{fontSize:10}} stroke="#999" tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;return <div style={{background:'#fff',border:'1px solid #ddd',padding:'6px 10px',fontSize:11}}><div style={{fontWeight:700}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: <strong>{p.value.toLocaleString()}</strong></div>)}</div>;}}/>
              <Line type="monotone" dataKey="violent" name="Violent" stroke="#e7466d" strokeWidth={2.5} dot={{r:2}}/>
              <Line type="monotone" dataKey="property" name="Property" stroke="#394882" strokeWidth={2.5} dot={{r:2}}/>
              <Legend wrapperStyle={{fontSize:11}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>}

        {sec==='city'&&sub==='boro'&&<div>
          <SL>Boroughs</SL><H2>The Bronx divergence</H2>
          <Ds>In 1993, Manhattan led at 769/10K. By 2025, the Bronx (210/10K) has the highest rate.</Ds>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={BP} margin={{top:5,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="y" tick={{fontSize:10}} stroke="#999"/>
              <YAxis tick={{fontSize:10}} stroke="#999" />
              <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;const s=[...payload].sort((a,b)=>b.value-a.value);return <div style={{background:'#fff',border:'1px solid #ddd',padding:'6px 10px',fontSize:11}}><div style={{fontWeight:700,marginBottom:3}}>{label}</div>{s.map((p,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:10}}><span style={{color:p.color}}>{BL[p.dataKey]||p.dataKey}</span><span style={{fontWeight:600}}>{p.value}</span></div>)}</div>;}}/>
              {Object.entries(BC).map(([k,c])=><Line key={k} type="monotone" dataKey={k} stroke={c} strokeWidth={k==='Bx'?3:2} dot={{r:2.5,fill:c}}/>)}
              <Legend formatter={v=>BL[v]||v} wrapperStyle={{fontSize:11}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>}

        {sec==='city'&&sub==='cmp'&&<div>
          <SL>Tool</SL><H2>Compare any two years</H2>
          <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap',alignItems:'flex-end'}}>
            <div><label style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',color:'#707175',display:'block',marginBottom:3}}>From</label>
              <select value={cY1} onChange={e=>setCY1(+e.target.value)} style={{padding:'4px 8px',border:'1px solid #ddd',borderRadius:4,fontSize:12}}>{CW.map(d=><option key={d.y} value={d.y}>{d.y}</option>)}</select></div>
            <div><label style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',color:'#707175',display:'block',marginBottom:3}}>To</label>
              <select value={cY2} onChange={e=>setCY2(+e.target.value)} style={{padding:'4px 8px',border:'1px solid #ddd',borderRadius:4,fontSize:12}}>{CW.map(d=><option key={d.y} value={d.y}>{d.y}</option>)}</select></div>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,marginTop:16}}>
            <thead><tr style={{borderBottom:'2px solid #050507'}}><th style={{textAlign:'left',padding:'5px 6px'}}>Crime</th><th style={{textAlign:'right',padding:'5px 6px'}}>{cY1}</th><th style={{textAlign:'right',padding:'5px 6px'}}>{cY2}</th><th style={{textAlign:'right',padding:'5px 6px'}}>%</th></tr></thead>
            <tbody>{cmpD.map((d,i)=><tr key={i} style={{borderBottom:'1px solid #eee'}}><td style={{padding:'4px 6px'}}>{d.cat}</td><td style={{padding:'4px 6px',textAlign:'right'}}>{d.from.toLocaleString()}</td><td style={{padding:'4px 6px',textAlign:'right'}}>{d.to.toLocaleString()}</td><td style={{padding:'4px 6px',textAlign:'right',fontWeight:700,color:d.pct>0?'#e7466d':'#217ebe'}}>{d.pct>0?'+':''}{d.pct.toFixed(1)}%</td></tr>)}</tbody>
          </table>
        </div>}

        {sec==='assault'&&sub==='full'&&<div>
          <SL>Volume</SL><H2>77,190 total assaults in 2024</H2>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={assaultD} margin={{top:5,right:5,left:10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="y" tick={{fontSize:10}} stroke="#999"/>
              <YAxis tick={{fontSize:10}} stroke="#999" tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0]?.payload;return <div style={{background:'#fff',border:'1px solid #ddd',padding:'6px 10px',fontSize:11}}><div style={{fontWeight:700,marginBottom:3}}>{d.y}</div><div style={{color:'#e7466d'}}>Felony: {d.fa.toLocaleString()}</div><div style={{color:'#ff7c53'}}>Misdemeanor: {d.ma.toLocaleString()}</div></div>;}}/>
              <Area type="monotone" dataKey="fa" stackId="1" fill="#e7466d" stroke="#e7466d" fillOpacity={0.85} name="Felony"/>
              <Area type="monotone" dataKey="ma" stackId="1" fill="#ff7c53" stroke="#ff7c53" fillOpacity={0.45} name="Misdemeanor"/>
              <Legend wrapperStyle={{fontSize:11}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>}

        {sec==='assault'&&sub==='share'&&<div>
          <SL>Composition</SL><H2>Felony's share of all assaults jumped</H2>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={assaultD} margin={{top:5,right:5,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="y" tick={{fontSize:10}} stroke="#999"/>
              <YAxis tick={{fontSize:10}} stroke="#999" domain={[0,100]}/>
              <Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0]?.payload;return <div style={{background:'#fff',border:'1px solid #ddd',padding:'6px 10px',fontSize:11}}><div style={{fontWeight:700}}>{d.y}</div><div style={{color:'#e7466d'}}>Felony: {d.faPct.toFixed(1)}%</div></div>;}}/>
              <Area type="monotone" dataKey="faPct" stackId="1" fill="#e7466d" stroke="#e7466d" />
              <Area type="monotone" dataKey={(d)=>100-d.faPct} stackId="1" fill="#ff7c53" stroke="#ff7c53" fillOpacity={0.35}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>}

        {sec==='assault'&&sub==='cliff'&&<div>
          <SL>Anomaly</SL><H2>The 2015 Misdemeanor Cliff</H2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={assaultD.filter(d=>d.y>=2010)} margin={{top:5,right:5,left:10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="y" tick={{fontSize:10}} stroke="#999"/>
              <YAxis tick={{fontSize:10}} stroke="#999" tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Line type="monotone" dataKey="fa" stroke="#e7466d" strokeWidth={2.5} dot={{r:2.5}} name="Felony"/>
              <Line type="monotone" dataKey="ma" stroke="#ff7c53" strokeWidth={2.5} dot={{r:2.5}} name="Misd."/>
              <ReferenceLine x={2015} stroke="#999" strokeDasharray="4 4"/><ReferenceLine x={2020} stroke="#999" strokeDasharray="4 4"/>
              <Legend wrapperStyle={{fontSize:11}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>}

        {sec==='assault'&&sub==='ratio'&&<div>
          <SL>Hidden signal</SL><H2>Ratio of assaults to murders</H2>
          {(()=>{const rd=CW.map(d=>{const ma=MA_CW[d.y]||0;return{y:d.y,faRatio:d.FA/d.MU,totalRatio:d.y>=2000&&ma>0?(d.FA+ma)/d.MU:null};});
          return <ResponsiveContainer width="100%" height={320}>
            <LineChart data={rd} margin={{top:5,right:5,left:-5,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="y" tick={{fontSize:10}} stroke="#999"/>
              <YAxis tick={{fontSize:10}} stroke="#999" />
              <Line type="monotone" dataKey="faRatio" stroke="#e7466d" strokeWidth={2.5} dot={false} name="Felony assault : murder"/>
              <Line type="monotone" dataKey="totalRatio" stroke="#ff7c53" strokeWidth={2} strokeDasharray="5 3" dot={false} name="All assault : murder"/>
              <Legend wrapperStyle={{fontSize:11}}/>
            </LineChart>
          </ResponsiveContainer>;})()}
        </div>}

        {sec==='geo'&&sub==='scatter'&&(()=>{
          const ms=[{k:'pov',l:'Poverty %'},{k:'ta',l:'Total assault'},{k:'fa',l:'Felony assault'},{k:'ma',l:'Misd. assault'},{k:'sh',l:'Shootings'},{k:'ha',l:'Harassment'},{k:'pl',l:'Petit larceny'},{k:'gl',l:'Grand larceny'},{k:'fs',l:'Felony share %'}];
          const sd=PC.filter(p=>p.n!=='14th').map(p=>({...p,x:p[xM],y:p[yM]}));
          return <div>
          <SL>Explorer</SL><H2>76 precincts: map any metric against any other</H2>
          <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap',fontSize:11}}>
            <div><label style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',color:'#707175',display:'block',marginBottom:2}}>X</label>
              <select value={xM} onChange={e=>setXM(e.target.value)} style={{padding:'3px 6px',border:'1px solid #ddd',borderRadius:4,fontSize:11}}>{ms.map(m=><option key={m.k} value={m.k}>{m.l}</option>)}</select></div>
            <div><label style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',color:'#707175',display:'block',marginBottom:2}}>Y</label>
              <select value={yM} onChange={e=>setYM(e.target.value)} style={{padding:'3px 6px',border:'1px solid #ddd',borderRadius:4,fontSize:11}}>{ms.map(m=><option key={m.k} value={m.k}>{m.l}</option>)}</select></div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{top:10,right:10,left:10,bottom:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
              <XAxis dataKey="x" type="number" tick={{fontSize:10}} stroke="#999" name={ms.find(m=>m.k===xM)?.l} />
              <YAxis dataKey="y" type="number" tick={{fontSize:10}} stroke="#999" name={ms.find(m=>m.k===yM)?.l} />
              <Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0].payload;return <div style={{background:'#fff',border:'1px solid #ddd',padding:'6px 10px',fontSize:11}}><div style={{fontWeight:700,marginBottom:3}}>{d.n} Pct</div><div>Poverty: {d.pov}%</div><div>Fel. Assault: {d.fa}/10K</div></div>;}}/>
              <Scatter data={sd} fill="#e7466d" fillOpacity={0.6} stroke="#e7466d" strokeOpacity={0.3}/>
            </ScatterChart>
          </ResponsiveContainer>
        </div>;})()}

        {sec==='geo'&&sub==='quartile'&&<div>
          <SL>Poverty gradient</SL><H2>What poverty predicts — and what it doesn't</H2>
          <div style={{overflowX:'auto'}}>
            <table style={{borderCollapse:'collapse',fontSize:11,width:'100%',minWidth:680}}>
              <thead><tr>
                <th style={{textAlign:'left',padding:'6px',borderBottom:'2px solid #050507',fontSize:10}}>Quartile</th>
                <th style={{textAlign:'center',padding:'6px',borderBottom:'2px solid #050507',fontSize:10}}>Poverty</th>
                <th style={{textAlign:'center',padding:'6px',borderBottom:'2px solid #050507',fontSize:10,color:'#e7466d'}}>Fel. Aslt</th>
                <th style={{textAlign:'center',padding:'6px',borderBottom:'2px solid #050507',fontSize:10,color:'#217ebe'}}>Grand Larc</th>
              </tr></thead>
              <tbody>{[
                {q:'Q1: Lowest',pov:'8.4%',fa:18.0,gl:65.1},
                {q:'Q2: Low-mid',pov:'13.3%',fa:40.0,gl:94.8},
                {q:'Q3: Mid-high',pov:'19.0%',fa:35.3,gl:49.2},
                {q:'Q4: Highest',pov:'30.3%',fa:60.7,gl:65.3},
              ].map((q,i)=><tr key={i} style={{borderBottom:'1px solid #eee',background:i===3?'rgba(231,70,109,0.04)':'transparent'}}>
                <td style={{padding:'6px',fontWeight:600}}>{q.q}</td>
                <td style={{textAlign:'center',padding:'6px',fontWeight:700}}>{q.pov}</td>
                <td style={{textAlign:'center',padding:'6px',fontWeight:700,color:'#e7466d'}}>{q.fa}</td>
                <td style={{textAlign:'center',padding:'6px',color:'#217ebe',fontWeight:700}}>{q.gl}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>}

        {sec==='geo'&&sub==='corr'&&<div>
          <SL>Relationships</SL><H2>Three clusters hiding in the data</H2>
          <Ds>Correlation coefficients across 76 precincts. High r = strong co-occurrence.</Ds>
          {[
            {l:'Crime × Crime (strongest pairs)',d:[
              {p:'Petit Larceny × Grand Larceny',r:0.965},{p:'Fel. Assault × Misd. Assault',r:0.929}
            ]}
          ].map((g,gi)=><div key={gi} style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>{g.l}</div>
            {g.d.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
              <div style={{width:200,fontSize:11,textAlign:'right',flexShrink:0}}>{c.p}</div>
              <div style={{flex:1,height:18,background:'#f0f0f0',borderRadius:3,position:'relative'}}><div style={{position:'absolute',left:0,top:0,height:'100%',width:`${Math.abs(c.r)*100}%`,background:c.r>0.85?'#e7466d':'#217ebe',borderRadius:3,opacity:0.7}}/></div>
              <div style={{width:45,fontSize:11,fontWeight:700,flexShrink:0,color:c.r>0?'#050507':'#217ebe'}}>{c.r>0?'+':''}{c.r.toFixed(2)}</div>
            </div>)}
          </div>)}
        </div>}

        {sec==='geo'&&sub==='harass'&&<div>
          <SL>Hidden layer</SL><H2>85,381 harassment complaints</H2>
          <Ds>Nearly 3× felony assault. It correlates with felony assault at r=0.93 — the single best predictor.</Ds>
        </div>}

        </div>
      </div>
    );
  }

  // ==========================================
  // LIVE COMPSTAT DASHBOARD RENDER
  // ==========================================
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
            Major index offenses are {parsedData.totals.diff > 0 ? 'up' : 'down'} {formattedMPct}% {activeTab === 'ytd' ? 'year-to-date' : 'this week'} vs. prior year.
          </h1>
          <p className="text-base md:text-lg font-serif text-gray-600 mb-6 max-w-3xl leading-snug">
            Violent index offenses account for <strong className="text-black">{Number((parsedData.totals.vCur / (parsedData.totals.mCur || 1)) * 100).toFixed(0)}%</strong> of the {parsedData.totals.mCur.toLocaleString()} major felonies reported {activeGeo === 'citywide' ? 'citywide' : `in the ${activeGeo}`}, while the remaining <strong className="text-black">{Number((parsedData.totals.pCur / (parsedData.totals.mCur || 1)) * 100).toFixed(0)}%</strong> are property-related.
          </p>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <div className="flex items-end gap-3">
              <span className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter leading-none">{parsedData.totals.mCur.toLocaleString()}</span>
              <div className="pb-1.5 flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Index Total</span>
                <span className={`text-base font-bold tabular-nums ${parsedData.totals.mPct > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {parsedData.totals.mPct > 0 ? '+' : (parsedData.totals.mPct < 0 ? '-' : '')}{formattedMPct}% vs {parsedData.totals.mPri.toLocaleString()} last yr
                </span>
              </div>
            </div>
            {activePop && activeGeo !== 'citywide' && !isTouristPrecinct && (
              <div className="pb-1.5 flex flex-col pl-6 border-l border-gray-200">
                <span className="text-sm font-medium text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Users size={14} /> Per 10k Residents</span>
                <span className="text-lg font-bold text-black tabular-nums">{((parsedData.totals.mCur / activePop) * 10000).toFixed(1)} incidents</span>
                <span className="text-xs font-medium text-gray-500 mt-1">Citywide: {(parsedData.totals.citywideRate || 0).toFixed(1)} per 10k</span>
              </div>
            )}
          </div>
        </section>

        <section className="mb-10 bg-[#050507] text-white p-6 md:p-8 rounded-lg flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.15em] text-[#ff7c53] mb-2 flex items-center gap-2"><Activity size={14}/> Deep Dive Analysis</div>
            <h2 className="text-2xl font-black font-serif mb-2">NYC Crime: The 30-Year View</h2>
            <p className="text-gray-300 text-sm max-w-xl leading-relaxed">We mapped 30 years of citywide trends against current precinct poverty data, harassment records, and misdemeanor metrics to find what the standard CompStat narrative misses.</p>
          </div>
          <button onClick={() => setAppView('historic')} className="whitespace-nowrap px-6 py-3 bg-[#ff7c53] hover:bg-[#e66c45] text-white text-[12px] font-black uppercase tracking-widest rounded transition-colors shadow-lg">
            Explore the Data
          </button>
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
            <div className="max-w-lg"><UnifiedMagnitudeChart data={parsedData.all} isTourist={isTouristPrecinct} citywideRates={parsedData.citywideRates} activeGeo={activeGeo} /></div>
            <div className="max-w-lg"><DivergingBarChart data={parsedData.all} /></div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(trendFilter === 'all' ? parsedData.all : (trendFilter === 'up' ? risingOffenses : fallingOffenses)).map(item => {
                  const isVolatile = item.prior < VOLATILITY_THRESHOLD;
                  return (
                    <tr key={item.name} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-3 font-bold text-sm text-black">{item.name}{isVolatile && <span className="ml-1 text-gray-400">*</span>}</td>
                      <td className={`py-3 text-right tabular-nums text-gray-500 ${isVolatile ? 'opacity-50' : ''}`}><div className="text-sm">{item.prior.toLocaleString()}</div></td>
                      <td className={`py-3 text-right tabular-nums text-black ${isVolatile ? 'opacity-50' : ''}`}>
                        <div className="text-sm font-black">{item.current.toLocaleString()}</div>
                        {item.currentRate !== null && !isTouristPrecinct && <div className="text-[10px] font-normal text-gray-500">{item.currentRate.toFixed(1)}/10k (CW: {parsedData.citywideRates[item.name]?.toFixed(1)})</div>}
                      </td>
                      <td className={`py-3 text-right text-xs font-bold tabular-nums ${item.pct > 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatPct(item.pct)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-[11px] font-serif italic text-gray-500 border-t border-gray-100 pt-4">
            * Indicates a base sample size under 30 (statistically volatile).
          </div>
        </section>
      </div>
    </div>
  );
}