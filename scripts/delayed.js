// eslint-disable-next-line import/no-cycle
import { loadCSS, sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
store.emit('delayed:loaded');

loadCSS(`${window.hlx.codeBasePath}/styles/icons.css`);
