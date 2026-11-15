/* kocity.cc — shared behaviour for all four tabs.
   Live data: api.kocity.cc (servers, community, activity) and GitHub releases. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const API = {
    servers: 'https://api.kocity.cc/stats/servers',
    community: 'https://api.kocity.cc/api/stats/community',
    activity: 'https://api.kocity.cc/stats/servers/activity',
    releases: 'https://api.github.com/repos/KnockoutCity-Pirate-Radio/PirateRadio-Artifacts/releases?per_page=40',
  };
  const RELEASES_PAGE = 'https://github.com/KnockoutCity-Pirate-Radio/PirateRadio-Artifacts/releases';
  const TCNS_DISCORD = 'https://discord.gg/F8anYfBduR';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    kids.flat().forEach(k => k != null && n.append(k));
    return n;
  };
  const getJSON = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} returned ${res.status}`);
    return res.json();
  };
  const fmt = (n) => Number(n || 0).toLocaleString();

  /* ---------- Icons (decorative; every icon sits beside visible text or a labelled control) ---------- */
  const ICONS = {
    discord: ['solid', '<path d="M20.3 4.4a19.8 19.8 0 0 0-4.9-1.5.07.07 0 0 0-.08.04c-.2.37-.44.86-.6 1.25a18.3 18.3 0 0 0-5.5 0 12.6 12.6 0 0 0-.6-1.25.08.08 0 0 0-.08-.04A19.7 19.7 0 0 0 3.7 4.4a.07.07 0 0 0-.03.03C.5 9 -.3 13.6.1 18.1a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.1 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1-.01-.12l.37-.3a.07.07 0 0 1 .08 0c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08 0l.37.3a.08.08 0 0 1 0 .13c-.6.35-1.22.64-1.88.89a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.23 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03ZM8 15.3c-1.18 0-2.16-1.08-2.16-2.42S6.8 10.5 8 10.5c1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.98 0c-1.19 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42c1.2 0 2.17 1.1 2.15 2.42 0 1.34-.94 2.42-2.15 2.42Z"/>'],
    github: ['solid', '<path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.600-4-1.600-.6-1.400-1.400-1.800-1.400-1.800-1.100-.700.1-.700.1-.700 1.200.1 1.900 1.200 1.900 1.200 1.100 1.800 2.800 1.300 3.500 1 .1-.800.4-1.300.800-1.600-2.700-.300-5.500-1.300-5.500-5.900 0-1.300.5-2.400 1.200-3.200-.1-.300-.5-1.500.1-3.200 0 0 1-.300 3.300 1.200a11.500 11.500 0 0 1 6 0c2.300-1.500 3.300-1.200 3.300-1.200.6 1.700.2 2.900.1 3.200.8.800 1.200 1.900 1.200 3.200 0 4.600-2.800 5.600-5.500 5.900.4.400.8 1.100.8 2.200v3.300c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/>'],
    arrow: ['', '<path d="M5 12h14M13 6l6 6-6 6"/>'],
    home: ['', '<path d="M4 11.5 12 4l8 7.5M6 10v9.5h4.5V14h3v5.5H18V10"/>'],
    download: ['', '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'],
    book: ['', '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M9 7h6"/>'],
    refresh: ['', '<path d="M20 11a8 8 0 0 0-14.3-4.500L4 8M4 4v4h4M4 13a8 8 0 0 0 14.300 4.500L20 16M20 20v-4h-4"/>'],
    tower: ['', '<path d="M9 9h6l3 12M9 9 6 21M12 9V5M8.500 15h7M7.500 19l8-4M16.500 19l-8-4M12 5h.01M15 3l1.500 1.500"/>'],
    key: ['', '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3M14 9l2 2"/>'],
    globe: ['', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'],
    users: ['', '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.800a3.500 3.500 0 0 1 0 6.400M18 14.500a6.500 6.500 0 0 1 3.500 5.500"/>'],
    list: ['', '<path d="M8 6h13M8 12h13M8 18h13M3.500 6h.01M3.500 12h.01M3.500 18h.01"/>'],
    puzzle: ['', '<path d="M10 4a2 2 0 1 1 4 0v2h4v4h2a2 2 0 1 1 0 4h-2v5h-5v-2a2 2 0 1 0-4 0v2H4v-5h2a2 2 0 1 0 0-4H4V6h6z"/>'],
    zap: ['', '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'],
    monitor: ['', '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'],
    check: ['', '<path d="m5 12.500 4.500 4.500L19 7.500"/>'],
    folder: ['', '<path d="M3 6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'],
    cube: ['', '<path d="m12 3 8 4.500v9L12 21l-8-4.500v-9zM12 12l8-4.500M12 12 4 7.500M12 12v9"/>'],
    package: ['', '<path d="m12 3 8 4.500v9L12 21l-8-4.500v-9zM4 7.500l8 4.500 8-4.500M12 12v9M8 5.300l8 4.500"/>'],
    rocket: ['', '<path d="M5 15c-1.500 1.500-2 5-2 5s3.500-.500 5-2M9 15l-3-3a13 13 0 0 1 4-7c3-3 8-3 11-2 1 3 1 8-2 11a13 13 0 0 1-7 4l-3-3M15 9h.01"/>'],
    flask: ['', '<path d="M9 3h6M10 3v6L4.500 19a1.500 1.500 0 0 0 1.300 2.200h12.400a1.500 1.500 0 0 0 1.300-2.200L14 9V3M7.500 15h9"/>'],
    info: ['', '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500h.01"/>'],
    calendar: ['', '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'],
    // Supplied artwork (48px, filled), scaled into the 24px sprite box
    'sign-up': ['solid', '<g transform="scale(.5)"><g><path d="M34.71,42.54c-9.71,7.29-23.19,7.28-32.9-.05.42-4.96,2.18-9.97,5.38-13.71,1.25-1.49,2.74-2.77,4.46-3.78,4.13,3.06,9.55,3.27,13.92.49l-.12.88c-.42,2.86-.43,5.59-.06,8.33l.43,3.17,4.84-.69-.87,4.7,3.27.47c.55.08,1.1.14,1.65.19Z"/><path d="M24.29,22.62c-2.97,2.14-6.75,2.3-9.86.49-5.74-3.34-7.34-11.32-4.29-17.25,1.03-2,2.49-3.59,4.42-4.68,3.23-1.81,7.08-1.54,10.02.7,6.47,4.92,6.44,15.88-.3,20.73Z"/><path d="M45.89,34.29l-5.79-1.08.86,6.06c-2.27.31-4.49.3-6.72.04-.25-.03-.48-.07-.73-.1l.31-1.65.77-4.14-2.14.3-3.91.55c-.3-2.15-.31-4.29-.07-6.41.03-.34.07-.69.12-1.03l5.79,1.07-.85-6.05c2.5-.34,4.97-.3,7.43.06l-1.07,5.79,6.05-.85c.34,2.5.3,4.96-.06,7.43Z"/></g></g>'],
    'server': ['solid', '<g transform="scale(.5)"><g><path d="M6.08,21.49l1.39-9,1.53-1.63,16.81.14,15.51,3.67,1.2,1.76-1.48,8.78,6.97,2.64-4.92,10.03-6.41,6.73-5.33,3.39-21.5-2.83-4.73-5.3L.97,31.34l-.97-9.15,6.08-.7ZM8.73,37.83l2.46,3.16,9.19,2.6h9.01l3.81-2.09,4.04-10.68.88-11.33-1.62-3.16-11.56-2.92h-11.51l-3.25,2.5-2.28,11.33.84,10.58Z"/><polygon points="32.75 24.1 31.31 31.96 27.71 31.54 28.73 23.51 32.75 24.1"/><polygon points="17.45 22.31 16.56 30.36 12.97 29.93 13.4 21.94 17.45 22.31"/><polygon points="25.18 35.03 24.74 37.7 17.75 36.96 17.96 34.26 25.18 35.03"/></g><polygon points="5.91 27.74 4.97 15.87 5.67 16.52 5.91 3.07 2 4.03 3.12 12.94 2 12.55 3.77 28.51 5.91 27.74"/><polygon points=".79 1.68 4.55 0 7.89 2.42 7.46 6.52 3.69 8.2 .36 5.77 .79 1.68"/></g>'],
    'made-with-love': ['solid', '<path transform="scale(.5)" d="M34,4.5l-10.12,6.74-7.16-7.66L0,18.68l14.69,15.6-6.68-.21,16.27,10.34,23.72-26.21-14-13.7ZM6.26,18.54l11.23-7.84,7.22,5.59,7.13-5.76,10.54,8.7-18.33,19.29L6.26,18.54Z"/>'],
    patreon: ['solid', '<path transform="translate(1.44 1.44) scale(.019555)" d="M1033.05 324.45c-.19-137.9-107.59-250.92-233.6-291.7-156.48-50.64-362.86-43.3-512.28 27.2-181.1 85.46-237.99 272.66-240.11 459.36-1.74 153.5 13.58 557.79 241.62 560.67 169.44 2.15 194.67-216.18 273.07-321.33 55.78-74.81 127.6-95.94 216.01-117.82 151.95-37.61 255.51-157.53 255.29-316.38z"/>'],
    'mod-library': ['solid', '<g transform="scale(.5)"><g><path d="M42.03,13.66l-.79,28.4c-1.1,1.09-1.71,1.71-2.8,2.8h-13.95l5.81-2.77-.79-18.02-15.5-8.95-7.54,4.36-.72-16.69c1.09-1.09,1.71-1.71,2.8-2.8h20.13l-.5,14.31,13.85-.65Z"/><g><path d="M31.48,0l-.5,11.49,11.05-.65v-.05C37.91,6.69,35.59,4.12,31.48,0Z"/><polygon points="31.47 0 31.48 0 31.48 0 31.47 0"/></g><path d="M27.49,40.35c-.09-3.54-.61-14.31-.61-14.31l-12.94-7.85L1.52,25.92l.08,15.53,13.39,6.55,12.5-7.65ZM24.65,38.8l-8.36,5.12-.39-9.66,8.26-4.91.48,9.45ZM22.7,26.96l-8.26,4.91-8.69-5.25,8.28-5.2,8.68,5.53ZM4.36,39.76l.05-10.67,8.69,5.25.39,9.66-9.13-4.23Z"/></g></g>'],
    'updates': ['solid', '<g transform="scale(.5)"><g><path d="M48,25.24l-8.73-12.78h-22.36s-8.19,16.39-8.19,16.39l12.34,9.83,11.34-2,9.98,7.74-.53-11.2,6.15-7.97ZM32.74,33.05l-10.89,1.92-9.15-7.51,6.01-12.15h19.1s6.2,9.51,6.2,9.51l-5.15,6.94.68,7.23-6.8-5.93Z"/><polygon points="24.88 9.6 15.45 9.59 9.27 21.5 3.21 25.01 5.42 19.52 0 14.32 6.4 5.63 22.86 5.92 24.88 9.6"/><path d="M31.17,24.75c0,1.33-1.08,2.42-2.42,2.42s-2.41-1.08-2.41-2.42,1.08-2.41,2.41-2.41,2.42,1.08,2.42,2.41Z"/><path d="M24.09,24.84c0,1.09-.88,1.98-1.98,1.98s-1.98-.88-1.98-1.98.89-1.98,1.98-1.98,1.98.89,1.98,1.98Z"/><path d="M37.39,24.85c0,1.09-.89,1.98-1.98,1.98s-1.98-.88-1.98-1.98.89-1.97,1.98-1.97,1.98.88,1.98,1.97Z"/></g></g>'],
    'cross-platform': ['solid', '<g transform="scale(.5)"><g><path d="M48,37.53V4.22H0s0,33.27,0,33.27l18.19.07v2.44s-13.67-.02-13.67-.02l.02,3.78h38.57s.05-3.77.05-3.77h-14.07s.06-2.48.06-2.48l18.85.02ZM5.47,33.29l-.38-24.02,38.16-.91v23.96s-37.78.97-37.78.97Z"/><polygon points="38.64 10.39 23.27 30.6 15.7 30.61 26.04 10.63 38.64 10.39"/><path d="M40.03,19.64l-11.62,10.51c-1.07.2-2.31.28-3.66.26l15.03-17.81.25,7.04Z"/></g></g>'],
    'made-by': ['solid', '<g transform="scale(.5)"><path d="M33.74,42.53c-9.71,7.3-23.21,7.29-32.91-.04.42-4.96,2.18-9.97,5.38-13.71,1.25-1.49,2.74-2.77,4.46-3.78,4.15,3.07,9.6,3.27,13.98.46.79.54,1.53,1.13,2.2,1.78,4.25,3.94,6.34,9.58,6.88,15.29Z"/><path d="M23.31,22.63c-2.97,2.14-6.75,2.3-9.86.49-5.74-3.34-7.34-11.32-4.29-17.25,1.03-2,2.49-3.59,4.42-4.68,3.23-1.81,7.08-1.54,10.02.7,6.47,4.92,6.44,15.88-.3,20.74Z"/><path d="M35.55,44.93l1.34-1.01-.16-1.67c-.4-4.29-1.76-10.09-5.68-14.91,2.73.6,5.64.12,8.15-1.49.69.48,1.34.99,1.93,1.57,3.73,3.45,5.57,8.41,6.04,13.42-3.72,2.81-8.07,4.38-12.51,4.73.3-.21.6-.42.89-.64Z"/><path d="M38.01,23.36c-2.61,1.88-5.93,2.02-8.66.43-.6-.35-1.15-.76-1.65-1.22,2.31-2.76,3.66-6.37,3.71-10.21.04-2.81-.61-5.52-1.84-7.87,2.82-1.53,6.15-1.28,8.7.66,5.69,4.32,5.66,13.95-.26,18.21Z"/></g>'],
    'how-to-play': ['solid', '<g transform="scale(.5)"><path d="M12.62,36.74l11.18,1.95-1.62,9.31-11.18-1.95,1.62-9.31ZM13.99,28.91c.3-1.74.83-3.2,1.56-4.38.74-1.18,1.87-2.17,3.4-2.96l3.58-1.79c.81-.41,1.5-.86,2.08-1.36.57-.5.94-1.22,1.11-2.15.19-1.12-.04-2.03-.69-2.74-.66-.71-1.5-1.16-2.52-1.34l-10.11-1.76L15.92,0l9.04,1.58c2.41.42,4.56,1.11,6.44,2.05,1.88.95,3.42,2.09,4.61,3.42,1.19,1.34,2.03,2.84,2.52,4.51.49,1.67.57,3.45.25,5.32l-.16.94c-.09.49-.25,1.12-.5,1.88-.25.76-.62,1.57-1.11,2.43-.49.86-1.15,1.71-1.96,2.55-.82.85-1.85,1.58-3.11,2.18l-3.43,1.47c-1.09.45-1.92.98-2.48,1.57-.56.59-.92,1.33-1.08,2.23l-.54,3.08-11.18-1.95.76-4.35Z"/></g>'],
    'browse': ['solid', '<g transform="scale(.5)"><g><path d="M26.23,19.44l-7.25,1.69-2.24,6.59,4.9,5.57,7.1-1.27,2.41-7.27-4.92-5.31ZM26.27,27.92l-2.87.92-2.38-2.08.56-2.82,2.99-1.13,2.32,1.91-.61,3.2Z"/><path d="M42.83,1.25l-9.97,2.39-.23,3.31L2.22,17.16l-2.22,5.5.81,4.12,3.5,3.92,15.2-3.19c-.18-.41-.28-.85-.26-1.32,0-.07,0-.14,0-.21.04-.34.07-.78.15-1.11,0-.02.01-.05.02-.07,0-.03.02-.06.03-.09.1-.28.28-.72.42-.98.02-.05.05-.09.08-.13.08-.12.16-.24.25-.35l-13.82,3.14-2.03-2.53.91-3.47,31.26-10.5.41-3.09,3.94-.94,2.76,6.55.72,7.67-3.69,1.2-1.58-1.99-13.03,2.73c.17.12.44.34.34.27.15.12.31.21.44.34.11.11.56.69.64.82.01.02.02.04.04.06.07.13.37.84.41.98,0,.03.02.05.03.08,0,.02,0,.05.01.07.05.35.09.7.14,1.06,0,0,0,.01,0,.02l8.84-1.85,1.67,2.33,9.38-3.06-1.08-11.47-4.09-10.41Z"/><polygon points="18.33 28.91 12.61 45.22 14.69 46.75 23.56 31.67 18.33 28.91"/><polygon points="29.53 28.91 35.25 45.22 33.17 46.75 24.29 31.67 29.53 28.91"/><polygon points="40.67 21.28 37.15 14.35 36.93 6.8 36.69 7 36.69 6.99 34.16 6.72 34.1 14.94 38.34 23.06 40.43 21.47 40.37 21.34 40.67 21.28"/></g><polygon points="7.71 18.89 6.74 23.39 9.45 26.39 12.31 25.81 8.29 23.24 10.56 17.97 7.71 18.89"/></g>'],
    'preview': ['solid', '<g transform="scale(.5)"><path d="M23.53.17C18.62,3.04,3.89,12.1,3.89,12.1l-1.01,24.27,20.48,11.47,21.76-12.13-1.16-23.89L23.53.17ZM23.55,5.36l13.66,7.78-13.27,8.02-13.3-7.81,12.91-7.99ZM8.42,17.26l13.3,7.81-.64,16.28-13.71-7.6,1.06-16.48ZM40.61,33.13l-15.04,8.2.64-16.28,13.27-8.02,1.12,16.1Z"/></g>'],
    'publish': ['solid', '<g transform="scale(.5)"><g><path d="M48,22.97c-.72-3.41-1.88-6.86-2.99-10.38l-5.2,6.38-5.05-3.68-2.31,1.79-5.9,5.21-12.87-5.3-6.21,3.07L0,14.06l.12,11.89,11.7,8.3.43,7.82,11.82.05,4.26,3.12,7.02-.56,2.71-3.9,6.99-.92,1.95-6.71-3.2.32s2.8-4.34,4.21-10.51ZM41.65,37.37l-5.88.76-2.46,3.63-4.45.2-4.11-2.76-9.59-.09c-.32-.5-.32-1.15-.1-1.63l9.19.33c-7.72-3.53-14.19-7.83-20.59-12.85l.08-5.04,4.3,3.8,6.6-1.71,13.66,4.62c2.21-2.25,4.19-4.25,6.6-6.34l4.87,3,3.35-4.65,1.36,4.75c-1.56,5.05-4.08,9.65-7.91,13.32l5.65-.85c.21.49-.05,1.2-.56,1.52Z"/><path d="M25.72,38.32l2.85,2.5,4.26.18h0c.06-.1,1-1.62,1.63-2.85-2.77,1.49-5.56,1-8.75.17Z"/><path d="M34.39,26.23c-2.11.88-3.13,2.46-4.71,3.53l-11.98-3.61,12.36,7.47,4.33-7.39Z"/></g><polygon points="38.94 18.94 28.74 3.26 33.45 18.94 38.94 18.94"/><polygon points="16.87 18.94 6.68 3.26 11.39 18.94 16.87 18.94"/><polygon points="29.16 22.61 18.97 6.94 23.68 22.61 29.16 22.61"/></g>'],
    steam: ['', '<circle cx="12" cy="12" r="9"/><circle cx="15" cy="9.500" r="2.200"/><path d="m3.500 13.500 5 2M12.800 10.800l-2.800 4"/><circle cx="8.800" cy="16" r="1.800"/>'],
  };
  const sprite = Object.entries(ICONS).map(([id, [, body]]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${body}</symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${sprite}</svg>`);
  const icon = (name, extra = '') => {
    const cls = `i ${ICONS[name]?.[0] || ''} ${extra}`.trim();
    const t = document.createElement('template');
    t.innerHTML = `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
    return t.content.firstChild;
  };
  // <i data-i="name"></i> placeholders in the HTML become SVG icons
  $$('[data-i]').forEach(ph => ph.replaceWith(icon(ph.dataset.i)));

  /* ---------- Scroll reveal ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(n => io.observe(n));
    // shortcut: fires at 80% of the section visible, so it never fires if the section is much taller than the screen; lower the threshold if that happens
    const roll = $('.cta.roll');
    // One eased value drives travel and spin, so they slow to a stop together (the sprite frames loop in CSS)
    const rollIn = () => {
      const ball = $('.cta-ball', roll), dur = 6000, dist = innerWidth;
      const turn = dist / (ball.offsetWidth / 2); // radians a ball this size turns over that distance
      // The ball is parked a full screen-width right of its resting spot, so the first stretch of the roll is
      // off-screen. Start the clock already past that stretch, so it appears at once on the same motion curve.
      const rest = ball.getBoundingClientRect().left - dist;
      const t0 = performance.now() - dur * (1 - Math.cbrt(Math.min(1, Math.max(0, (innerWidth - rest) / dist))));
      const tick = (now) => {
        const t = Math.min((now - t0) / dur, 1), left = (1 - t) ** 3; // ease-out: share of the trip still to go
        ball.style.transform = `translateX(${left * dist}px) rotate(${left * turn}rad)`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (roll) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { rollIn(); o.disconnect(); } }, { threshold: 0.8 }).observe(roll);
  } else {
    $$('.reveal, .cta.roll').forEach(n => n.classList.add('in'));
  }

  /* ---------- Hero screenshot: tilts toward the pointer; click opens it flat in a dialog ---------- */
  const shot = $('.hero-shot'), view = $('.shot-view');
  if (shot && view) {
    if (!reduced) {
      shot.addEventListener('pointermove', (e) => {
        const r = shot.getBoundingClientRect();
        shot.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`);
        shot.style.setProperty('--rx', `${(0.5 - (e.clientY - r.top) / r.height) * 12}deg`);
      });
      shot.addEventListener('pointerleave', () => { shot.style.removeProperty('--ry'); shot.style.removeProperty('--rx'); });
    }
    // View Transitions morph the image between its hero spot and the dialog; without them it just opens
    const morph = (fn) => (!reduced && document.startViewTransition) ? document.startViewTransition(fn) : fn();
    shot.addEventListener('click', () => morph(() => view.showModal()));
    view.addEventListener('click', () => morph(() => view.close())); // image, backdrop or close button
  }

  /* ---------- Steam deep link with web fallback ---------- */
  $$('a[data-steam]').forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    const web = a.href;
    window.location.href = a.dataset.steam;
    setTimeout(() => { if (!document.hidden) window.open(web, '_blank', 'noopener'); }, 1500);
  }));

  /* ---------- Community stats ---------- */
  const setStat = (key, value) => {
    $$(`[data-stat="${key}"]`).forEach(n => { n.textContent = value; });
    $$(`[data-stat-plural="${key}"]`).forEach(n => { n.textContent = value === '1' ? '' : 's'; }); // "1 server" / "2 servers"
  };
  async function loadCommunity() {
    try {
      const d = await getJSON(API.community);
      setStat('accounts', fmt(d.totalUsers));
      if (d.onlinePlayers != null) setStat('online', fmt(d.onlinePlayers));
      if (d.onlineServers != null) setStat('servers', fmt(d.onlineServers));
    } catch (err) { console.warn(err); }
  }

  /* ---------- Live servers ---------- */
  const isTCNS = (s) => /tcns|city never sleeps/i.test(s.name || '');
  const safeUrl = (u) => {
    if (!u) return null;
    try { const url = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
  };

  function renderServerRows(tbody, servers) {
    tbody.replaceChildren();
    if (!servers.length) {
      tbody.append(el('tr', {}, el('td', { className: 'msg', colSpan: 4, textContent: 'No servers are listed right now. Check back soon!' })));
      return;
    }
    servers.forEach(s => {
      const online = s.status === 'online';
      const name = el('div', { className: 'srv-name' });
      if (isTCNS(s)) name.append(el('img', { src: 'assets/tcns-server-icon.png', alt: '', width: 34, height: 34 }));
      const label = el('div', {}, isTCNS(s) ? el('a', { href: 'tcns.html', textContent: s.name || 'TCNS' }) : document.createTextNode(s.name || 'Unknown'));
      if (isTCNS(s)) label.append(el('small', { textContent: 'The City Never Sleeps' }));
      name.append(label);
      const state = el('span', { className: 'state' }, el('span', { className: `dot${online ? ' on' : ''}` }), online ? 'Online' : 'Offline');
      tbody.append(el('tr', { className: online ? '' : 'off' },
        el('td', {}, name),
        el('td', { textContent: s.region || '—' }),
        el('td', {}, state),
        el('td', { className: 'num', textContent: online ? `${fmt(s.players)} / ${fmt(s.maxPlayers)}` : '—' }),
      ));
    });
  }

  function renderTCNS(servers) {
    const s = servers.find(isTCNS);
    const online = s && s.status === 'online';
    $$('[data-tcns="state"]').forEach(n => {
      n.replaceChildren(el('span', { className: `dot${online ? ' on' : ''}` }), s ? (online ? 'Online now' : 'Offline right now') : 'Status unavailable');
    });
    if (!s) return;
    $$('[data-tcns="players"]').forEach(n => { n.textContent = online ? fmt(s.players) : '0'; });
    $$('[data-tcns="max"]').forEach(n => { n.textContent = fmt(s.maxPlayers); });
    $$('[data-tcns="region"]').forEach(n => { n.textContent = s.region || '—'; });
    const discord = safeUrl(s.discordUrl);
    if (discord && /^https:\/\/(www\.)?discord\.(gg|com)\//.test(discord)) $$('a[data-tcns-discord]').forEach(a => { a.href = discord; });
  }

  async function loadServers(btn) {
    const tbody = $('[data-server-list]');
    btn?.classList.add('spin');
    try {
      const servers = await getJSON(API.servers);
      const list = (Array.isArray(servers) ? servers : []).sort((a, b) =>
        (b.status === 'online') - (a.status === 'online') || (b.players || 0) - (a.players || 0));
      if (tbody) renderServerRows(tbody, list);
      renderTCNS(list);
      setStat('servers', fmt(list.filter(s => s.status === 'online').length));
      setStat('online', fmt(list.reduce((n, s) => n + (s.status === 'online' ? s.players || 0 : 0), 0)));
    } catch (err) {
      console.warn(err);
      tbody?.replaceChildren(el('tr', {}, el('td', { className: 'msg', colSpan: 4, textContent: "Couldn't load servers right now. Try refreshing." })));
      $$('[data-tcns="state"]').forEach(n => n.replaceChildren(el('span', { className: 'dot' }), 'Status unavailable'));
    } finally {
      setTimeout(() => btn?.classList.remove('spin'), 400);
    }
  }
  $$('[data-refresh]').forEach(btn => btn.addEventListener('click', () => loadServers(btn)));

  /* ---------- Peak hours chart ---------- */
  const hourLabel = (h) => (h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`);
  async function loadActivity() {
    const host = $('[data-activity]');
    if (!host) return;
    try {
      const d = await getJSON(API.activity);
      if (!d.hours?.length || d.dataPoints < 1) throw new Error('no activity data');
      const hours = [...d.hours].sort((a, b) => a.hour - b.hour);
      const max = Math.max(...hours.map(h => h.avgPlayers), 1);
      const peak = hours.reduce((a, b) => (b.avgPlayers > a.avgPlayers ? b : a));
      const nowET = parseInt(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }), 10) % 24;

      const bars = el('div', { className: 'bars', role: 'img' });
      bars.setAttribute('aria-label', `Average players by hour last week, Eastern Time. Busiest around ${hourLabel(peak.hour)} with about ${peak.avgPlayers} players.`);
      hours.forEach((h, i) => {
        const bar = el('div', { className: `bar${h.hour === nowET ? ' now' : ''}`, tabIndex: 0 },
          el('i'), el('span', { textContent: `${hourLabel(h.hour)} · ~${h.avgPlayers} players` }));
        bar.style.setProperty('--h', `${Math.max((h.avgPlayers / max) * 100, 2)}%`);
        bar.style.setProperty('--n', i);
        bars.append(bar);
      });
      const axis = el('div', { className: 'axis' }, [0, 3, 6, 9, 12, 15, 18, 21].map(h => el('span', { textContent: hourLabel(h) })));
      axis.setAttribute('aria-hidden', 'true');
      const note = el('p', { className: 'chart-note' }, 'Busiest around ', el('b', { textContent: `${hourLabel(peak.hour)} ET` }),
        ` (about ${peak.avgPlayers} players on average). `, el('span', { className: 'legend', textContent: 'Current hour' }));
      host.replaceChildren(
        el('div', { className: 'chart-head' }, el('b', { textContent: 'Peak hours' }), el('span', { textContent: 'Last week · Eastern Time' })),
        bars, axis, note);
    } catch (err) {
      console.warn(err);
      host.replaceChildren(el('p', { className: 'chart-note', textContent: 'Peak-hour data is unavailable right now.' }));
    }
  }

  /* ---------- GitHub releases: versions, downloads, release notes ---------- */
  const PLATFORMS = {
    windows: { label: 'Windows', match: /_x64-setup\.exe$/ },
    macos: { label: 'macOS', match: /_aarch64\.dmg$/ },
    linux: { label: 'Linux AppImage', match: /_amd64\.AppImage$/ },
    deb: { label: 'Linux .deb', match: /_amd64\.deb$/ },
    rpm: { label: 'Linux .rpm', match: /\.x86_64\.rpm$/ },
  };
  const detectOS = () => {
    const ua = `${navigator.userAgentData?.platform || ''} ${navigator.userAgent}`;
    if (/android|iphone|ipad/i.test(ua)) return null;
    if (/win/i.test(ua)) return 'windows';
    if (/mac/i.test(ua)) return 'macos';
    if (/linux|x11/i.test(ua)) return 'linux';
    return null;
  };

  async function getReleases() {
    const KEY = 'kocity-releases-v1';
    try {
      const cached = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (cached && Date.now() - cached.t < 10 * 60 * 1000) return cached.d;
    } catch { /* storage unavailable */ }
    const raw = await getJSON(API.releases);
    const d = raw.map(r => ({
      tag: r.tag_name, pre: r.prerelease, url: r.html_url, body: r.body || '', date: r.published_at,
      assets: r.assets.filter(a => !a.name.endsWith('.sig')).map(a => ({ name: a.name, url: a.browser_download_url })),
    }));
    try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d })); } catch { /* ignore */ }
    return d;
  }

  // Minimal, safe renderer for the release-note markdown (headings, bullets, **bold**, `code`)
  function inline(text) {
    const frag = document.createDocumentFragment();
    text.replace(/\\`/g, '`').split(/(\*\*[^*]+\*\*|`[^`]+`)/).forEach(part => {
      if (/^\*\*.+\*\*$/.test(part)) frag.append(el('strong', { textContent: part.slice(2, -2) }));
      else if (/^`.+`$/.test(part)) frag.append(el('code', { textContent: part.slice(1, -1) }));
      else if (part) frag.append(part);
    });
    return frag;
  }
  function renderNotes(host, rel, maxItems = 7) {
    const out = document.createDocumentFragment();
    let ul = null, items = 0, truncated = false;
    for (const line of rel.body.split(/\r?\n/).map(l => l.trim()).filter(Boolean)) {
      if (items >= maxItems) { truncated = true; break; }
      if (/^#{1,6}\s/.test(line)) { ul = null; out.append(el('h4', { textContent: line.replace(/^#+\s*/, '') })); }
      else if (/^[-*]\s/.test(line)) { if (!ul) { ul = el('ul'); out.append(ul); } ul.append(el('li', {}, inline(line.slice(2)))); items++; }
      else if (!/^see the assets/i.test(line)) { ul = null; out.append(el('p', {}, inline(line))); items++; }
    }
    if (!out.childNodes.length) out.append(el('p', { textContent: 'No notes were published for this build.' }));
    const date = rel.date ? new Date(rel.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const foot = el('p', { className: 'notes-foot' },
      el('a', { className: 'text-link', href: rel.url, rel: 'noopener', textContent: truncated ? 'Read the full release notes ' : 'View this release on GitHub ' }, icon('arrow')),
    );
    host.replaceChildren(out, foot);
    if (date) $$('[data-release-date]', host.closest('[data-product]') || document).forEach(n => { n.textContent = date; });
  }

  async function loadReleases() {
    const scopes = $$('[data-product]');
    if (!scopes.length) return;
    let releases = [];
    try { releases = await getReleases(); } catch (err) { console.warn(err); }
    const os = detectOS();

    scopes.forEach(scope => {
      const product = scope.dataset.product; // "launcher" | "labs"
      const mine = releases.filter(r => r.tag.startsWith(`${product}-v`));
      // Launcher: newest stable build. Labs: newest build (currently a public beta).
      const rel = (scope.dataset.channel === 'stable' ? mine.find(r => !r.pre) : mine[0]) || mine[0];
      const version = rel ? rel.tag.replace(`${product}-`, '') : null;

      $$('[data-version]', scope).forEach(n => { if (version) n.textContent = version; });
      const links = {};
      if (rel) Object.entries(PLATFORMS).forEach(([key, p]) => { const a = rel.assets.find(x => p.match.test(x.name)); if (a) links[key] = a.url; });

      $$('a[data-dl]', scope).forEach(a => {
        const url = links[a.dataset.dl];
        if (url) a.href = url; else if (rel) a.closest('[data-dl-item]')?.remove();
      });
      // Primary button follows the visitor's OS when a build exists for it
      $$('a[data-dl-primary]', scope).forEach(a => {
        const pick = links[os] ? os : (links.windows ? 'windows' : Object.keys(links)[0]);
        if (!pick) { a.href = RELEASES_PAGE; return; }
        a.href = links[pick];
        const label = $('[data-dl-label]', a);
        if (label) label.textContent = `Download for ${PLATFORMS[pick].label.replace(' AppImage', '')}`;
      });
      const notes = $('[data-notes]', scope);
      if (notes) {
        if (rel) renderNotes(notes, rel);
        else notes.replaceChildren(el('p', {}, "Couldn't load release notes right now. ", el('a', { href: RELEASES_PAGE, textContent: 'See all releases on GitHub.' })));
      }
    });
  }

  loadCommunity();
  loadServers();
  loadActivity();
  loadReleases();
})();
