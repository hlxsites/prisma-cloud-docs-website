import {
  getMetadata,
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  fetchPlaceholders,
} from './lib-franklin.js';

const range = document.createRange();

export const PATH_PREFIX = '/prisma/prisma-cloud';
const LCP_BLOCKS = ['article']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'prisma-cloud-docs-website'; // add your RUM generation information here

export const DOCS_ORIGINS = {
  dev: 'http://127.0.0.1:3001',
  preview: 'https://main--prisma-cloud-docs--hlxsites.hlx.page',
  publish: 'https://main--prisma-cloud-docs--hlxsites.hlx.live',
  cdn: '',
};

export function getEnv() {
  const { hostname } = window.location;
  if (['localhost', '127.0.0.1'].includes(hostname)) return 'dev';
  if (hostname.endsWith('hlx.page')) return 'preview';
  if (hostname.endsWith('hlx.live')) return 'publish';
  return 'cdn';
}

function assertValidDocsURL(url) {
  if (url.startsWith('/')) return true;
  const { origin } = new URL(url);
  if (Object.values(DOCS_ORIGINS).includes(origin)) return true;
  throw Error('invalid origin');
}

/**
 * Make element from template string
 * @param {string} str
 * @returns {HTMLElement}
 */
export function el(str) {
  const content = typeof str !== 'string' ? '' : str;
  const tmp = document.createElement('div');
  tmp.innerHTML = content;
  return tmp.firstElementChild;
}

/**
 * HTML string template tag
 * @param {string[]} strs
 * @param  {...(string|Element)} params
 */
export function htmlstr(strs, ...params) {
  let res = '';
  strs.forEach((s, i) => {
    const p = params[i];
    res += s;
    if (!p) return;
    if (p instanceof HTMLElement) {
      res += p.outerHTML;
    } else {
      res += p;
    }
  });
  return res;
}

/**
 * HTML element template tag
 * @returns {HTMLElement}
 */
export function html(strs, ...params) {
  return el(htmlstr(strs, ...params));
}

/**
 * Parse HTML fragment
 * @returns {DocumentFragment}
 */
export function parseFragment(fragmentString) {
  return range.createContextualFragment(fragmentString);
}

/**
 * Update template with slotted elements from fragment
 */
export function render(template, fragment) {
  const slottedElements = fragment.querySelectorAll('[slot]');
  for (const slottedElement of slottedElements) {
    const slotName = slottedElement.getAttribute('slot');
    const slots = template.querySelectorAll(`slot[name="${slotName}"]`);
    for (const slot of slots) {
      slot.replaceWith(slottedElement.cloneNode(true));
    }
  }
}

/**
 * Load article as HTML
 * @param {string} path
 * @returns {Promise<Record<string, unknown>>}
 */
async function loadArticle(path) {
  assertValidDocsURL(path);

  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) return null;
  try {
    return await resp.text();
  } catch (e) {
    console.error('failed to parse book: ', e);
    return null;
  }
}

/**
 * Load book as JSON
 * @param {string} path
 * @returns {Promise<Record<string, unknown>>}
 */
async function loadBook(path) {
  assertValidDocsURL(path);

  const resp = await fetch(`${path}.json?sheet=default&sheet=chapters&sheet=topics`);
  if (!resp.ok) return null;
  try {
    return await resp.json();
  } catch (e) {
    console.error('failed to parse book: ', e);
    return null;
  }
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  if (h1) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [h1] }));
    main.prepend(section);
  }
}

/**
 * Builds breadcrumbs block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildBreadcrumbsBlock(main) {
  const section = document.createElement('div');
  section.append(buildBlock('breadcrumbs', ''));
  main.prepend(section);
}

/**
 * Builds sidenav and article blocks and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildBookBlock(main) {
  const template = getMetadata('template');
  if (template !== 'book') return;

  const section = document.createElement('div');
  section.append(buildBlock('sidenav', ''));
  section.append(buildBlock('article', ''));
  main.prepend(section);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildBookBlock(main);
    buildBreadcrumbsBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  // Load article
  const template = getMetadata('template');
  // Fetch book data
  if (template === 'book') {
    const bookName = getMetadata('book-name') || 'book';
    const bookPath = getMetadata('book');
    const origin = DOCS_ORIGINS[getEnv()];

    const docURL = `${origin}${PATH_PREFIX}/docs${window.location.pathname.substring(PATH_PREFIX.length)}`;
    window.article = await loadArticle(docURL);

    const bookURL = `${origin}${bookPath}/${bookName}`;
    // Used in breadcrumbs and sidenav block
    window.book = await loadBook(bookURL);
  }

  // Default to en
  const lang = window.location.pathname.split('/').indexOf('jp') !== -1 ? 'jp' : 'en';
  doc.documentElement.lang = lang;
  await fetchPlaceholders(`${PATH_PREFIX}/${lang}`);

  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
