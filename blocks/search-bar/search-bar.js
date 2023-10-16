/* global Coveo */
import { getMetadata, loadCSS, readBlockConfig } from '../../scripts/lib-franklin.js';

const TAG_NAME = 'search-bar';
const COVEO_BUNDLE_VERSION = 'v2.10082';
const BUNDLE_PATH = (ext) => `${window.hlx.codeBasePath}/blocks/search-bar/coveo-search-${COVEO_BUNDLE_VERSION}.min.${ext}`;

const TEMPLATE = /* html */ `
<div class="search-bar">
  <div class="dropdown">
    <button id="selected-button" class='dropbtn'>All Documentation</button>
    <svg focusable="false" aria-label="Clear" class="dropdown-arrow icon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <title>Down Arrow</title>
      <path d="M7.79 9.671c-0.867-0.894-2.276-0.894-3.144 0-0.862 0.889-0.862 2.327 0 3.217l8.717 8.988c1.455 1.5 3.817 1.5 5.272 0l8.717-8.988c0.862-0.889 0.862-2.327 0-3.217-0.867-0.894-2.276-0.894-3.144 0l-7.492 7.724c-0.393 0.405-1.043 0.405-1.436 0l-7.492-7.724z"></path>
    </svg>
    <div class="dropdown-content" style="display: none;">
      <a class="coveo-dropdown-item" data-label="All Prisma Cloud Documentation" data-value="@panproductcategory==('Prisma Cloud')">All Prisma Cloud Documentation</a>
      <a class="coveo-dropdown-item selected" data-label="All Documentation" data-value="all">
      All Documentation
      </a>
    </div>
  </div>
  <div class="searchbox">
    <div class="CoveoAnalytics" data-search-hub="TechDocsPANW_SH"></div>
    <div class="CoveoSearchbox" id="coveo-searchbox">
      <div id="placeholder-searchbox">
        <div>
          <svg focusable="false" width="16px" height="16px" enable-background="new 0 0 20 20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Search" class="coveo-search-button-svg">
            <title>Search</title>
            <g fill="currentColor">
              <path class="coveo-magnifier-circle-svg" d="m8.368 16.736c-4.614 0-8.368-3.754-8.368-8.368s3.754-8.368 8.368-8.368 8.368 3.754 8.368 8.368-3.754 8.368-8.368 8.368m0-14.161c-3.195 0-5.793 2.599-5.793 5.793s2.599 5.793 5.793 5.793 5.793-2.599 5.793-5.793-2.599-5.793-5.793-5.793"></path><path d="m18.713 20c-.329 0-.659-.126-.91-.377l-4.552-4.551c-.503-.503-.503-1.318 0-1.82.503-.503 1.318-.503 1.82 0l4.552 4.551c.503.503.503 1.318 0 1.82-.252.251-.581.377-.91.377"></path>
            </g>
          </svg>
        </div>
        <input class="placeholder" placeholder="Search Enterprise Edition" disabled />
      </div>
    </div>
  </div>
</span>`;

const TEMPLATE_CLOSE_ICON = /* html */`
<svg focusable="false" aria-label="Clear" class="magic-box-clear-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <title>Clear</title>
  <path class="ring" fill="none" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="4" stroke-width="4" d="M30 16c0 7.732-6.268 14-14 14s-14-6.268-14-14c0-7.732 6.268-14 14-14s14 6.268 14 14z"></path>
  <path d="M22.41 22.41c0.787-0.787 0.787-2.062 0-2.849l-3.561-3.561 3.56-3.561c0.787-0.787 0.787-2.062 0-2.849s-2.062-0.787-2.849 0l-3.56 3.561-3.56-3.561c-0.787-0.787-2.062-0.787-2.849 0s-0.787 2.062 0 2.849l3.56 3.561-3.561 3.562c-0.787 0.787-0.787 2.062 0 2.849s2.062 0.787 2.849 0l3.561-3.562 3.561 3.561c0.787 0.787 2.062 0.787 2.849 0z"></path>
</svg>
`;

function getCoveoConfig() {
  switch (store.env) {
    case 'prod':
      return {
        apiKey: 'xx1149a803-7b6b-4fd3-b984-cd35445f7494',
        orgID: 'paloaltonetworksintranet',
        searchPageURL: 'https://docs.paloaltonetworks.com/search/',
      };
    default:
      return {
        apiKey: 'xx8731a310-9aee-4aa4-8fab-81967a8f7391',
        orgID: 'paloaltonetworksintranetsandbox2',
        searchPageURL: 'https://dev.docs.paloaltonetworks.com/search/',
      };
  }
}

export class SearchBar extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = TEMPLATE;
    this.root = this.firstElementChild;
    this.coveoConfig = getCoveoConfig();
    /** @type {Promise<HTMLInputElement>} */
    this.inputWhenReady = null;

    // Allow for mutiple search bars to be initiated on one page
    this.flags = {
      hasInit: false,
    };

    this.init();
    this.swapPlaceholderInput();
  }

  async loadCoveo() {
    await SearchBar.LoadCoveo();
    this._initCoveo();
  }

  swapPlaceholderInput() {
    let resolve;
    this.inputWhenReady = new Promise((res) => {
      resolve = res;
    });

    const searchbar = this.querySelector('.search-bar');
    const searchbox = searchbar.querySelector('#coveo-searchbox');

    const observer = new MutationObserver((records, self) => {
      const ready = !!records.find(
        (record) => !![...record.addedNodes]
          .find((node) => node.classList.contains('CoveoOmnibox')),
      );
      if (ready) {
        self.disconnect();
        searchbar.classList.add('coveo-ready');
        resolve(searchbox.querySelector('input:not(.placeholder)'));
      }
    });
    observer.observe(searchbox, { childList: true });
  }

  init() {
    const booknameMeta = getMetadata('book-name');
    const productMeta = getMetadata('docset-title');
    const docsetMeta = getMetadata('docset-id');

    const appendDropdown = this.querySelector('.dropdown-content');

    const defaultOption = this.getAttribute('data-default-option');
    const defaultOptions = this.getAttribute('data-default-options');

    if (defaultOptions) {
      let html = '';
      const options = JSON.parse(defaultOptions);
      options.forEach((option, i) => {
        html += `<a class="coveo-dropdown-item coveo-dropdown-custom-option ${
          i === 0 ? 'selected' : ''
        }" 
        data-label="${option.label}" 
        data-value="${option.category}==('${option.value}')">
        ${option.label}
        </a>
        `;
      });

      appendDropdown.innerHTML = html;
    }
    if (docsetMeta && productMeta) {
      const docSetOption = document.createElement('a');
      docSetOption.classList.add('coveo-dropdown-item');
      if (!booknameMeta) {
        this.querySelector('.coveo-dropdown-item.selected').classList.remove('selected');
        docSetOption.classList.add('selected');
        this.querySelector('.dropbtn').textContent = `All ${productMeta} Books`;
      }
      docSetOption.setAttribute('data-label', `All ${productMeta} Books`);
      docSetOption.setAttribute('data-value', `@td_docsetid==("${docsetMeta}")`);
      docSetOption.append(`All ${productMeta} Books`);
      appendDropdown.prepend(docSetOption);
    }
    if (booknameMeta) {
      const bookOption = document.createElement('a');
      this.querySelector('.coveo-dropdown-item.selected').classList.remove('selected');
      bookOption.classList.add('coveo-dropdown-item');
      bookOption.classList.add('selected');
      this.querySelector('.dropbtn').textContent = booknameMeta;
      bookOption.setAttribute('data-label', booknameMeta);
      bookOption.setAttribute('data-value', `@panbookname==("${booknameMeta}")`);
      bookOption.append(booknameMeta);
      appendDropdown.prepend(bookOption);
    }
    if (defaultOption) {
      const targetOption = this.querySelector(`[data-value="${defaultOption}"]`);

      if (targetOption) {
        this.querySelector('.coveo-dropdown-item.selected').classList.remove('selected');
        targetOption.classList.add('selected');
        this.querySelector('.dropbtn').textContent = targetOption.textContent;
      }
    }

    // load coveo on-demand to avoid the bundle blocking initial page load.
    // this happens either when the store gets a `load:search` event, eg. from header block
    // or when the search bar is entered/touched, eg. on the homepage
    store.once('load:search', () => {
      this.loadCoveo();
    });

    this.addEventListener('mouseenter', () => {
      this.loadCoveo();
    }, { once: true });

    this.addEventListener('touchstart', () => {
      if (this.flags.hasInit) return;
      this.loadCoveo();

      // if the tap completes
      this.addEventListener('touchend', async () => {
        // resubmit the event after placeholder is swapped
        const input = await this.inputWhenReady;
        input.click();
      }, { once: true, passive: true });
    }, { once: true, passive: true });
  }

  static async LoadCoveo() {
    if (!SearchBar._CoveoLoading) {
      let resolve;
      let reject;

      SearchBar._CoveoLoading = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      loadCSS(BUNDLE_PATH('css'));
      import(BUNDLE_PATH('js')).then(resolve).catch(reject);
    }

    return SearchBar._CoveoLoading;
  }

  _initCoveo() {
    if (Coveo.SearchEndpoint.defaultEndpoint !== undefined && this.flags.hasInit) {
      return;
    }

    const { orgID, apiKey, searchPageURL } = this.coveoConfig;

    const searchBoxRoot = this.querySelector('.searchbox');
    Coveo.SearchEndpoint.configureCloudV2Endpoint(orgID, apiKey);
    Coveo.$$(searchBoxRoot).on('newQuery', () => {
      const dropdownSelectedValue = this.querySelector(
        '.coveo-dropdown-item.selected',
      ).getAttribute('data-value');
      try {
        if (dropdownSelectedValue !== 'all') {
          Coveo.state(searchBoxRoot, 'hq', dropdownSelectedValue);
          Coveo.state(
            searchBoxRoot,
            'hd',
            this.querySelector('.coveo-dropdown-item.selected').getAttribute('data-label').trim(),
          );
        } else {
          // eslint-disable-next-line no-undef
          Coveo.state(searchBoxRoot, 'hq', '');
          // eslint-disable-next-line no-undef
          Coveo.state(searchBoxRoot, 'hd', '');
        }
      } catch (error) {
        console.log(error);
      }
    });
    Coveo.initSearchbox(searchBoxRoot, searchPageURL);
    const dropDown = this.querySelector('.dropdown');
    const dropDownOpen = dropDown.querySelector('.dropbtn');
    const dropDownLoad = dropDown.querySelector('.dropdown-content');

    dropDownOpen.addEventListener('click', () => {
      dropDown.classList.toggle('is-active');
      if (dropDownLoad.style.display === 'none') {
        dropDownLoad.style.display = 'block';
      } else {
        dropDownLoad.style.display = 'none';
      }
    });

    // Set default input placeholder for selected item
    const defaultLabel = this.querySelector('.coveo-dropdown-item.selected').getAttribute(
      'data-label',
    );

    const searchInput = this.querySelector('.magic-box-input input');
    searchInput.setAttribute('placeholder', `Search ${defaultLabel}`);

    for (const dropoption of this.querySelectorAll('.coveo-dropdown-item')) {
      dropoption.addEventListener('click', (event) => {
        const label = event.target.getAttribute('data-label');
        this.querySelector('.coveo-dropdown-item.selected').classList.remove('selected');
        event.target.classList.add('selected');
        this.querySelector('.dropbtn').textContent = label;
        dropDownLoad.setAttribute('style', 'display : none');
        dropDown.classList.remove('is-active');

        searchInput.setAttribute('placeholder', `Search ${label}`);
      });
    }

    const updateClearButton = this.querySelector('.magic-box-clear .magic-box-icon');

    if (updateClearButton) {
      updateClearButton.innerHTML = TEMPLATE_CLOSE_ICON;
    }

    const searchBoxInput = this.querySelector('.magic-box-input input');
    searchBoxInput.addEventListener('focus', () => {
      searchBoxRoot.classList.add('is-focused');
    });
    searchBoxInput.addEventListener('blur', () => {
      searchBoxRoot.classList.remove('is-focused');
    });

    this.flags.hasInit = true;
  }
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = `<search-bar \
${config['default-option'] ? `default-option="${config['default-option']}"` : ''}\
${config['default-options'] ? `default-options="${config['default-options']}"` : ''}></search-bar>`;
}

(async () => {
  customElements.define(TAG_NAME, SearchBar);
  loadCSS(`${window.hlx.codeBasePath}/blocks/search-bar/search-bar.css`);
})();
