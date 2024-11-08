// eslint-disable-next-line import/no-cycle
import { loadCSS, loadScript, sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

async function loadBodyScript(src, attrs) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.text = src;
    if (attrs) {
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const attr in attrs) {
        script.setAttribute(attr, attrs[attr]);
      }
    }
    script.onload = resolve;
    script.onerror = reject;
    document.body.append(script);
  });
}

async function loadAdobeLaunch() {
  const adobedtmSrc = 'https://assets.adobedtm.com/9273d4aedcd2/6eb97addd328/launch-1dd947b3f935.min.js';

  await loadScript(adobedtmSrc, {
    type: 'text/javascript',
    async: true,
  });
}

async function loadGA() {
  const gaId = 'G-9SEQK7FPPQ';
  const gaSrc = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  await loadScript(gaSrc, {
    type: 'text/javascript',
    async: true,
  });
  // eslint-disable-next-line
  window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } gtag('js', new Date()); gtag('config', gaId);
}

async function loadGetFeedback() {
  const src = 'console.log("Load GetFeedback");';
  await loadBodyScript(src, {
    type: 'text/javascript',
  });
}

store.emit('delayed:loaded');

loadCSS(`${window.hlx.codeBasePath}/styles/icons.css`);

loadAdobeLaunch();
loadGA();
loadGetFeedback();
