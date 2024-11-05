// eslint-disable-next-line import/no-cycle
import { loadCSS, loadScript, sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

async function loadAdobeLaunch() {
  const adobedtmSrc = 'https://assets.adobedtm.com/9273d4aedcd2/6eb97addd328/launch-1dd947b3f935.min.js';

  await loadScript(adobedtmSrc, {
    type: 'text/javascript',
    async: true,
  });
}

async function loadGA() {
  const gaId = 'G-9SEQK7FPPQ';
  const gaSrc = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  await loadScript(gaSrc, {
    type: 'text/javascript',
    async: true,
  });
  // eslint-disable-next-line
  window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } gtag('js', new Date()); gtag('config', gaId);
}

store.emit('delayed:loaded');

loadCSS(`${window.hlx.codeBasePath}/styles/icons.css`);

loadAdobeLaunch();
loadGA();
