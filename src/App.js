import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter } from 'recharts';
import { geoPath, geoMercator } from 'd3-geo';
import precinctGeoJSON from './data/nyc_precincts.json';
import crimeHistory from './data/crime_history.json';

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

// Multiplied by 10 to shift from /10k to /100k
const BP = [ // eslint-disable-line no-unused-vars
  {y:1993,Bx:5385,Bk:5413,Mn:7688,Qn:5168,SI:3160},
  {y:1997,Bx:3010,Bk:2877,Mn:4193,Qn:2799,SI:1670},
  {y:2001,Bx:2019,Bk:2014,Mn:2837,Qn:1702,SI:907},
  {y:2005,Bx:1715,Bk:1665,Mn:2362,Qn:1300,SI:767},
  {y:2009,Bx:1444,Bk:1308,Mn:1799,Qn:1042,SI:645},
  {y:2013,Bx:1474,Bk:1398,Mn:1735,Qn:1056,SI:726},
  {y:2017,Bx:1410,Bk:1093,Mn:1622,Qn:839,SI:588},
  {y:2019,Bx:1365,Bk:1062,Mn:1694,Qn:829,SI:510},
  {y:2021,Bx:1611,Bk:1063,Mn:1718,Qn:916,SI:524},
  {y:2023,Bx:2057,Bk:1206,Mn:2051,Qn:1161,SI:763},
  {y:2025,Bx:2104,Bk:1157,Mn:1872,Qn:1111,SI:703},
];

// Multiplied by 10 to shift from /10k to /100k
const PC = [
  {n:'100th',pov:13.9,fa:193,ma:467,ta:660,fs:29.3,sh:9,ha:1012,pl:821,gl:245},
  {n:'101st',pov:20.7,fa:493,ma:725,ta:1218,fs:40.5,sh:15,ha:1560,pl:1171,gl:244},
  {n:'102nd',pov:11.1,fa:208,ma:400,ta:608,fs:34.2,sh:2,ha:703,pl:820,gl:224},
  {n:'103rd',pov:13.8,fa:656,ma:881,ta:1537,fs:42.7,sh:8,ha:1559,pl:1749,gl:521},
  {n:'104th',pov:10.4,fa:160,ma:340,ta:500,fs:32.0,sh:2,ha:613,pl:731,gl:380},
  {n:'105th',pov:7.9,fa:114,ma:202,ta:316,fs:36.1,sh:0,ha:471,pl:348,gl:206},
  {n:'106th',pov:9.4,fa:261,ma:475,ta:736,fs:35.5,sh:4,ha:730,pl:903,gl:404},
  {n:'107th',pov:12.4,fa:157,ma:342,ta:499,fs:31.4,sh:2,ha:591,pl:639,gl:368},
  {n:'108th',pov:9.3,fa:235,ma:440,ta:675,fs:34.8,sh:1,ha:822,pl:1245,gl:638},
  {n:'109th',pov:14.2,fa:157,ma:378,ta:535,fs:29.4,sh:3,ha:600,pl:1046,gl:419},
  {n:'10th',pov:11.6,fa:287,ma:584,ta:871,fs:33.0,sh:4,ha:1073,pl:1585,gl:1155},
  {n:'110th',pov:13.9,fa:349,ma:623,ta:972,fs:35.9,sh:5,ha:669,pl:1349,gl:435},
  {n:'111th',pov:7.7,fa:100,ma:186,ta:286,fs:35.0,sh:2,ha:497,pl:432,gl:426},
  {n:'112th',pov:8.6,fa:137,ma:262,ta:399,fs:34.4,sh:1,ha:627,pl:1607,gl:348},
  {n:'113th',pov:10.7,fa:282,ma:537,ta:819,fs:34.4,sh:8,ha:915,pl:806,gl:326},
  {n:'114th',pov:12.3,fa:286,ma:493,ta:779,fs:36.7,sh:6,ha:1029,pl:1287,gl:509},
  {n:'115th',pov:14.5,fa:328,ma:662,ta:990,fs:33.1,sh:1,ha:578,pl:854,gl:449},
  {n:'120th',pov:14.6,fa:365,ma:726,ta:1091,fs:33.4,sh:8,ha:1392,pl:1000,gl:297},
  {n:'121st',pov:12.6,fa:193,ma:478,ta:671,fs:28.8,sh:1,ha:1061,pl:1032,gl:331},
  {n:'122nd',pov:8.3,fa:179,ma:263,ta:442,fs:40.4,sh:1,ha:761,pl:703,gl:290},
  {n:'123rd',pov:5.8,fa:94,ma:222,ta:316,fs:29.8,sh:0,ha:605,pl:402,gl:280},
  {n:'13th',pov:10.3,fa:305,ma:656,ta:961,fs:31.7,sh:1,ha:911,pl:3119,gl:1337},
  {n:'14th',pov:14.3,fa:2131,ma:4525,ta:6656,fs:32.0,sh:12,ha:4071,pl:16233,gl:6815},
  {n:'17th',pov:6.7,fa:127,ma:266,ta:393,fs:32.3,sh:0,ha:643,pl:1286,gl:756},
  {n:'18th',pov:11.3,fa:507,ma:1141,ta:1648,fs:30.8,sh:7,ha:1592,pl:3782,gl:2665},
  {n:'19th',pov:7.0,fa:104,ma:194,ta:298,fs:35.0,sh:0,ha:488,pl:1400,gl:802},
  {n:'1st',pov:5.5,fa:204,ma:598,ta:802,fs:25.4,sh:0,ha:874,pl:4515,gl:1589},
  {n:'20th',pov:8.6,fa:92,ma:254,ta:346,fs:26.6,sh:1,ha:636,pl:1353,gl:686},
  {n:'23rd',pov:30.6,fa:597,ma:875,ta:1472,fs:40.6,sh:17,ha:1749,pl:1297,gl:626},
  {n:'24th',pov:12.4,fa:175,ma:330,ta:505,fs:34.7,sh:3,ha:654,pl:1611,gl:489},
  {n:'25th',pov:34.1,fa:700,ma:1288,ta:1988,fs:35.2,sh:13,ha:2201,pl:1573,gl:771},
  {n:'26th',pov:25.5,fa:326,ma:511,ta:837,fs:39.0,sh:10,ha:1069,pl:890,gl:757},
  {n:'28th',pov:20.5,fa:473,ma:879,ta:1352,fs:35.0,sh:17,ha:1450,pl:2766,gl:792},
  {n:'30th',pov:22.4,fa:259,ma:595,ta:854,fs:30.3,sh:3,ha:1229,pl:1127,gl:547},
  {n:'32nd',pov:25.5,fa:566,ma:879,ta:1445,fs:39.2,sh:21,ha:1852,pl:1183,gl:482},
  {n:'33rd',pov:21.0,fa:315,ma:466,ta:781,fs:40.3,sh:5,ha:780,pl:1007,gl:445},
  {n:'34th',pov:15.1,fa:265,ma:526,ta:791,fs:33.5,sh:7,ha:622,pl:1161,gl:484},
  {n:'40th',pov:39.0,fa:1024,ma:1312,ta:2336,fs:43.8,sh:28,ha:2219,pl:1947,gl:950},
  {n:'41st',pov:31.4,fa:997,ma:1243,ta:2240,fs:44.5,sh:21,ha:1977,pl:1485,gl:653},
  {n:'42nd',pov:36.1,fa:907,ma:1124,ta:2031,fs:44.7,sh:34,ha:2376,pl:1351,gl:667},
  {n:'43rd',pov:26.0,fa:456,ma:672,ta:1128,fs:40.4,sh:18,ha:1118,pl:1165,gl:613},
  {n:'44th',pov:33.1,fa:665,ma:908,ta:1573,fs:42.3,sh:17,ha:1388,pl:1162,gl:500},
  {n:'45th',pov:14.4,fa:292,ma:473,ta:765,fs:38.2,sh:9,ha:960,pl:1037,gl:626},
  {n:'46th',pov:33.8,fa:671,ma:873,ta:1544,fs:43.4,sh:17,ha:1180,pl:727,gl:498},
  {n:'47th',pov:19.4,fa:620,ma:804,ta:1424,fs:43.5,sh:19,ha:1244,pl:905,gl:609},
  {n:'48th',pov:38.9,fa:844,ma:1277,ta:2121,fs:39.8,sh:32,ha:2074,pl:1545,gl:702},
  {n:'49th',pov:17.5,fa:460,ma:590,ta:1050,fs:43.8,sh:7,ha:1161,pl:1527,gl:687},
  {n:'50th',pov:16.8,fa:216,ma:392,ta:608,fs:35.5,sh:7,ha:923,pl:1077,gl:533},
  {n:'52nd',pov:26.3,fa:664,ma:714,ta:1378,fs:48.2,sh:10,ha:1169,pl:1228,gl:637},
  {n:'5th',pov:23.3,fa:645,ma:946,ta:1591,fs:40.5,sh:2,ha:1346,pl:2694,gl:1542},
  {n:'60th',pov:25.3,fa:414,ma:797,ta:1211,fs:34.2,sh:10,ha:1038,pl:991,gl:406},
  {n:'61st',pov:15.3,fa:181,ma:336,ta:517,fs:34.9,sh:3,ha:539,pl:681,gl:348},
  {n:'62nd',pov:18.4,fa:129,ma:377,ta:506,fs:25.5,sh:1,ha:538,pl:784,gl:309},
  {n:'63rd',pov:10.0,fa:145,ma:321,ta:466,fs:31.1,sh:5,ha:878,pl:1182,gl:461},
  {n:'66th',pov:25.0,fa:118,ma:227,ta:345,fs:34.2,sh:0,ha:388,pl:503,gl:244},
  {n:'67th',pov:14.8,fa:483,ma:638,ta:1121,fs:43.1,sh:19,ha:1694,pl:766,gl:448},
  {n:'68th',pov:14.1,fa:114,ma:333,ta:447,fs:25.6,sh:0,ha:496,pl:753,gl:292},
  {n:'69th',pov:13.1,fa:271,ma:413,ta:684,fs:39.6,sh:12,ha:1018,pl:642,gl:337},
  {n:'6th',pov:6.8,fa:259,ma:628,ta:887,fs:29.2,sh:5,ha:652,pl:2578,gl:1841},
  {n:'70th',pov:15.3,fa:268,ma:426,ta:694,fs:38.7,sh:7,ha:693,pl:891,gl:286},
  {n:'71st',pov:18.2,fa:425,ma:555,ta:980,fs:43.3,sh:11,ha:1070,pl:930,gl:330},
  {n:'72nd',pov:17.0,fa:236,ma:470,ta:706,fs:33.4,sh:3,ha:458,pl:596,gl:293},
  {n:'73rd',pov:33.1,fa:884,ma:1195,ta:2079,fs:42.5,sh:36,ha:2036,pl:1371,gl:520},
  {n:'75th',pov:23.2,fa:526,ma:784,ta:1310,fs:40.1,sh:18,ha:1530,pl:1284,gl:452},
  {n:'76th',pov:13.4,fa:232,ma:421,ta:653,fs:35.5,sh:6,ha:830,pl:913,gl:403},
  {n:'77th',pov:18.1,fa:455,ma:481,ta:936,fs:48.6,sh:14,ha:1161,pl:845,gl:447},
  {n:'78th',pov:5.8,fa:208,ma:342,ta:550,fs:37.8,sh:7,ha:620,pl:1612,gl:537},
  {n:'79th',pov:27.8,fa:443,ma:573,ta:1016,fs:43.6,sh:15,ha:1274,pl:1346,gl:418},
  {n:'7th',pov:28.1,fa:385,ma:794,ta:1179,fs:32.7,sh:9,ha:1337,pl:2405,gl:814},
  {n:'81st',pov:22.0,fa:318,ma:636,ta:954,fs:33.3,sh:17,ha:1064,pl:963,gl:388},
  {n:'83rd',pov:22.2,fa:340,ma:728,ta:1068,fs:31.8,sh:11,ha:868,pl:927,gl:616},
  {n:'84th',pov:11.6,fa:595,ma:617,ta:1212,fs:49.1,sh:6,ha:1403,pl:2564,gl:1062},
  {n:'88th',pov:14.3,fa:317,ma:655,ta:972,fs:32.6,sh:13,ha:1533,pl:1120,gl:592},
  {n:'90th',pov:31.9,fa:226,ma:361,ta:587,fs:38.5,sh:4,ha:794,pl:975,gl:606},
  {n:'94th',pov:9.8,fa:204,ma:405,ta:609,fs:33.5,sh:6,ha:915,pl:1297,gl:830},
  {n:'9th',pov:23.2,fa:246,ma:652,ta:898,fs:27.4,sh:3,ha:930,pl:2163,gl:1099},
];
const K7 = ['BU','FA','GA','GL','MU','RA','RO'];
const CC = {BU:'#394882',FA:'#e7466d',GA:'#9b9fbc',GL:'#ff7c53',MU:'#050507',RA:'#cea9be',RO:'#217ebe'};
const CL = {BU:'Burglary',FA:'Fel. Assault',GA:'Grand Larceny Auto',GL:'Grand Larceny',MU:'Murder',RA:'Rape',RO:'Robbery'};
const BC = {Bx:'#e7466d',Bk:'#394882',Mn:'#ff7c53',Qn:'#707175',SI:'#9b9fbc'}; // eslint-disable-line no-unused-vars
const BL = {Bx:'Bronx',Bk:'Brooklyn',Mn:'Manhattan',Qn:'Queens',SI:'Staten Island'}; // eslint-disable-line no-unused-vars

const GITHUB_USER = "joshgreenman1973";
const REPO_NAME = "nypd-compstat-scraper";
const CITYWIDE_POPULATION = 8804190; // 2020 Census
const VOLATILITY_THRESHOLD = 30;

const VC = {
  black: "#050507", white: "#fff", cloud: "#ddd", orange: "#ff7c53",
  periwinkle: "#9b9fbc", magenta: "#e7466d", charcoal: "#707175",
  indigo: "#394882", cerulean: "#217ebe", green: "#57aa4a"
};

const VIOLENT_CRIMES = ["Murder", "Rape", "Robbery", "Fel. Assault", "Misd. Assault", "Shooting Inc.", "Shooting Vic.", "Hate Crimes"];
const PROPERTY_CRIMES = ["Burglary", "Gr. Larceny", "G.L.A.", "Petit Larceny", "Retail Theft"];
const TOURIST_PRECINCTS = ["14th Precinct", "18th Precinct", "22nd Precinct"];

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

// 2020 Census populations via John Keefe's census-by-precincts crosswalk
// (github.com/jkeefe/census-by-precincts). Patrol borough totals = sum of constituent precincts.
const GEO_POPULATIONS = {
  "1st Precinct": 84799, "5th Precinct": 50598, "6th Precinct": 64643, "7th Precinct": 57985, "9th Precinct": 75951,
  "10th Precinct": 65570, "13th Precinct": 100050, "14th Precinct": 28050, "17th Precinct": 89367, "18th Precinct": 67528,
  "19th Precinct": 220261, "20th Precinct": 114575, "22nd Precinct": 129,
  "23rd Precinct": 74769, "24th Precinct": 107489, "25th Precinct": 50996, "26th Precinct": 50002, "28th Precinct": 49200,
  "30th Precinct": 60456, "32nd Precinct": 81240, "33rd Precinct": 71598, "34th Precinct": 108608,
  "40th Precinct": 100929, "41st Precinct": 54454, "42nd Precinct": 93755, "43rd Precinct": 188015, "44th Precinct": 150436,
  "45th Precinct": 130799, "46th Precinct": 132584, "47th Precinct": 163539, "48th Precinct": 89216, "49th Precinct": 119881,
  "50th Precinct": 106976, "52nd Precinct": 146888,
  "60th Precinct": 109024, "61st Precinct": 169513, "62nd Precinct": 198870, "63rd Precinct": 112652, "66th Precinct": 205377,
  "67th Precinct": 162446, "68th Precinct": 136071, "69th Precinct": 90763, "70th Precinct": 164568, "71st Precinct": 102000,
  "72nd Precinct": 133230, "73rd Precinct": 98506, "75th Precinct": 200994, "76th Precinct": 47789, "77th Precinct": 101267,
  "78th Precinct": 73203, "79th Precinct": 106039, "81st Precinct": 68921, "83rd Precinct": 120747, "84th Precinct": 65597,
  "88th Precinct": 64372, "90th Precinct": 131377, "94th Precinct": 72748,
  "100th Precinct": 50809, "101st Precinct": 73376,
  "102nd Precinct": 153297, "103rd Precinct": 121059, "104th Precinct": 178948, "105th Precinct": 199218, "106th Precinct": 129391,
  "107th Precinct": 161402, "108th Precinct": 137962, "109th Precinct": 269581, "110th Precinct": 181051, "111th Precinct": 122211,
  "112th Precinct": 119739, "113th Precinct": 135221, "114th Precinct": 208525, "115th Precinct": 179134,
  "120th Precinct": 122308, "121st Precinct": 128149, "122nd Precinct": 144552, "123rd Precinct": 100738,
  "Bronx": 1477472, "Brooklyn South": 1705506, "Brooklyn North": 1030568, "Manhattan South": 684541, "Manhattan North": 989323, "Queens South": 1023773, "Queens North": 1397151, "Staten Island": 495747
};

// 2010 Census populations mapped to 2020 precinct boundaries (John Keefe's crosswalk).
// Used for precinct-level rate calculations on data from 2010–2019.
const GEO_POPULATIONS_2010 = { // eslint-disable-line no-unused-vars
  "1st Precinct": 66679, "5th Precinct": 52568, "6th Precinct": 62226, "7th Precinct": 56355, "9th Precinct": 76443,
  "10th Precinct": 50180, "13th Precinct": 93640, "14th Precinct": 20651, "17th Precinct": 79126, "18th Precinct": 54066,
  "19th Precinct": 208259, "20th Precinct": 102624, "22nd Precinct": 25,
  "23rd Precinct": 73106, "24th Precinct": 106460, "25th Precinct": 47405, "26th Precinct": 49508, "28th Precinct": 44781,
  "30th Precinct": 60685, "32nd Precinct": 70942, "33rd Precinct": 76958, "34th Precinct": 113062,
  "40th Precinct": 91497, "41st Precinct": 52246, "42nd Precinct": 79762, "43rd Precinct": 172122, "44th Precinct": 146441,
  "45th Precinct": 120833, "46th Precinct": 128200, "47th Precinct": 152374, "48th Precinct": 83266, "49th Precinct": 114712,
  "50th Precinct": 101720, "52nd Precinct": 139307,
  "60th Precinct": 104278, "61st Precinct": 159645, "62nd Precinct": 181981, "63rd Precinct": 108646, "66th Precinct": 191382,
  "67th Precinct": 155252, "68th Precinct": 124491, "69th Precinct": 84480, "70th Precinct": 160664, "71st Precinct": 98429,
  "72nd Precinct": 126230, "73rd Precinct": 86468, "75th Precinct": 183328, "76th Precinct": 43694, "77th Precinct": 90744,
  "78th Precinct": 66664, "79th Precinct": 90263, "81st Precinct": 62722, "83rd Precinct": 112634, "84th Precinct": 48196,
  "88th Precinct": 51421, "90th Precinct": 116836, "94th Precinct": 56247,
  "100th Precinct": 47913, "101st Precinct": 67065,
  "102nd Precinct": 144215, "103rd Precinct": 105803, "104th Precinct": 170190, "105th Precinct": 188582, "106th Precinct": 122441,
  "107th Precinct": 151107, "108th Precinct": 113200, "109th Precinct": 247354, "110th Precinct": 172634, "111th Precinct": 116431,
  "112th Precinct": 112070, "113th Precinct": 120132, "114th Precinct": 202766, "115th Precinct": 171576,
  "120th Precinct": 113008, "121st Precinct": 118708, "122nd Precinct": 138982, "123rd Precinct": 98032,
  "Bronx": 1382480, "Brooklyn South": 2056639, "Brooklyn North": 448056, "Manhattan South": 611934, "Manhattan North": 953815, "Queens South": 796151, "Queens North": 1457328, "Staten Island": 468730
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

// Icons
const Icon = ({ children, size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);
const RefreshCw = (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></Icon>;
const TrendingUp = (p) => <Icon {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>;
const TrendingDown = (p) => <Icon {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></Icon>;
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

/* ------------------------------------------------------------------ */
/* CITY COMPARISON — Real-Time Crime Index (AH Datalytics)             */
/* 12-month rolling totals per 100k residents, through Dec 2025        */
/* Source: realtimecrimeindex.com  •  final_sample.csv                 */
/* ------------------------------------------------------------------ */
const RTCI_CITIES = [
  { city: 'New York',     pop: 8184044, murder: 305, violent: 47211, property: 74331, isNYC: true },
  { city: 'Los Angeles',  pop: 3786018, murder: 225, violent: 25854, property: 86495 },
  { city: 'Chicago',      pop: 2628298, murder: 424, violent: 21595, property: 72438 },
  { city: 'Houston',      pop: 2304406, murder: 270, violent: 21219, property: 91409 },
  { city: 'Philadelphia', pop: 1550843, murder: 221, violent: 12772, property: 67170 },
];
const RTCI_PERIOD = 'Dec 2025';
const RTCI_UPDATED = '2026-02-17';
const rtciRate = (count, pop) => +((count / pop) * 100000).toFixed(1);

// Sequential color scale for choropleth: light neutral → orange → magenta
const CHOROPLETH_STOPS = [
  [0.0, [240, 240, 240]],
  [0.25, [255, 213, 189]],
  [0.5, [255, 124, 83]],
  [0.75, [231, 70, 109]],
  [1.0, [57, 72, 130]],
];
const crimeColor = (rate, min, max) => {
  if (rate == null) return '#e5e5e5';
  const t = Math.min(1, Math.max(0, (rate - min) / (max - min || 1)));
  let lo = CHOROPLETH_STOPS[0], hi = CHOROPLETH_STOPS[CHOROPLETH_STOPS.length - 1];
  for (let i = 0; i < CHOROPLETH_STOPS.length - 1; i++) {
    if (t >= CHOROPLETH_STOPS[i][0] && t <= CHOROPLETH_STOPS[i + 1][0]) { lo = CHOROPLETH_STOPS[i]; hi = CHOROPLETH_STOPS[i + 1]; break; }
  }
  const s = (t - lo[0]) / (hi[0] - lo[0] || 1);
  const r = Math.round(lo[1][0] + s * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + s * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + s * (hi[1][2] - lo[1][2]));
  return `rgb(${r},${g},${b})`;
};

/* ------------------------------------------------------------------ */
/* MINI SPARKLINE                                                      */
/* ------------------------------------------------------------------ */
const MiniSparkline = ({ points, width = 48, height = 16, minY }) => {
  if (!points || points.length < 2) return null;
  const min = minY !== undefined ? minY : Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pad = 2;
  const coords = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const trending = points[points.length - 1] > points[0];
  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <polyline points={coords} fill="none" stroke={trending ? VC.orange : VC.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={parseFloat(coords.split(' ').pop().split(',')[0])} cy={parseFloat(coords.split(' ').pop().split(',')[1])} r="2" fill={trending ? VC.orange : VC.green} />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* CITY COMPARISON WIDGET                                              */
/* ------------------------------------------------------------------ */
const CityComparisonWidget = () => {
  const metrics = [
    { key: 'murder', label: 'Murder', unit: 'per 100k' },
    { key: 'violent', label: 'Violent Crime', unit: 'per 100k' },
    { key: 'property', label: 'Property Crime', unit: 'per 100k' },
  ];
  const [activeMetric, setActiveMetric] = useState('murder');
  const metric = metrics.find(m => m.key === activeMetric);
  const ranked = RTCI_CITIES.map(c => ({ ...c, rate: rtciRate(c[activeMetric], c.pop) }))
    .sort((a, b) => a.rate - b.rate);
  const maxRate = ranked[ranked.length - 1].rate;

  return (
    <section className="mb-10 p-6 bg-gray-50 rounded-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">How NYC Compares</h3>
          <p className="text-[13px] font-serif text-gray-600 mt-0.5">12-month rolling {metric.label.toLowerCase()} rate {metric.unit}, five largest U.S. cities</p>
        </div>
        <div className="flex bg-white p-1 rounded border border-gray-200">
          {metrics.map(m => (
            <button key={m.key} onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-wide ${activeMetric === m.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2.5">
        {ranked.map(c => {
          const barW = maxRate > 0 ? (c.rate / maxRate) * 100 : 0;
          const isNYC = c.isNYC;
          return (
            <div key={c.city} className="flex items-center gap-3">
              <span className={`w-24 text-right text-[12px] ${isNYC ? 'font-black text-gray-900' : 'font-medium text-gray-500'}`}>
                {c.city}
              </span>
              <div className="flex-1 h-5 bg-gray-200 rounded-sm overflow-hidden relative">
                <div className={`h-full rounded-sm ${isNYC ? 'bg-gray-900' : 'bg-gray-400'}`}
                  style={{ width: `${barW}%` }} />
              </div>
              <span className={`w-16 text-[12px] tabular-nums ${isNYC ? 'font-black text-gray-900' : 'font-medium text-gray-500'}`}>
                {c.rate.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <p className="text-[10px] text-gray-400">
          Data through {RTCI_PERIOD} · Updated {RTCI_UPDATED} · UCR Part I offenses · FBI population estimates
        </p>
        <a href="https://realtimecrimeindex.com/" target="_blank" rel="noopener noreferrer"
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline whitespace-nowrap">
          Source: Real-Time Crime Index by AH Datalytics ↗
        </a>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* PRECINCT CHOROPLETH MAP                                             */
/* ------------------------------------------------------------------ */
const PrecinctMap = ({ precinctRates, onSelect, activeGeo, width = 520, height = 520 }) => {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const { pathFn, rateMap, minRate, maxRate } = useMemo(() => {
    const projection = geoMercator().fitSize([width, height], precinctGeoJSON);
    const pathFn = geoPath().projection(projection);
    const rateMap = {};
    let minR = Infinity, maxR = 0;
    precinctRates.forEach(p => {
      rateMap[p.precinctNum] = p;
      if (p.rate != null && !p.isTourist) {
        if (p.rate < minR) minR = p.rate;
        if (p.rate > maxR) maxR = p.rate;
      }
    });
    if (minR === Infinity) minR = 0;
    return { pathFn, rateMap, minRate: minR, maxRate: maxR };
  }, [precinctRates, width, height]);

  const handleMouse = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const hoveredData = hovered ? rateMap[hovered] : null;

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseMove={handleMouse}>
        <defs>
          <pattern id="tourist-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#999" strokeWidth="1.5" />
          </pattern>
        </defs>
        {precinctGeoJSON.features.map(feature => {
          const pNum = feature.properties.precinct;
          const pData = rateMap[pNum];
          const fill = pData?.isTourist ? '#e5e5e5' : crimeColor(pData?.rate, minRate, maxRate);
          return (
            <g key={pNum}>
              <path
                d={pathFn(feature)}
                fill={fill}
                stroke="#fff"
                strokeWidth={hovered === pNum ? 2 : 0.5}
                style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                onMouseEnter={() => setHovered(pNum)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => pData && onSelect(pData.precinct)}
              />
              {pData?.isTourist && (
                <path d={pathFn(feature)} fill="url(#tourist-hatch)" stroke="none" pointerEvents="none" />
              )}
            </g>
          );
        })}
      </svg>
      {hoveredData && (
        <div
          className="absolute pointer-events-none bg-white border border-gray-200 shadow-xl rounded p-3 z-50 text-[11px]"
          style={{ left: Math.min(mousePos.x + 12, width - 180), top: mousePos.y - 10 }}
        >
          <div className="font-black text-black text-[12px] mb-1">{hoveredData.precinct}</div>
          {PRECINCT_NEIGHBORHOODS[hoveredData.precinct] && <div className="text-gray-500 mb-2">{PRECINCT_NEIGHBORHOODS[hoveredData.precinct]}</div>}
          {hoveredData.isTourist ? (
            <div className="text-gray-500 italic">Tourist/commercial hub — rates not comparable</div>
          ) : (
            <>
              <div className="font-bold text-black">{hoveredData.count.toLocaleString()} incidents</div>
              {hoveredData.rate != null && <div className="text-gray-600">{hoveredData.rate.toFixed(1)} per 100k</div>}
            </>
          )}
        </div>
      )}
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500">
        <span>Low</span>
        <div className="flex-1 h-2 rounded" style={{ background: `linear-gradient(to right, rgb(240,240,240), rgb(255,213,189), rgb(255,124,83), rgb(231,70,109), rgb(57,72,130))` }} />
        <span>High</span>
        <span className="ml-3 pl-3 border-l border-gray-300 flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-gray-200" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #999 2px, #999 3px)' }} />
          Tourist
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* PRECINCT RANKING BARS                                               */
/* ------------------------------------------------------------------ */
const PrecinctRankingBars = ({ precinctRates, onSelect }) => {
  const { top5, bottom5 } = useMemo(() => {
    const valid = precinctRates.filter(p => p.rate != null && !p.isTourist).sort((a, b) => b.rate - a.rate);
    return { top5: valid.slice(0, 5), bottom5: valid.slice(-5).reverse() };
  }, [precinctRates]);

  const maxRate = top5[0]?.rate || 1;

  const renderBar = (item, color, maxW) => {
    const barW = Math.max(4, (item.rate / maxRate) * maxW);
    const hood = PRECINCT_NEIGHBORHOODS[item.precinct];
    const label = hood ? `${item.precinct.replace(' Precinct', '')} (${hood.split(',')[0]})` : item.precinct.replace(' Precinct', '');
    return (
      <div key={item.precinct} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded transition-colors" onClick={() => onSelect(item.precinct)}>
        <span className="text-[11px] font-bold text-gray-800 w-28 truncate flex-shrink-0" title={item.precinct}>{label}</span>
        <div className="flex-1 flex items-center gap-2">
          <div className="h-4 rounded-sm" style={{ width: `${(barW / maxW) * 100}%`, minWidth: 4, background: color }} />
          <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{item.rate.toFixed(0)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1" style={{ color: VC.magenta }}>
          <TrendingUp size={12} /> Highest Rate (per 100k)
        </div>
        {top5.map(item => renderBar(item, VC.magenta, 200))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1" style={{ color: VC.green }}>
          <TrendingDown size={12} /> Lowest Rate (per 100k)
        </div>
        {bottom5.map(item => renderBar(item, VC.green, 200))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* COMPSTAT LIVE CHARTS                                               */
/* ------------------------------------------------------------------ */
const DivergingBarChart = ({ data, vsLabel }) => {
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
        <span>Trajectory (% Change vs {vsLabel || 'Prior Yr'})</span>
      </div>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${totalHeight}`} className="w-full h-auto">
        <rect x={CENTER_X} y="0" width={CENTER_X + MAX_BAR_WIDTH} height={totalHeight} fill="#fff7ed" fillOpacity="0.35" />
        <rect x="0" y="0" width={CENTER_X} height={totalHeight} fill="#f0fdf4" fillOpacity="0.4" />
        <line x1={CENTER_X} y1="0" x2={CENTER_X} y2={totalHeight} stroke="#d1d5db" strokeWidth="1" />
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

const UnifiedMagnitudeChart = ({ data, isTourist, citywideRates, activeGeo, periodLabel }) => {
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
        <span>Incident Volume{periodLabel && <span className="text-gray-300 ml-2 normal-case tracking-normal font-medium">({periodLabel})</span>}</span>
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
                  <tspan fontSize="11" fill={VC.charcoal} fontWeight="normal">{' '}({row.currentRate.toFixed(1)}/100k{activeGeo !== 'citywide' && citywideRates[row.name] !== undefined ? ` vs ${citywideRates[row.name].toFixed(1)} CW` : ''})</tspan>
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

const QueryBox = ({ parsedData, activeGeo, activeTab, period, rawData, priorYear: priorYearProp }) => {
  const priorYear = priorYearProp || new Date().getFullYear() - 1;
  const currentYear = priorYear + 1;
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

  // Extract numbers for BOTH YTD and weekly views from raw stats
  const extractBoth = (stats) => {
    const ytdCur = safeNum(stats?.year_to_date?.current_year);
    const ytdPri = safeNum(stats?.year_to_date?.prior_year);
    const ytdPct = stats?.year_to_date?.pct_change;
    const wtdCur = safeNum(stats?.week_to_date?.current_year);
    const wtdPri = safeNum(stats?.week_to_date?.prior_year);
    const wtdPct = stats?.week_to_date?.pct_change;
    const d28Cur = safeNum(stats?.twenty_eight_day?.current_year);
    const d28Pri = safeNum(stats?.twenty_eight_day?.prior_year);
    const d28Pct = stats?.twenty_eight_day?.pct_change;
    const hist2 = stats?.historical?.['2_yr_pct'];
    const hist14 = stats?.historical?.['14_yr_pct'];
    const hist31 = stats?.historical?.['31_yr_pct'];
    return { ytdCur, ytdPri, ytdPct, wtdCur, wtdPri, wtdPct, d28Cur, d28Pri, d28Pct, hist2, hist14, hist31 };
  };

  const buildContext = () => {
    const geoData = rawData?.[activeGeo] || rawData?.['citywide'] || {};
    const periodStr = `${period?.week_start || ''} – ${period?.week_end || ''}`;
    const geoLabel = activeGeo === 'citywide' ? 'Citywide (all of NYC)' : formatGeoName(activeGeo);
    const pop = activeGeo === 'citywide' ? CITYWIDE_POPULATION : (GEO_POPULATIONS[activeGeo] || null);

    // Build offense lines with BOTH YTD and weekly data
    const felonies = geoData.seven_major_felonies || {};
    const addl = geoData.additional_stats || {};
    const allCrimes = { ...felonies, ...addl };

    const offenseLines = Object.entries(allCrimes).map(([name, stats]) => {
      const b = extractBoth(stats);
      const rateSuffix = pop ? ` (${((b.ytdCur / pop) * 100000).toFixed(1)}/100k)` : '';
      const histParts = [];
      if (b.hist2 != null) histParts.push(`2yr: ${formatPct(b.hist2)}`);
      if (b.hist14 != null) histParts.push(`14yr: ${formatPct(b.hist14)}`);
      if (b.hist31 != null) histParts.push(`31yr: ${formatPct(b.hist31)}`);
      const histSuffix = histParts.length > 0 ? ` | Long-term: ${histParts.join(', ')}` : '';
      return `  ${name}: YTD ${b.ytdCur.toLocaleString()} vs ${b.ytdPri.toLocaleString()} (${formatPct(b.ytdPct)})${rateSuffix} | Week ${b.wtdCur.toLocaleString()} vs ${b.wtdPri.toLocaleString()} (${formatPct(b.wtdPct)}) | 28-day ${b.d28Cur.toLocaleString()} vs ${b.d28Pri.toLocaleString()} (${formatPct(b.d28Pct)})${histSuffix}`;
    }).join('\n');

    // Compute summary totals for both views
    const felonyEntries = Object.entries(felonies);
    let ytdMCur = 0, ytdMPri = 0, wtdMCur = 0, wtdMPri = 0;
    let ytdVCur = 0, ytdVPri = 0, ytdPCur = 0, ytdPPri = 0, wtdVCur = 0, wtdPCur = 0;
    let ytdMurder = 0, wtdMurder = 0, ytdMurderPri = 0;
    let ytdShootingVic = 0, wtdShootingVic = 0;
    const perOffenseYtdShares = [];
    const perOffenseWtdChanges = [];
    felonyEntries.forEach(([name, stats]) => {
      const b = extractBoth(stats);
      ytdMCur += b.ytdCur; ytdMPri += b.ytdPri;
      wtdMCur += b.wtdCur; wtdMPri += b.wtdPri;
      if (name === 'Murder') { ytdMurder = b.ytdCur; wtdMurder = b.wtdCur; ytdMurderPri = b.ytdPri; }
      if (VIOLENT_CRIMES.includes(name)) { ytdVCur += b.ytdCur; ytdVPri += b.ytdPri; wtdVCur += b.wtdCur; }
      if (PROPERTY_CRIMES.includes(name)) { ytdPCur += b.ytdCur; ytdPPri += b.ytdPri; wtdPCur += b.wtdCur; }
      perOffenseYtdShares.push({ name, cur: b.ytdCur, pri: b.ytdPri });
      perOffenseWtdChanges.push({ name, cur: b.wtdCur, pri: b.wtdPri });
    });
    Object.entries(addl).forEach(([name, stats]) => {
      const b = extractBoth(stats);
      if (name === 'Shooting Vic.') { ytdShootingVic = b.ytdCur; wtdShootingVic = b.wtdCur; }
    });

    // Pre-compute derived ratios so the model doesn't have to do math
    const ytdTotalPct = formatPct(calcPct(ytdMCur, ytdMPri));
    const wtdTotalPct = formatPct(calcPct(wtdMCur, wtdMPri));
    const ytdViolentPct = ((ytdVCur / (ytdMCur || 1)) * 100).toFixed(1);
    const ytdPropertyPct = ((ytdPCur / (ytdMCur || 1)) * 100).toFixed(1);
    const ytdViolentChangePct = formatPct(calcPct(ytdVCur, ytdVPri));
    const ytdPropertyChangePct = formatPct(calcPct(ytdPCur, ytdPPri));
    const perOffenseYtdLines = perOffenseYtdShares.map(o => {
      const share = ((o.cur / (ytdMCur || 1)) * 100).toFixed(1);
      const chg = formatPct(calcPct(o.cur, o.pri));
      return `  ${o.name}: ${share}% of total (${o.cur.toLocaleString()} incidents, ${chg} vs ${priorYear})`;
    }).join('\n');
    const perOffenseWtdLines = perOffenseWtdChanges.map(o => {
      const chg = formatPct(calcPct(o.cur, o.pri));
      return `  ${o.name}: ${o.cur.toLocaleString()} vs ${o.pri.toLocaleString()} (${chg})`;
    }).join('\n');

    // Primary driver (YTD) — among 7 major index felonies only
    const ytdDiff = ytdMCur - ytdMPri;
    let driverLine = '';
    if (ytdDiff !== 0) {
      let driverName = '', driverDiff = 0;
      felonyEntries.forEach(([name, stats]) => {
        const b = extractBoth(stats);
        const d = b.ytdCur - b.ytdPri;
        if (Math.abs(d) > Math.abs(driverDiff) && Math.sign(d) === Math.sign(ytdDiff)) { driverName = name; driverDiff = d; }
      });
      if (driverName) driverLine = `PRIMARY DRIVER OF INDEX CRIME CHANGE (YTD, among 7 major index felonies): ${driverName} accounts for ${Math.abs((driverDiff / ytdDiff) * 100).toFixed(0)}% of the overall index shift (${driverDiff > 0 ? '+' : ''}${driverDiff.toLocaleString()} incidents, from ${(safeNum(felonies[driverName]?.year_to_date?.prior_year)).toLocaleString()} to ${(safeNum(felonies[driverName]?.year_to_date?.current_year)).toLocaleString()})`;
    }

    // Lethality gap
    const lethalityLine = ytdMurder > 0 ? `LETHALITY GAP: For every 1 homicide, there were ${(ytdShootingVic / ytdMurder).toFixed(1)} shooting victims YTD (${ytdShootingVic} victims / ${ytdMurder} murders)` : '';

    // Pre-compute superlatives across ALL tracked offenses (not just 7 major)
    const allCrimeEntries = Object.entries(allCrimes);
    const allYtdChanges = allCrimeEntries.map(([name, stats]) => {
      const b = extractBoth(stats);
      const pctChg = b.ytdPri > 0 ? ((b.ytdCur - b.ytdPri) / b.ytdPri) * 100 : null;
      return { name, ytdCur: b.ytdCur, ytdPri: b.ytdPri, diff: b.ytdCur - b.ytdPri, pctChg };
    }).filter(o => o.pctChg !== null && o.ytdPri >= 10); // only count offenses with meaningful prior-year volume
    const sortedByPctUp = [...allYtdChanges].sort((a, b) => (b.pctChg || 0) - (a.pctChg || 0));
    const sortedByPctDown = [...allYtdChanges].sort((a, b) => (a.pctChg || 0) - (b.pctChg || 0));
    const sortedByRawDown = [...allYtdChanges].sort((a, b) => a.diff - b.diff);
    const sortedByRawUp = [...allYtdChanges].sort((a, b) => b.diff - a.diff);
    const superlativeLines = [
      `LARGEST YTD % INCREASES (across ALL tracked offenses):`,
      ...sortedByPctUp.filter(o => o.pctChg > 0).slice(0, 5).map(o => `  ${o.name}: +${o.pctChg.toFixed(1)}% (${o.ytdCur.toLocaleString()} vs ${o.ytdPri.toLocaleString()})`),
      `LARGEST YTD % DECREASES (across ALL tracked offenses):`,
      ...sortedByPctDown.filter(o => o.pctChg < 0).slice(0, 5).map(o => `  ${o.name}: ${o.pctChg.toFixed(1)}% (${o.ytdCur.toLocaleString()} vs ${o.ytdPri.toLocaleString()})`),
      `LARGEST YTD RAW DECREASES (across ALL tracked offenses):`,
      ...sortedByRawDown.filter(o => o.diff < 0).slice(0, 5).map(o => `  ${o.name}: ${o.diff.toLocaleString()} fewer (${o.ytdCur.toLocaleString()} vs ${o.ytdPri.toLocaleString()})`),
      `LARGEST YTD RAW INCREASES (across ALL tracked offenses):`,
      ...sortedByRawUp.filter(o => o.diff > 0).slice(0, 5).map(o => `  ${o.name}: +${o.diff.toLocaleString()} more (${o.ytdCur.toLocaleString()} vs ${o.ytdPri.toLocaleString()})`),
      `HIGHEST-VOLUME OFFENSES YTD (across ALL tracked offenses):`,
      ...allYtdChanges.sort((a, b) => b.ytdCur - a.ytdCur).slice(0, 10).map(o => `  ${o.name}: ${o.ytdCur.toLocaleString()} incidents`),
    ].join('\n');

    // Precinct-level top/bottom rankings (YTD, compact)
    let precinctSummary = '';
    if (activeGeo === 'citywide' && rawData) {
      const pctKeys = Object.keys(rawData).filter(k => k.includes('Precinct'));
      if (pctKeys.length > 0) {
        const pctRates = pctKeys.map(pct => {
          const d = rawData[pct];
          const p = GEO_POPULATIONS[pct] || 0;
          const hood = PRECINCT_NEIGHBORHOODS[pct] || '';
          const f = d.seven_major_felonies || {};
          let total = 0;
          Object.values(f).forEach(stats => { total += safeNum(stats?.year_to_date?.current_year); });
          return { pct, hood, total, pop: p, rate: p > 0 ? (total / p) * 100000 : 0 };
        }).filter(r => r.pop > 0 && !TOURIST_PRECINCTS.includes(r.pct)).sort((a, b) => b.rate - a.rate);

        const avgRate = pctRates.reduce((s, r) => s + r.rate, 0) / (pctRates.length || 1);
        const top5 = pctRates.slice(0, 5).map(r => `  ${r.pct} (${r.hood}): ${r.rate.toFixed(0)}/100k (${r.total} incidents, pop ${formatPop(r.pop)})`).join('\n');
        const bot5 = pctRates.slice(-5).reverse().map(r => `  ${r.pct} (${r.hood}): ${r.rate.toFixed(0)}/100k (${r.total} incidents, pop ${formatPop(r.pop)})`).join('\n');
        const allPctLines = pctRates.map((r, i) => `  #${i + 1} ${r.pct} (${r.hood}): ${r.rate.toFixed(0)}/100k`).join('\n');

        // Top 5 vs bottom N inequality stat
        const sortedV = [];
        pctKeys.forEach(pct => {
          const d = rawData[pct]; let vSum = 0;
          Object.entries(d.seven_major_felonies || {}).forEach(([crime, stats]) => {
            if (VIOLENT_CRIMES.includes(crime)) vSum += safeNum(stats?.year_to_date?.current_year);
          });
          if (vSum > 0) sortedV.push({ precinct: pct, violent: vSum });
        });
        sortedV.sort((a, b) => b.violent - a.violent);
        let inequalityLine = '';
        if (sortedV.length > 10) {
          const t5 = sortedV.slice(0, 5);
          const t5Sum = t5.reduce((s, p) => s + p.violent, 0);
          const t5Pop = t5.reduce((s, p) => s + (GEO_POPULATIONS[p.precinct] || 0), 0);
          let bSum = 0, bCount = 0, bPop = 0;
          for (let i = sortedV.length - 1; i >= 0 && bSum < t5Sum; i--) { bSum += sortedV[i].violent; bCount++; bPop += (GEO_POPULATIONS[sortedV[i].precinct] || 0); }
          inequalityLine = `\nGEOGRAPHIC INEQUALITY: The 5 highest-violent-crime precincts (${formatPop(t5Pop)} residents, violent crime total: ${t5Sum.toLocaleString()}) produce as much violent crime as the ${bCount} safest precincts combined (${formatPop(bPop)} residents).`;
        }

        // Significant local shifts — precinct-level offense spikes/drops
        const VOLATILITY_MIN = 10; // minimum prior-year count to avoid noisy small-N swings
        let allPctCrimes = [];
        pctKeys.forEach(pct => {
          Object.entries(rawData[pct].seven_major_felonies || {}).forEach(([crime, stats]) => {
            const c = safeNum(stats?.year_to_date?.current_year);
            const p = safeNum(stats?.year_to_date?.prior_year);
            if (p >= VOLATILITY_MIN) allPctCrimes.push({ precinct: pct, crime, cur: c, pri: p, pctChg: ((c - p) / p) * 100 });
          });
        });
        allPctCrimes.sort((a, b) => b.pctChg - a.pctChg);
        const topSpike = allPctCrimes[0];
        const topDrop = allPctCrimes[allPctCrimes.length - 1];
        let localShiftsLine = '\nSIGNIFICANT LOCAL SHIFTS (biggest precinct-level YTD changes):';
        if (topSpike) localShiftsLine += `\n  Biggest spike: ${topSpike.crime} in ${topSpike.precinct} (${PRECINCT_NEIGHBORHOODS[topSpike.precinct] || ''}): ${topSpike.cur} vs ${topSpike.pri} (+${topSpike.pctChg.toFixed(1)}%)`;
        if (topDrop) localShiftsLine += `\n  Biggest drop: ${topDrop.crime} in ${topDrop.precinct} (${PRECINCT_NEIGHBORHOODS[topDrop.precinct] || ''}): ${topDrop.cur} vs ${topDrop.pri} (${topDrop.pctChg.toFixed(1)}%)`;

        precinctSummary = `\nPRECINCT CRIME RATES (YTD major index per 100k, ranked highest to lowest, citywide avg: ${avgRate.toFixed(0)}/100k):\n${allPctLines}\n\nTOP 5 HIGHEST-RATE (detail):\n${top5}\n\nTOP 5 LOWEST-RATE (detail):\n${bot5}${inequalityLine}${localShiftsLine}`;
      }
    }

    // City comparison data
    const cityCompLine = activeGeo === 'citywide' ? `\nCITY COMPARISON (12-month rolling totals per 100k, through ${RTCI_PERIOD}, source: Real-Time Crime Index by AH Datalytics):\n` +
      RTCI_CITIES.map(c => `  ${c.city}: Murder ${rtciRate(c.murder, c.pop)}/100k, Violent ${rtciRate(c.violent, c.pop)}/100k, Property ${rtciRate(c.property, c.pop)}/100k`).join('\n') : '';

    return `=== LIVE NYPD COMPSTAT DATA (Week of ${periodStr}) ===
Geography: ${geoLabel}
Current year: ${currentYear} | Prior year: ${priorYear}
NOTE: This dashboard tracks 18+ offense categories. The "7 major index felonies" are Murder, Rape, Robbery, Fel. Assault, Burglary, Gr. Larceny, and G.L.A. Additional tracked offenses include Petit Larceny, Retail Theft, Shooting Incidents, Shooting Victims, Misd. Assault, Misd. Sex Crimes, Hate Crimes, Transit, UCR Rape, Traffic Fatalities, and more. When answering "which crime" or "most/least" questions, consider ALL tracked offenses below, not just the 7 major index felonies.

YEAR-TO-DATE SUMMARY:
  Total major index felonies: ${ytdMCur.toLocaleString()} (${currentYear}) vs ${ytdMPri.toLocaleString()} (${priorYear}) = ${ytdTotalPct} change
  Violent crime total: ${ytdVCur.toLocaleString()} (${ytdViolentPct}% of index total, ${ytdViolentChangePct} vs ${priorYear})
  Property crime total: ${ytdPCur.toLocaleString()} (${ytdPropertyPct}% of index total, ${ytdPropertyChangePct} vs ${priorYear})
  Murders: ${ytdMurder} (${currentYear}) vs ${ytdMurderPri} (${priorYear}) = ${formatPct(calcPct(ytdMurder, ytdMurderPri))} change
  Shooting Victims: ${ytdShootingVic}

WEEKLY SUMMARY (week of ${periodStr}):
  Total major index felonies: ${wtdMCur.toLocaleString()} (${currentYear}) vs ${wtdMPri.toLocaleString()} (${priorYear}) = ${wtdTotalPct} change
  Violent crime: ${wtdVCur.toLocaleString()} | Property crime: ${wtdPCur.toLocaleString()}
  Murders: ${wtdMurder} | Shooting Victims: ${wtdShootingVic}

YTD SHARE OF TOTAL BY OFFENSE (among 7 major index felonies — pre-computed, use directly):
${perOffenseYtdLines}

WEEKLY CHANGE BY OFFENSE (among 7 major index felonies — pre-computed, use directly):
${perOffenseWtdLines}

ALL TRACKED OFFENSES (both YTD and weekly, including non-index — THIS IS THE COMPLETE LIST):
${offenseLines}

${superlativeLines}

${driverLine}
${lethalityLine}${precinctSummary}${cityCompLine}

=== HISTORICAL DATASETS ===
WARNING: Historical data contains FULL-YEAR ANNUAL TOTALS ONLY (not YTD). You CANNOT compare a current YTD figure to a historical full-year figure without clearly stating "Note: the historical figure is a full-year total while the current figure is year-to-date through ${period?.week_end || 'this week'}." If asked about YTD figures for any year other than ${currentYear} and ${priorYear}, say "I only have YTD data for ${currentYear} and ${priorYear}. For other years, I have full-year annual totals."
CITYWIDE ANNUAL TOTALS 1993-2025 (key: y=year, BU=Burglary, FA=Fel.Assault, GA=G.L.A., GL=Gr.Larceny, MU=Murder, RA=Rape, RO=Robbery):
${JSON.stringify(CW)}
`;
  };

  const handleQuery = async (q) => {
    const questionText = q || query;
    if (!questionText.trim()) return;

    setQuery('');
    setLoading(true);
    setError('');

    const dataContext = buildContext();
    const systemPrompt = `You are a concise, plain-language crime data analyst for the NYPD CompStat Ledger by Vital City. You answer questions ONLY using the DATA section provided with each message. You have no other source of information.

RULE 1 — NEVER MAKE ANYTHING UP:
Every number you cite must appear verbatim in the DATA section. If it's not there, say "I don't have that figure in the current dataset." Do not estimate, approximate, extrapolate, or invent. Do not use your training data for ANY NYC crime statistic. A wrong crime number is dangerous misinformation — "I don't know" is always the right answer when the data isn't there.

RULE 2 — DO NOT DO MATH:
All totals, percentages, shares, rates, and rankings are pre-computed in the DATA. Use them exactly as given. Do not add, subtract, multiply, or divide numbers yourself. If a derived figure isn't pre-computed, say "That calculation isn't in the current dataset" — do not attempt it.

RULE 3 — SEARCH ALL OFFENSES:
This dashboard tracks 18+ offense categories, NOT just the 7 major index felonies. For ANY question about "which crime," "most," "least," "biggest," "highest," "largest increase," or any superlative — you MUST check the "ALL TRACKED OFFENSES" section AND the "LARGEST YTD % INCREASES/DECREASES" and "HIGHEST-VOLUME OFFENSES" sections. Petit Larceny, Retail Theft, Hate Crimes, Transit, Shooting Victims, Traffic Fatalities, and other non-index offenses are all tracked. Never limit your answer to only the 7 major index felonies unless the user specifically asks about "major index felonies."

RULE 4 — HISTORICAL & LONG-TERM DATA:
Each offense line includes "Long-term" % changes: 2yr (vs 2 years ago), 14yr (vs 14 years ago), and 31yr (vs 31 years ago). Use these for questions about multi-year trends. The HISTORICAL DATASETS section at the bottom contains full-year annual totals (not YTD) for 1993-2025. If comparing a current YTD figure to a historical full-year figure, you MUST state: "Note: the historical figure is a full-year total while the current figure is year-to-date." You only have YTD data for the current and prior year.

RULE 5 — PRECINCT DATA:
Precinct-level overall crime rates (per 100k) are provided for all precincts. Precinct-level OFFENSE BREAKDOWNS (e.g., "how many robberies in the 40th Precinct") are NOT available — only overall rates. The SIGNIFICANT LOCAL SHIFTS section shows the biggest precinct-level offense spikes and drops. The GEOGRAPHIC INEQUALITY section shows concentration data. Use these when relevant.

RULE 6 — WHEN IN DOUBT, SAY YOU DON'T KNOW:
If you are not 100% certain the answer is in the DATA, say so. Never guess. Never hedge with "approximately" or "around." Either cite the exact figure from the data or say you don't have it.

FORMAT: Answer in 2-4 sentences. Cite exact numbers from the data. No bullet points or headers.`;

    const messages = [];
    history.forEach(h => {
      messages.push({ role: 'user', content: h.q });
      messages.push({ role: 'assistant', content: h.a });
    });
    messages.push({
      role: 'user',
      content: `DATA:\n${dataContext}\n\nQUESTION: ${questionText}`
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 1500,
          temperature: 0,
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
  const [geoFocused, setGeoFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Map & AI summary state
  const [mapCrime, setMapCrime] = useState('all');
  const [weeklySummary, setWeeklySummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const summaryDataRef = useRef(null);

  // Scatter plot state for Historic view
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

  const isTouristPrecinct = TOURIST_PRECINCTS.includes(activeGeo);
  const activePop = GEO_POPULATIONS[activeGeo] || (activeGeo === 'citywide' ? CITYWIDE_POPULATION : null);
  const formattedMPct = typeof parsedData.totals.mPct === 'number' ? Number(Math.abs(parsedData.totals.mPct)).toFixed(1) : '0.0';

  // Compute per-100k rates for all precincts (for map + ranking bars)
  const precinctRates = useMemo(() => {
    const precinctKeys = Object.keys(rawData).filter(k => k.includes('Precinct'));
    return precinctKeys.map(pct => {
      const pop = GEO_POPULATIONS[pct];
      const d = rawData[pct];
      const felonies = d.seven_major_felonies || {};
      const addl = d.additional_stats || {};
      let count = 0;
      const getter = (stats) => safeNum(activeTab === 'ytd' ? stats?.year_to_date?.current_year : stats?.week_to_date?.current_year);
      if (mapCrime === 'all') {
        Object.values(felonies).forEach(s => { count += getter(s); });
      } else if (mapCrime === 'violent') {
        ['Murder', 'Rape', 'Robbery', 'Fel. Assault'].forEach(c => { if (felonies[c]) count += getter(felonies[c]); });
      } else if (mapCrime === 'property') {
        ['Burglary', 'Gr. Larceny', 'G.L.A.'].forEach(c => { if (felonies[c]) count += getter(felonies[c]); });
      } else {
        const all = { ...felonies, ...addl };
        if (all[mapCrime]) count = getter(all[mapCrime]);
      }
      const precinctNum = pct.replace(/\D+/g, '').replace(/^0+/, '');
      return { precinct: pct, precinctNum, rate: pop ? (count / pop) * 100000 : null, count, isTourist: TOURIST_PRECINCTS.includes(pct) };
    });
  }, [rawData, activeTab, mapCrime]);

  // Story of the Week: auto-generate AI summary on data load (citywide only)
  // Pulls directly from rawData (not parsedData) so it always has both YTD and weekly figures
  useEffect(() => {
    if (activeGeo !== 'citywide') return;
    const dataKey = JSON.stringify(parsedData.totals);
    if (summaryDataRef.current === dataKey) return;
    summaryDataRef.current = dataKey;
    const run = async () => {
      setSummaryLoading(true);
      try {
        // Build context directly from rawData to include BOTH weekly and YTD
        const cw = rawData['citywide'];
        const felonies = cw?.seven_major_felonies || {};
        const addl = cw?.additional_stats || {};
        const period = rawData.period || {};

        // Helper to safely extract numbers
        const sn = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };

        // Build weekly and YTD totals for all offenses
        const offenseLines = [];
        let ytdTotal = 0, ytdPrior = 0, wkTotal = 0, wkPrior = 0;
        const allOffenses = { ...felonies, ...addl };
        for (const [name, stats] of Object.entries(allOffenses)) {
          const yc = sn(stats?.year_to_date?.current_year);
          const yp = sn(stats?.year_to_date?.prior_year);
          const yPct = stats?.year_to_date?.pct_change;
          const wc = sn(stats?.week_to_date?.current_year);
          const wp = sn(stats?.week_to_date?.prior_year);
          const wPct = stats?.week_to_date?.pct_change;
          if (felonies[name]) { ytdTotal += yc; ytdPrior += yp; wkTotal += wc; wkPrior += wp; }
          offenseLines.push(`${name}: YTD ${yc} vs ${yp} (${yPct != null ? (yPct > 0 ? '+' : '') + Number(yPct).toFixed(1) + '%' : 'n/a'}) | Week ${wc} vs ${wp} (${wPct != null ? (wPct > 0 ? '+' : '') + Number(wPct).toFixed(1) + '%' : 'n/a'})`);
        }

        const ytdPct = ytdPrior > 0 ? ((ytdTotal - ytdPrior) / ytdPrior * 100).toFixed(1) : '0.0';
        const wkPct = wkPrior > 0 ? ((wkTotal - wkPrior) / wkPrior * 100).toFixed(1) : '0.0';

        const ctx = [
          `=== NYPD COMPSTAT DATA (Week of ${period.week_start || '?'} – ${period.week_end || '?'}) ===`,
          ``,
          `MAJOR INDEX FELONY TOTALS:`,
          `  YTD: ${ytdTotal.toLocaleString()} vs ${ytdPrior.toLocaleString()} last year (${ytdPct > 0 ? '+' : ''}${ytdPct}%)`,
          `  This week: ${wkTotal.toLocaleString()} vs ${wkPrior.toLocaleString()} same week last year (${wkPct > 0 ? '+' : ''}${wkPct}%)`,
          ``,
          `ALL OFFENSES (YTD and Weekly):`,
          ...offenseLines,
          ``,
          hotspots?.topPctSpike ? `BIGGEST PRECINCT SPIKE: ${hotspots.topPctSpike.crime} in ${hotspots.topPctSpike.precinct} (+${hotspots.topPctSpike.pct.toFixed(1)}%)` : '',
          hotspots?.topPctDrop ? `BIGGEST PRECINCT DROP: ${hotspots.topPctDrop.crime} in ${hotspots.topPctDrop.precinct} (${hotspots.topPctDrop.pct.toFixed(1)}%)` : '',
          hotspots?.inequality ? `INEQUALITY: Top 5 highest-crime precincts (${formatPop(hotspots.inequality.topPop)} residents) have the same violent crime total as the ${hotspots.inequality.bottomCount} safest precincts (${formatPop(hotspots.inequality.bottomPop)} residents)` : '',
        ].filter(Boolean).join('\n');

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            max_tokens: 250,
            system: `You are a concise NYC crime data analyst writing a 2-sentence "Story of the Week" for a data-literate audience.

ABSOLUTE RULES:
- ONLY use numbers that appear EXACTLY in the data below. NEVER invent, estimate, or round numbers differently than shown.
- If a figure is not in the data, do NOT mention it. Do NOT guess.
- The data includes BOTH "YTD" (year-to-date) and "Week" (this week only) figures for every offense. Use the correct one for your claim. Do NOT confuse weekly totals with YTD totals.
- Write exactly 2 sentences. The first captures the single most newsworthy pattern. The second adds essential context or a striking contrast.
- Cite specific numbers from the data. No bullet points, no headers, no hedging.`,
            messages: [{ role: 'user', content: `Here is the latest NYPD CompStat data. Write a 2-sentence summary using ONLY these exact figures:\n\n${ctx}` }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          setWeeklySummary(data?.content?.[0]?.text || '');
        }
      } catch (e) { /* silent fail — summary is supplemental */ }
      finally { setSummaryLoading(false); }
    };
    run();
  }, [parsedData, hotspots, activeGeo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive display years from report period for clear labeling
  const currentYear = useMemo(() => {
    const we = parsedData.period?.week_end;
    if (we) { const m = we.match(/\d{4}/); if (m) return Number(m[0]); }
    return new Date().getFullYear();
  }, [parsedData.period]);
  const priorYear = currentYear - 1;
  const periodLabel = activeTab === 'ytd' ? `${currentYear} YTD` : `Week of ${parsedData.period?.week_start || ''}`;
  const vsLabel = activeTab === 'ytd' ? `${priorYear} YTD` : `Same week ${priorYear}`;

  const buildTrendCards = () => {
    const cards = [];
    const { driver, localAnomaly, localBrightSpot, topSurge, topDrop, totals } = parsedData;
    if (activeGeo === 'citywide') {
      if (driver) {
        const driverShareText = driver.diff > 0
          ? `The overall surge was largely driven by **${driver.name}** index offenses, which account for **${driver.share.toFixed(0)}%** of the total citywide upward shift.`
          : `Nearly **${driver.share.toFixed(0)}%** of the total citywide drop in major index offenses can be attributed to **${driver.name}**, which saw **${Math.abs(driver.diff).toLocaleString()} fewer cases** than in ${priorYear}.`;
        const shareW = Math.min(100, driver.share);
        cards.push({ id: 'driver', icon: Target, title: 'Primary Driver', content: driverShareText,
          dataViz: (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gray-900" style={{ width: `${shareW}%` }} />
              </div>
              <span className="text-[10px] font-black text-gray-900 tabular-nums">{driver.share.toFixed(0)}%</span>
            </div>
          )
        });
      }



      if (hotspots?.topPctSpike || hotspots?.topPctDrop) {
        const flashContent = (
          <ul className="space-y-3 mt-1 text-[14px]">
            {hotspots.topPctSpike && <li>{`In **${formatGeoName(hotspots.topPctSpike.precinct)}**, **${hotspots.topPctSpike.crime}** offenses have spiked by **${hotspots.topPctSpike.pct.toFixed(1)}%**.`}</li>}
            {hotspots.topPctDrop && <li className="pt-2 border-t border-gray-100">{`In **${formatGeoName(hotspots.topPctDrop.precinct)}**, **${hotspots.topPctDrop.crime}** offenses have fallen by **${Math.abs(hotspots.topPctDrop.pct).toFixed(1)}%**.`}</li>}
          </ul>
        );
        cards.push({ id: 'flashpoints', icon: MapPin, title: 'Significant Local Shifts', content: flashContent });
      }
      const lethalDots = Math.round(totals.lethalityRatio);
      cards.push({ id: 'lethality', icon: AlertCircle, title: 'The Lethality Gap', content: `For every **1 homicide**, there were **${totals.lethalityRatio.toFixed(1)} shooting victims**. (A widening gap often points to improved trauma care rather than fewer street shootings).`,
        dataViz: (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-900 flex-shrink-0" title="1 homicide" />
            <span className="text-[10px] font-bold text-gray-400 mx-0.5">:</span>
            {Array.from({ length: lethalDots }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: VC.orange, opacity: 0.7 + (i / lethalDots) * 0.3 }} title="shooting victim" />
            ))}
            {totals.lethalityRatio % 1 > 0.3 && <div className="w-3 h-3 rounded-full flex-shrink-0 opacity-40" style={{ background: VC.orange }} />}
          </div>
        )
      });
    } else {
      if (driver && driver.share >= 25) cards.push({ id: 'local_driver', icon: Target, title: 'Local Driver', content: `The change in **${driver.name}** volume accounts for **${driver.share.toFixed(0)}%** of this area's trajectory.` });
      if (localAnomaly && !isTouristPrecinct) cards.push({ id: 'anomaly', icon: AlertTriangle, title: 'Elevated Local Risk', content: `The rate for **${localAnomaly.name}** here is **${localAnomaly.localRate.toFixed(1)} per 100k residents**, which is **${localAnomaly.ratio.toFixed(1)}x** higher than the citywide average (${localAnomaly.cityRate.toFixed(1)}).` });
      else if (topSurge && topSurge.pct > 0) cards.push({ id: 'surge', icon: TrendingUp, title: 'Local Trajectory', content: `**${topSurge.name}** index offenses have increased by **${topSurge.pct.toFixed(1)}%** vs. the same period in ${priorYear}.` });
      if (localBrightSpot && !isTouristPrecinct) cards.push({ id: 'brightspot', icon: ShieldCheck, title: 'Local Bright Spot', content: `The rate of **${localBrightSpot.name}** offenses here sits **${((1 - localBrightSpot.ratio)*100).toFixed(0)}% below** the citywide average.` });
      else if (topDrop && topDrop.pct < 0) cards.push({ id: 'drop', icon: TrendingDown, title: 'Local Trajectory', content: `**${topDrop.name}** index offenses have fallen by **${Math.abs(topDrop.pct).toFixed(1)}%** here vs. the same period in ${priorYear}.` });
    }
    return cards;
  };

  const trendCards = buildTrendCards();
  const risingOffenses = useMemo(() => parsedData.all.filter(o => o.pct > 0).sort((a, b) => b.pct - a.pct) || [], [parsedData.all]);
  const fallingOffenses = useMemo(() => parsedData.all.filter(o => o.pct < 0).sort((a, b) => a.pct - b.pct) || [], [parsedData.all]);

  // Historic View Memos
  const vp = useMemo(()=>{const vC=['FA','MU','RA','RO'],pC=['BU','GA','GL'];return CW.map(d=>({y:d.y,violent:vC.reduce((s,c)=>s+d[c],0),property:pC.reduce((s,c)=>s+d[c],0)}));},[]);
  const idx = useMemo(()=>{const b=CW[0];return CW.map(d=>{const o={y:d.y};K7.forEach(c=>{o[c]=d[c]/b[c]*100;});return o;});},[]);
  const assaultD = useMemo(()=>CW.filter(d=>d.y>=2000&&d.y<=2024).map(d=>{const ma=MA_CW[d.y]||0;return{y:d.y,fa:d.FA,ma,total:d.FA+ma,faPct:d.FA/(d.FA+ma)*100};}),[]);
  const sd = useMemo(()=>PC.filter(p=>p.n!=='14th').map(p=>({...p,x:p[xM],y:p[yM]})), [xM, yM]);
  const ms = [{k:'pov',l:'Poverty %'},{k:'ta',l:'Total assault'},{k:'fa',l:'Felony assault'},{k:'ma',l:'Misd. assault'},{k:'sh',l:'Shootings'},{k:'ha',l:'Harassment'},{k:'pl',l:'Petit larceny'},{k:'gl',l:'Grand larceny'},{k:'fs',l:'Felony share %'}];

  // ==========================================
  // HISTORIC VIEW RENDER
  // ==========================================
  if (appView === 'historic') {
    return (
      <div className="min-h-screen bg-white text-black font-sans pb-20">
        
        {/* Header */}
        <div className="bg-[#050507] text-white pt-12 pb-16 px-5 sm:px-8">
           <div className="max-w-[1100px] mx-auto">
              <button onClick={() => setAppView('live')} className="text-gray-400 hover:text-white uppercase tracking-widest text-[11px] font-bold flex items-center gap-2 mb-8 transition-colors"><ArrowLeft size={14}/> Back to Live Dashboard</button>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight font-serif">The 30-Year Transformation of NYC Crime</h1>
              <p className="text-lg text-gray-400 font-serif max-w-3xl leading-relaxed">Beyond the weekly CompStat fluctuations lies a deeper story. Over three decades, the volume, composition, and geographic distribution of crime in New York City has fundamentally rewritten itself.</p>
           </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-12 space-y-24">

          {/* Section 1: The Macro Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1 space-y-4">
               <div className="text-[#ff7c53] text-[10px] font-black uppercase tracking-widest">Macro Volume</div>
               <h2 className="text-2xl font-black leading-snug">The Great Decline & The Modern Rebound</h2>
               <p className="text-gray-600 font-serif text-[15px] leading-relaxed">From 1993 to 2019, major index crime collapsed. But the decline wasn't uniform. Violent crime leveled off around 2010, while property crime continued to fall. Since 2019, both have trended upward, with violent crime reaching levels not seen since the early 2000s.</p>
            </div>
            <div className="lg:col-span-2 h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vp.filter(d=>d.y>=2000)} margin={{top:5,right:5,left:10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
                  <XAxis dataKey="y" tick={{fontSize:10}} stroke="#999" axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10}} stroke="#999" tickFormatter={v=>`${(v/1000).toFixed(0)}K`} axisLine={false} tickLine={false}/>
                  <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;return <div className="bg-white border border-gray-200 p-3 text-[11px] shadow-lg"><div className="font-bold mb-1">{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: <strong className="text-black">{p.value.toLocaleString()}</strong></div>)}</div>;}}/>
                  <Line type="monotone" dataKey="violent" name="Violent Index" stroke="#e7466d" strokeWidth={3} dot={false}/>
                  <Line type="monotone" dataKey="property" name="Property Index" stroke="#394882" strokeWidth={3} dot={false}/>
                  <Legend wrapperStyle={{fontSize:11}} iconType="circle"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 2: Crime DNA (100% Stacked) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center border-t border-gray-100 pt-16">
            <div className="lg:col-span-2 h-[350px] order-2 lg:order-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CW} stackOffset="expand" margin={{top:5,right:0,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
                  <XAxis dataKey="y" tick={{fontSize:10}} stroke="#999" axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10}} stroke="#999" tickFormatter={v=>`${(v*100).toFixed(0)}%`} axisLine={false} tickLine={false}/>
                  <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;return <div className="bg-white border border-gray-200 p-3 text-[11px] shadow-lg"><div className="font-bold mb-2">{label} Profile</div>{[...payload].reverse().map((p,i)=><div key={i} className="flex justify-between gap-4"><span style={{color:p.color}}>{CL[p.dataKey]}</span><span className="font-bold text-black">{(p.value*100).toFixed(1)}%</span></div>)}</div>;}}/>
                  {K7.map(c=><Area key={c} type="monotone" dataKey={c} stackId="1" fill={CC[c]} stroke={CC[c]} fillOpacity={0.9}/>)}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
               <div className="text-[#e7466d] text-[10px] font-black uppercase tracking-widest">Composition</div>
               <h2 className="text-2xl font-black leading-snug">The DNA of Crime Has Mutated</h2>
               <p className="text-gray-600 font-serif text-[15px] leading-relaxed">In 1993, Burglary and Auto Theft made up half of all major crime. Today, they account for barely a fifth. Meanwhile, Grand Larceny and Felony Assault have consumed the chart, now making up 64% of the entire index.</p>
               <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4">
                 {K7.map(c=><div key={c} className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider"><div className="w-2 h-2 rounded-sm" style={{background:CC[c]}}/>{CL[c]}</div>)}
               </div>
            </div>
          </div>

          {/* Section 3: Divergence */}
          <div className="border-t border-gray-100 pt-16 space-y-6">
             <div className="max-w-3xl">
               <div className="text-[#394882] text-[10px] font-black uppercase tracking-widest">Divergence</div>
               <h2 className="text-2xl font-black leading-snug mb-3">Seven Crimes, Seven Trajectories</h2>
               <p className="text-gray-600 font-serif text-[15px] leading-relaxed">If we index all crimes to their 1993 levels (where 1993 = 100), the divergence is stark. Property crimes like auto theft collapsed by nearly 90%. Murder fell 84%. But felony assault dropped only 27% at its lowest point, and has now rebounded aggressively to become the statistical outlier.</p>
             </div>
             <div className="h-[450px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={idx} margin={{top:5,right:5,left:-10,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
                    <XAxis dataKey="y" tick={{fontSize:10}} stroke="#999" axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10}} stroke="#999" domain={[0,160]} axisLine={false} tickLine={false}/>
                    <ReferenceLine y={100} stroke="#050507" strokeDasharray="4 4" strokeOpacity={0.3}/>
                    <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;const s=[...payload].sort((a,b)=>b.value-a.value);return <div className="bg-white border border-gray-200 p-3 text-[11px] shadow-lg"><div className="font-bold mb-2">{label} (vs 1993)</div>{s.map((p,i)=><div key={i} className="flex justify-between gap-4"><span style={{color:p.color}}>{CL[p.dataKey]}</span><span className="font-bold text-black">{Number(p.value).toFixed(0)}</span></div>)}</div>;}}/>
                    {K7.map(c=><Line key={c} type="monotone" dataKey={c} stroke={CC[c]} strokeWidth={c==='FA'?4:1.5} strokeOpacity={c==='FA'?1:0.3} dot={false}/>)}
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Section 4: The Assault Anomaly */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t-[3px] border-black pt-16">
            <div className="space-y-4">
               <div className="text-[#050507] text-[10px] font-black uppercase tracking-widest">Classification Shift</div>
               <h2 className="text-2xl font-black leading-snug">The Assault Anomaly</h2>
               <p className="text-gray-600 font-serif text-[15px] leading-relaxed mb-4">While felony assault dominates headlines, misdemeanor assault outnumbers it 1.6 to 1. In 2015, misdemeanor assaults dropped 21% overnight while felonies didn't budge—a clear indicator of classification changes rather than behavioral shifts.</p>
               <p className="text-gray-600 font-serif text-[15px] leading-relaxed">Since 2020, both categories have begun rising in lockstep for the first time in the dataset, suggesting a genuine increase in violent contact rather than just administrative drift.</p>
            </div>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assaultD} margin={{top:5,right:5,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
                  <XAxis dataKey="y" tick={{fontSize:10}} stroke="#999" axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10}} stroke="#999" tickFormatter={v=>`${(v/1000).toFixed(0)}K`} axisLine={false} tickLine={false}/>
                  <Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0]?.payload;return <div className="bg-white border border-gray-200 p-3 text-[11px] shadow-lg"><div className="font-bold mb-2">{d.y} Assaults</div><div className="text-[#ff7c53]">Misdemeanor: {d.ma.toLocaleString()}</div><div className="text-[#e7466d]">Felony: {d.fa.toLocaleString()}</div><div className="font-bold text-black mt-2 pt-2 border-t border-gray-100">Total: {d.total.toLocaleString()}</div></div>;}}/>
                  <Bar dataKey="ma" stackId="a" fill="#ff7c53" fillOpacity={0.6} name="Misdemeanor" />
                  <Bar dataKey="fa" stackId="a" fill="#e7466d" fillOpacity={0.9} name="Felony" />
                  <Legend wrapperStyle={{fontSize:11}} iconType="circle"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 5: Precinct Scatter */}
          <div className="border-t border-gray-200 pt-16 space-y-8">
             <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
               <div className="max-w-2xl space-y-4">
                 <div className="text-[#9b9fbc] text-[10px] font-black uppercase tracking-widest">Geographic Reality</div>
                 <h2 className="text-2xl font-black leading-snug">The Complex Geography of Crime</h2>
                 <p className="text-gray-600 font-serif text-[15px] leading-relaxed">Mapping the 76 standard precincts reveals distinct statistical clusters. In this specific dataset, poverty rates correlate strongly with violence (shootings, murder, felony assault). Conversely, theft (grand and petit larceny) shows virtually zero correlation with poverty, mapping closer to commercial density and foot traffic.</p>
               </div>
               
               {/* Controls */}
               <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 self-start md:self-end">
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">X-Axis</label>
                   <select value={xM} onChange={e=>setXM(e.target.value)} className="bg-white border border-gray-300 text-xs py-1.5 px-2 rounded focus:outline-none focus:border-black">
                     {ms.map(m=><option key={m.k} value={m.k}>{m.l}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Y-Axis</label>
                   <select value={yM} onChange={e=>setYM(e.target.value)} className="bg-white border border-gray-300 text-xs py-1.5 px-2 rounded focus:outline-none focus:border-black">
                     {ms.map(m=><option key={m.k} value={m.k}>{m.l}</option>)}
                   </select>
                 </div>
               </div>
             </div>
             
             <div className="h-[500px] w-full bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{top:10,right:10,left:10,bottom:10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                    <XAxis dataKey="x" type="number" tick={{fontSize:10}} stroke="#999" name={ms.find(m=>m.k===xM)?.l} label={{value:ms.find(m=>m.k===xM)?.l,position:'bottom',fontSize:11,fill:'#555',offset:-5, fontWeight:'bold'}}/>
                    <YAxis dataKey="y" type="number" tick={{fontSize:10}} stroke="#999" name={ms.find(m=>m.k===yM)?.l} label={{value:ms.find(m=>m.k===yM)?.l,angle:-90,position:'insideLeft',fontSize:11,fill:'#555', fontWeight:'bold'}}/>
                    <Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0].payload;return <div className="bg-white border border-gray-200 p-3 text-[11px] shadow-lg"><div className="font-bold text-black mb-2 pb-2 border-b border-gray-100">{d.n} Precinct</div><div className="text-gray-600 mb-1">{ms.find(m=>m.k===xM)?.l}: <span className="font-bold text-black">{d.x}</span></div><div className="text-gray-600">{ms.find(m=>m.k===yM)?.l}: <span className="font-bold text-black">{d.y}</span></div></div>;}}/>
                    <Scatter data={sd} fill="#e7466d" fillOpacity={0.6} stroke="#e7466d" strokeOpacity={0.3}/>
                  </ScatterChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="border-collapse text-[11px] w-full min-w-[680px]">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b-2 border-[#050507] text-[10px]">Quartile</th>
                  <th className="text-center p-2 border-b-2 border-[#050507] text-[10px]">Poverty</th>
                  <th className="text-center p-2 border-b-2 border-[#050507] text-[10px] text-[#e7466d]">Fel. Aslt (per 100k)</th>
                  <th className="text-center p-2 border-b-2 border-[#050507] text-[10px] text-[#217ebe]">Grand Larc (per 100k)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {q:'Q1: Lowest',pov:'8.4%',fa:180,gl:651},
                  {q:'Q2: Low-mid',pov:'13.3%',fa:400,gl:948},
                  {q:'Q3: Mid-high',pov:'19.0%',fa:353,gl:492},
                  {q:'Q4: Highest',pov:'30.3%',fa:607,gl:653},
                ].map((q,i)=>(
                  <tr key={i} className={`border-b border-gray-100 ${i===3 ? 'bg-red-50/50' : ''}`}>
                    <td className="p-2 font-semibold">{q.q}</td>
                    <td className="text-center p-2 font-bold">{q.pov}</td>
                    <td className="text-center p-2 font-bold text-[#e7466d]">{q.fa}</td>
                    <td className="text-center p-2 font-bold text-[#217ebe]">{q.gl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unified AI Query Box */}
          <div className="pt-12 mt-20 border-t border-gray-200">
             <QueryBox parsedData={parsedData} activeGeo={activeGeo} activeTab={activeTab} period={parsedData.period} rawData={rawData} priorYear={priorYear} />
          </div>

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
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-20">
            <div className="flex flex-1 md:w-72 relative min-w-[200px]">
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <SearchIcon size={14} className="absolute left-3 top-[11px] pointer-events-none text-gray-400" />
                  <input
                    type="text"
                    placeholder={geoFocused ? "Search neighborhood or precinct..." : ""}
                    value={geoFocused ? searchQuery : (activeGeo === 'citywide' ? 'Citywide' : formatGeoName(activeGeo))}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={e => { setGeoFocused(true); setSearchQuery(''); e.target.value = ''; }}
                    onBlur={() => setTimeout(() => { setGeoFocused(false); setSearchQuery(''); }, 200)}
                    className={`w-full text-[11px] font-black uppercase tracking-wider py-2.5 pl-9 pr-4 rounded border bg-white focus:outline-none ${geoFocused ? 'border-indigo-400' : 'border-gray-300'}`}
                  />
                  {geoFocused && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded z-50 max-h-72 overflow-y-auto">
                      {geoSearchResults.showCitywide && (
                        <button onMouseDown={() => { setActiveGeo('citywide'); setGeoFocused(false); setSearchQuery(''); }} className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 ${activeGeo === 'citywide' ? 'bg-gray-50 font-black' : ''}`}>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-black">Citywide</div>
                        </button>
                      )}
                      {geoSearchResults.boroughs.length > 0 && (
                        <>
                          <div className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Boroughs</div>
                          {geoSearchResults.boroughs.map(b => (
                            <button key={b} onMouseDown={() => { setActiveGeo(b); setGeoFocused(false); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${activeGeo === b ? 'bg-gray-50 font-black' : ''}`}>
                              <div className="text-[11px] font-bold uppercase tracking-wider text-black">{b}</div>
                            </button>
                          ))}
                        </>
                      )}
                      {geoSearchResults.precincts.length > 0 && (
                        <>
                          <div className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-100">Precincts</div>
                          {geoSearchResults.precincts.map(r => (
                            <button key={r.pct} onMouseDown={() => { setActiveGeo(r.pct); setGeoFocused(false); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${activeGeo === r.pct ? 'bg-gray-50' : ''}`}>
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
                <button onClick={handleLocateUser} disabled={isLocating} title="Find my precinct" className="flex items-center justify-center px-3 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50">{isLocating ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}</button>
              </div>
              {locateMsg && <span className="absolute -bottom-5 left-0 text-[10px] font-bold uppercase tracking-widest text-indigo-600">{locateMsg}</span>}
            </div>
            <div className="flex border border-black rounded overflow-hidden shrink-0">
              <button onClick={() => setActiveTab('wtd')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'wtd' ? 'bg-black text-white' : 'bg-white'}`}>Weekly</button>
              <button onClick={() => setActiveTab('ytd')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'ytd' ? 'bg-black text-white' : 'bg-white'}`}>Year to Date</button>
            </div>
          </div>
        </header>

        <section className="mb-10">
          {isTouristPrecinct && <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-400 text-sm font-serif italic text-gray-700"><strong>Context Note:</strong> {formatGeoName(activeGeo)} is a high-traffic hub with few residents; crime rates primarily reflect commercial/visitor density.</div>}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.08] tracking-tight mb-3 text-black max-w-4xl">
            Major index offenses are {parsedData.totals.diff > 0 ? 'up' : 'down'} {formattedMPct}% {activeTab === 'ytd' ? `in ${currentYear}` : 'this week'} vs. {activeTab === 'ytd' ? `${priorYear} YTD` : `same week ${priorYear}`}.
          </h1>
          <p className="text-base md:text-lg font-serif text-gray-600 mb-6 max-w-3xl leading-snug">
            Violent index offenses account for <strong className="text-black">{Number((parsedData.totals.vCur / (parsedData.totals.mCur || 1)) * 100).toFixed(0)}%</strong> of the {parsedData.totals.mCur.toLocaleString()} major felonies reported {activeGeo === 'citywide' ? 'citywide' : `in the ${activeGeo}`}, while the remaining <strong className="text-black">{Number((parsedData.totals.pCur / (parsedData.totals.mCur || 1)) * 100).toFixed(0)}%</strong> are property-related.
          </p>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <div className="flex items-end gap-3 relative">
              {activeGeo === 'citywide' && (() => {
                const totals = CW.map(d => d.BU + d.FA + d.GA + d.GL + d.MU + d.RA + d.RO);
                const maxT = Math.max(...totals);
                const w = 200; const h = 48;
                const pts = totals.map((v, i) => `${(i / (totals.length - 1)) * w},${h - (v / maxT) * h}`).join(' ');
                const area = pts + ` ${w},${h} 0,${h}`;
                return (
                  <svg width={w} height={h} className="absolute bottom-0 left-0 opacity-[0.08] pointer-events-none" preserveAspectRatio="none">
                    <polygon points={area} fill={VC.black} />
                  </svg>
                );
              })()}
              <span className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter leading-none relative">{parsedData.totals.mCur.toLocaleString()}</span>
              <div className="pb-1.5 flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Index Total</span>
                <span className={`text-base font-bold tabular-nums ${parsedData.totals.mPct > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {parsedData.totals.mPct > 0 ? '+' : (parsedData.totals.mPct < 0 ? '-' : '')}{formattedMPct}% vs {parsedData.totals.mPri.toLocaleString()} in {priorYear}
                </span>
              </div>
            </div>
            {activePop && activeGeo !== 'citywide' && !isTouristPrecinct && (
              <div className="pb-1.5 flex flex-col pl-6 border-l border-gray-200">
                <span className="text-sm font-medium text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Users size={14} /> Per 100k Residents</span>
                <span className="text-lg font-bold text-black tabular-nums">{((parsedData.totals.mCur / activePop) * 100000).toFixed(1)} incidents</span>
                <span className="text-xs font-medium text-gray-500 mt-1">Citywide: {(parsedData.totals.citywideRate || 0).toFixed(1)} per 100k</span>
              </div>
            )}
          </div>
        </section>

        {/* Story of the Week — AI-generated summary (citywide only) */}
        {activeGeo === 'citywide' && (weeklySummary || summaryLoading) && (
          <section className="mb-10 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#ff7c53]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Story of the Week</span>
              <span className="text-[9px] font-medium text-gray-400 ml-auto uppercase tracking-wider">AI-generated</span>
            </div>
            {summaryLoading ? (
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="font-serif text-[16px] leading-relaxed text-gray-800">{renderMarkdown(weeklySummary)}</p>
            )}
          </section>
        )}

        <section className="mb-8 pt-8 border-t border-gray-200">
          <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 mb-5">Trends to Watch</h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${trendCards.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8`}>
            {trendCards.map(card => {
              const IconComp = card.icon;
              return (
                <div key={card.id} className="p-6 bg-gray-50 rounded-sm">
                  <div className="flex items-center gap-2 mb-3"><IconComp size={16} className="text-black" /><h3 className="text-[10px] font-black uppercase tracking-widest text-black">{card.title}</h3></div>
                  <div className="font-serif text-[15px] leading-relaxed text-gray-700">{renderMarkdown(card.content)}</div>
                  {card.dataViz && card.dataViz}
                </div>
              );
            })}
          </div>
        </section>

        <QueryBox
          parsedData={parsedData}
          activeGeo={activeGeo}
          activeTab={activeTab}
          period={parsedData.period}
          rawData={rawData}
          priorYear={priorYear}
        />

        <div className="mb-6 flex items-center gap-2">
          <button onClick={() => setAppView('historic')} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1.5">
            <Activity size={12} /> Explore the 30-Year View →
          </button>
        </div>

        {/* Precinct Choropleth Map + Ranking Bars (citywide only) */}
        {activeGeo === 'citywide' && (
          <section className="mb-10 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-5 gap-4">
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">Geographic View <span className="text-gray-300 font-medium normal-case tracking-normal">— {periodLabel}</span></h2>
                <p className="text-sm text-gray-500 font-serif">Crime rates per 100k residents by precinct. Click any precinct to drill down.
                  {hotspots?.inequality && <span className="ml-1 text-gray-400">The {hotspots.inequality.topCount} highest-crime precincts ({formatPop(hotspots.inequality.topPop)} residents) match the violent crime total of the {hotspots.inequality.bottomCount} safest ({formatPop(hotspots.inequality.bottomPop)} residents).</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded border border-gray-200">
                {[['all', 'All Major'], ['violent', 'Violent'], ['property', 'Property']].map(([val, label]) => (
                  <button key={val} onClick={() => setMapCrime(val)} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors ${mapCrime === val ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>{label}</button>
                ))}
                <select value={['all', 'violent', 'property'].includes(mapCrime) ? '' : mapCrime} onChange={e => e.target.value && setMapCrime(e.target.value)} className="text-[10px] font-black uppercase tracking-widest bg-transparent border-none focus:outline-none text-gray-500 cursor-pointer pl-2">
                  <option value="">Crime...</option>
                  {['Murder', 'Rape', 'Robbery', 'Fel. Assault', 'Burglary', 'Gr. Larceny', 'G.L.A.', 'Petit Larceny', 'Misd. Assault'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <PrecinctMap precinctRates={precinctRates} onSelect={setActiveGeo} activeGeo={activeGeo} />
              </div>
              <div className="lg:col-span-2">
                <PrecinctRankingBars precinctRates={precinctRates} onSelect={setActiveGeo} />
              </div>
            </div>
          </section>
        )}

        {activeGeo === 'citywide' && <CityComparisonWidget />}

        <section className="mb-12 pt-8 border-t-[3px] border-black">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-5">
            <h2 className="text-2xl font-black font-serif">All Tracked Offenses</h2>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-2 md:mt-0">{periodLabel} vs {vsLabel}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
            <div className="max-w-lg"><UnifiedMagnitudeChart data={parsedData.all} isTourist={isTouristPrecinct} citywideRates={parsedData.citywideRates} activeGeo={activeGeo} periodLabel={periodLabel} /></div>
            <div className="max-w-lg"><DivergingBarChart data={parsedData.all} vsLabel={vsLabel} /></div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b-2 border-black pb-4 gap-4">
            <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-black">{trendFilter === 'all' ? 'Detailed Data Ledger' : trendFilter === 'up' ? 'Rising Offenses' : 'Falling Offenses'} <span className="text-gray-400 font-medium normal-case tracking-normal text-[11px]">— {periodLabel} vs {vsLabel}</span></h3>
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
                  <th className="py-3 text-center hidden sm:table-cell">{activeGeo === 'citywide' ? <span>YoY<span className="hidden md:inline ml-3 text-gray-300">|</span><span className="hidden md:inline ml-3">Since '19</span></span> : 'YoY'}</th>
                  <th className="py-3 text-right">{priorYear}</th>
                  <th className="py-3 text-right">{currentYear}</th>
                  <th className="py-3 text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  const rows = trendFilter === 'all' ? parsedData.all : (trendFilter === 'up' ? risingOffenses : fallingOffenses);
                  const maxAbsChange = Math.max(1, ...rows.map(r => Math.abs(r.pct || 0)));
                  return rows.map(item => {
                    const isVolatile = item.prior < VOLATILITY_THRESHOLD;
                    const changeBarW = Math.abs(item.pct || 0) / maxAbsChange * 48;
                    return (
                      <tr key={item.name} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-2.5 font-bold text-sm text-black">{item.name}{isVolatile && <span className="ml-1 text-gray-400">*</span>}</td>
                        <td className="py-2.5 text-center hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-3">
                            <MiniSparkline points={[item.prior, item.current]} minY={0} />
                            {activeGeo === 'citywide' && (() => {
                              const since2019 = crimeHistory.citywide.filter(d => d.y >= 2019).map(d => d[item.name]).filter(v => v != null);
                              if (since2019.length < 2) return <span className="hidden md:inline-block w-[56px]" />;
                              return <span className="hidden md:inline-block"><MiniSparkline points={since2019} width={56} height={18} /></span>;
                            })()}
                          </div>
                        </td>
                        <td className={`py-2.5 text-right tabular-nums text-gray-500 ${isVolatile ? 'opacity-50' : ''}`}>
                          <div className="text-sm">{item.prior.toLocaleString()}</div>
                        </td>
                        <td className={`py-2.5 text-right tabular-nums text-black ${isVolatile ? 'opacity-50' : ''}`}>
                          <div className="text-sm font-black">{item.current.toLocaleString()}</div>
                          {item.currentRate !== null && !isTouristPrecinct && <div className="text-[10px] font-normal text-gray-500">{item.currentRate.toFixed(1)}/100k (CW: {parsedData.citywideRates[item.name]?.toFixed(1)})</div>}
                        </td>
                        <td className={`py-2.5 text-right text-xs font-bold tabular-nums ${item.pct > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 h-[3px] bg-gray-100 rounded-full overflow-hidden flex" style={{ justifyContent: item.pct > 0 ? 'flex-start' : 'flex-end' }}>
                              <div className="h-full rounded-full" style={{ width: `${changeBarW}px`, background: item.pct > 0 ? VC.orange : VC.green }} />
                            </div>
                            <span>{formatPct(item.pct)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
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