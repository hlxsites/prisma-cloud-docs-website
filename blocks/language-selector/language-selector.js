import { loadCSS } from '../../scripts/lib-franklin.js';
import { PATH_PREFIX } from '../../scripts/scripts.js';

/**
 * Element that allows a user to toggle the current theme.
 * @extends {HTMLElement}
 * @final
 */
const TAG_NAME = 'language-selector';

const TEMPLATE = `
<div class="language-selector">
    <div class="action">
      <div class="drawer">
            
      </div>
      <button class="selected">
          <span class="title"></span>
          <svg focusable="false" aria-label="Clear" class="icon icon-down-arrow" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <title>Down Arrow</title>
              <path d="M7.79 9.671c-0.867-0.894-2.276-0.894-3.144 0-0.862 0.889-0.862 2.327 0 3.217l8.717 8.988c1.455 1.5 3.817 1.5 5.272 0l8.717-8.988c0.862-0.889 0.862-2.327 0-3.217-0.867-0.894-2.276-0.894-3.144 0l-7.492 7.724c-0.393 0.405-1.043 0.405-1.436 0l-7.492-7.724z"></path>
          </svg>
      </button>
    </div>
</div>
`;

class LanguageSelector extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = TEMPLATE;
  }

  connectedCallback() {
    this.target = this.querySelector('.action');
    this.toggleDrawer = this.querySelector('.selected');
    this.drawer = this.querySelector('.drawer');
    this.selectedTitle = this.toggleDrawer.querySelector('.title');

    if (this.toggleDrawer) {
      this.toggleDrawer.addEventListener('click', () => {
        this.drawer.classList.toggle('is-active');
      });
    }

    this.init();

    document.addEventListener('click', (event) => {
      const isClickInside = this.target.contains(event.target);

      if (!isClickInside) {
        this.close();
      }
    });
  }

  async init() {
    const curLangKey = document.documentElement.lang;

    if (curLangKey === 'not-applicable') {
      this.classList.add('is-disabled');
      return;
    }

    const { languages, langMap } = store.pageTemplate === 'book'
      ? await store.getLocalizationInfo()
      : await store.getNonBookLocalizationInfo();

    this.selectedTitle.textContent = langMap?.[curLangKey];

    // Verify that there are other languages to switch to
    if (!languages) {
      this.classList.add('is-disabled');
      return;
    }

    this.target.addEventListener(
      'mouseenter',
      async () => {
        const { pathname } = window.location;

        // Remove leading slash, lang
        const segments = pathname
          .substring(PATH_PREFIX.length)
          .split('/')
          .slice(2);
        const unlocalizedPath = segments.join('/');

        /**
         * Create url for current page in specefied language
         * @param {string} lang
         * @returns {string}
         */
        const makeHref = (lang) => `${PATH_PREFIX}/${lang}/${unlocalizedPath}`;

        /**
         * Generate anchor link for specfied language
         * @param {string} lang
         * @param {string} title
         * @returns {HTMLElement}
         */
        const makeEntry = (lang, title) => {
          const a = document.createElement('a');

          a.href = makeHref(lang);
          a.textContent = title;
          a.dataset.lang = lang;
          return a;
        };

        const otherLangItems = languages
          .map((lang) => {
            if (lang === curLangKey) {
              return undefined;
            }
            return makeEntry(lang, langMap[lang]);
          })
          .filter((item) => !!item);

        this.drawer.append(...otherLangItems);
      },
      { once: true },
    );
  }

  close() {
    this.drawer.classList.remove('is-active');
  }
}

export default function decorate(block) {
  block.innerHTML = '<language-selector></language-selector>';
}

(async () => {
  customElements.define(TAG_NAME, LanguageSelector);
  loadCSS(
    `${window.hlx.codeBasePath}/blocks/language-selector/language-selector.css`,
  );
})();
