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

store.emit('delayed:loaded');

loadCSS(`${window.hlx.codeBasePath}/styles/icons.css`);

await loadAdobeLaunch();
