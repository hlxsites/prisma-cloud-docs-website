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
  decorateBlock,
  loadBlock,
  updateSectionsStatus,
  toClassName,
} from './lib-franklin.js';

// eslint-disable-next-line no-use-before-define
polyfill();

const range = document.createRange();

export const REDIRECTED_ARTICLE_KEY = 'redirected-article';
export const PATH_PREFIX = '/prisma/prisma-cloud';
const LCP_BLOCKS = ['article']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'prisma-cloud-docs-website'; // add your RUM generation information here

const lang = getMetadata('lang') || window.location.pathname.substring(PATH_PREFIX.length).split('/').slice(1)[0] || 'en';
document.documentElement.lang = lang;

export const WEB_ORIGINS = {
  dev: 'http://localhost:3000',
  // dev: 'https://main--prisma-cloud-docs-website--hlxsites.hlx.page',
  preview: 'https://main--prisma-cloud-docs-website--hlxsites.hlx.page',
  publish: 'https://main--prisma-cloud-docs-website--hlxsites.hlx.live',
  prod: '',
};

export const DOCS_ORIGINS = {
  dev: 'http://127.0.0.1:3001',
  // dev: 'https://main--prisma-cloud-docs--hlxsites.hlx.page',
  preview: 'https://main--prisma-cloud-docs--hlxsites.hlx.page',
  publish: 'https://main--prisma-cloud-docs--hlxsites.hlx.live',
  prod: '',
};

export function getPlaceholders() {
  return fetchPlaceholders(`${PATH_PREFIX}/${lang}`);
}

export function isMobile() {
  return window.screen.width < 768;
}

function getEnv() {
  const { hostname } = window.location;
  if (['localhost', '127.0.0.1'].includes(hostname)) return 'dev';
  if (hostname.endsWith('hlx.page')) return 'preview';
  if (hostname.endsWith('hlx.live')) return 'publish';
  return 'prod';
}

const addClasses = (element, classes) => {
  classes.split(',').forEach((c) => {
    element.classList.add(toClassName(c.trim()));
  });
};

/**
 * Sets the branch search param to a given url
 *
 * @param {URL} url
 */
export function setBranch(url) {
  const env = getEnv();

  if (env === 'dev' || env === 'preview') {
    const branch = new URLSearchParams(window.location.search).get('branch');
    if (branch) {
      url.searchParams.append('branch', branch);
      url.protocol = 'https:';
      url.port = '';
      url.host = 'prisma-cloud-docs-production.adobeaem.workers.dev';
    }
  }
}

/** @type {Store} */
const store = new (class {
  constructor() {
    this._json = {
      _l: {},
    };
    this._emitted = {};
    this.env = getEnv();
    this.docsOrigin = DOCS_ORIGINS[this.env];
    this.pageTemplate = getMetadata('template');
    this.additionalBooks = [];
    if (this.pageTemplate === 'book') {
      this.initBook();
    }

    // allow setting body class from page metadata
    // used for simulating templates from documents
    const style = getMetadata('style');
    if (style) {
      addClasses(document.body, style);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  on(ev, handler) {
    const fn = (e) => {
      handler.call(null, e.detail);
    };
    const rm = () => document.removeEventListener(ev, fn);
    document.addEventListener(ev, fn);
    return rm;
  }

  once(ev, handler) {
    let rm = () => {};
    if (this.wasEmitted(ev)) {
      Promise.resolve().then(() => handler.call(null, this._emitted[ev]));
    } else {
      const fn = (data) => {
        handler.call(null, data);
        rm();
      };
      rm = this.on(ev, fn);
    }
    return rm;
  }

  emit(ev, data) {
    document.dispatchEvent(new CustomEvent(ev, { detail: data }));
    this._emitted[ev] = data || null;
  }

  wasEmitted(ev) {
    return this._emitted[ev] !== undefined;
  }

  initBook() {
    this.bookPath = getMetadata('book');
    this.product = getMetadata('product');
    this.docPath = `${PATH_PREFIX}/docs${window.location.pathname.substring(PATH_PREFIX.length)}`;
    this.articleHref = `${this.docsOrigin}${this.docPath}`;

    try {
      this.redirectedArticle = !!sessionStorage.getItem(REDIRECTED_ARTICLE_KEY);
      sessionStorage.removeItem(REDIRECTED_ARTICLE_KEY);
    } catch (_) {
      this.redirectedArticle = window.location.hash.includes(REDIRECTED_ARTICLE_KEY);
      window.location.hash = window.location.hash.replace(REDIRECTED_ARTICLE_KEY, '');
    }

    const makeBookHref = (path) => `${this.docsOrigin}${path}/book`;

    let mainBookTitle;
    this.allBooks = (getMetadata('additional-books') || '').split(';;').map((s) => s.trim()).filter((s) => !!s)
      .map((data) => {
        const [path, title] = data.split(';');

        const book = {
          title,
          href: makeBookHref(path),
        };

        if (path === this.bookPath) {
          mainBookTitle = title;
          book.mainBook = true;
        }

        return book;
      });

    // exclude main book from additionalBooks
    this.additionalBooks = this.allBooks.filter((b) => !b.mainBook);

    this.mainBook = {
      title: mainBookTitle,
      href: makeBookHref(this.bookPath),
    };
  }

  getAllBookLinks() {
    const makeLink = ({ title, href }) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      return a;
    };
    return [
      makeLink(this.mainBook),
      ...this.additionalBooks.map(makeLink),
    ];
  }

  /**
   * @param {string} path
   * @param {string|string[]} [sheets]
   */
  async fetchJSON(path, sheets) {
    let url;
    try {
      url = new URL(`${path}.json`);
    } catch (_) {
      url = new URL(`${window.location.origin}${path}.json`);
    }

    if (sheets) {
      // eslint-disable-next-line no-param-reassign
      sheets = Array.isArray(sheets) ? [...sheets] : [sheets];
      sheets.sort().forEach((sheet) => {
        url.searchParams.append('sheet', sheet);
      });
    }

    if (path.endsWith('book')) {
      setBranch(url);
    }

    const j = this._json;
    const p = url.toString();

    const loaded = j[p];
    if (loaded) {
      return loaded;
    }

    const pending = j._l[p];
    if (pending) {
      return pending;
    }

    j._l[p] = fetch(p)
      .then((resp) => {
        if (!resp.ok) throw Error(`JSON sheet not found: ${p}`);
        return resp.json();
      })
      .then((json) => {
        j[p] = json;
        delete j._l[p];
        return j[p];
      })
      .catch((e) => {
        console.error(e);
      });
    return j._l[p];
  }
})();
window.store = store;

function isValidURL(url, origins) {
  if (url.startsWith('/')) return true;
  const { origin } = new URL(url);
  if (window.location.origin === origin) return true;
  if (Object.values(origins).includes(origin)) return true;
  return false;
}

export function assertValidDocsURL(url) {
  if (!isValidURL(url, DOCS_ORIGINS)) {
    throw Error('invalid origin');
  }
}

export function assertValidWebURL(url) {
  if (!isValidURL(url, WEB_ORIGINS)) {
    throw Error('invalid origin');
  }
}

export function isValidWebURL(url) {
  return isValidURL(url, WEB_ORIGINS);
}

export function isValidDocsURL(url) {
  return isValidURL(url, DOCS_ORIGINS);
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
 * Load book as JSON
 * @param {string} href
 * @returns {Promise<Record<string, unknown>>}
 */
export async function loadBook(href) {
  assertValidDocsURL(href);
  return store.fetchJSON(href, ['default', 'chapters', 'topics']);
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds breadcrumbs block
 */
function buildBreadcrumbsBlock() {
  const link = document.createElement('a');
  if (store.mainBook) {
    link.href = store.mainBook.href;
    link.textContent = store.mainBook.title;
  }
  return buildBlock('breadcrumbs', { elems: [link] });
}

export function renderBreadCrumbs() {
  const section = document.createElement('div');
  section.classList.add('breadcrumbs-container');
  const wrapper = document.createElement('div');
  const breadcrumbs = buildBreadcrumbsBlock();
  wrapper.append(breadcrumbs);
  section.append(wrapper);

  const main = document.querySelector('main');
  main.prepend(section);

  decorateBlock(breadcrumbs);
  loadBlock(breadcrumbs).then(() => {
    updateSectionsStatus(document.querySelector('main'));
  });
}

function buildSideNavBlock() {
  const links = store.additionalBooks.map(({ title, href }) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = title;
    return link;
  });

  return buildBlock('sidenav', { elems: links });
}

export function renderSidenav(contentBlock) {
  const section = contentBlock.closest('div.section');
  const wrapper = document.createElement('div');
  const sidenav = buildSideNavBlock();
  wrapper.append(sidenav);
  section.prepend(wrapper);

  decorateBlock(sidenav);
  loadBlock(sidenav).then(() => {
    updateSectionsStatus(document.querySelector('main'));
  });
}

function buildArticleBlock(articleHref) {
  const link = document.createElement('a');
  link.href = articleHref;
  link.textContent = articleHref;
  return buildBlock('article', { elems: [link] });
}

/**
 * Builds sidenav and article blocks and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildBookSection(main) {
  if (store.pageTemplate !== 'book') return;

  const docMain = document.documentElement.querySelector('main');
  if (main !== docMain) return;

  const section = document.createElement('div');
  section.append(buildArticleBlock(store.articleHref));
  main.prepend(section);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildBookSection(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function decorateLandingSections(main) {
  if (getMetadata('template') === 'landing-product') {
    const h1 = main.querySelector('h1');
    if (h1) {
      const section = document.createElement('div');
      section.classList.add('section-has-h1');
      const container = document.createElement('div');
      container.classList.add('container');

      container.append(h1);
      container.append(document.createElement('hr'));
      section.append(container);

      main.prepend(section);
    }

    const sectionWithAside = main.querySelector('.section.aside-right');
    if (sectionWithAside) {
      const sectionMain = sectionWithAside.querySelectorAll(':scope > div > *:not(.aside)');
      const sectionAside = sectionWithAside.querySelector('.aside');

      const div = document.createElement('div');
      div.classList.add('section-main');
      div.append(...sectionMain);

      const aside = document.createElement('div');
      aside.classList.add('section-aside');
      aside.append(sectionAside);

      sectionWithAside.innerHTML = '';
      sectionWithAside.append(div);
      sectionWithAside.append(aside);
    }

    main.querySelectorAll('.section h3 + p + ul').forEach((h3pul) => {
      h3pul.previousElementSibling.classList.add('is-sibling-of-ul');
    });
  }
}

/**
 * @template {Function} T
 * @param {T} fn
 * @param {number} [time=600]
 * @returns {T}
 */
export function debounce(fn, time = 600) {
  let timer;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    timer = setTimeout(() => fn(...args), time);
  };
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
  decorateLandingSections(main);
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
    if (store.pageTemplate === 'book') {
      // cleanup empty sections
      main.querySelectorAll('div').forEach((section) => {
        if (section.childElementCount === 0) {
          section.remove();
        }
      });
    }
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

function polyfill() {
  if (typeof queueMicrotask === 'undefined') {
    window.queueMicrotask = (fn) => Promise.resolve().then(fn);
  }
}
