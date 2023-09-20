/* global Coveo */
import { getMetadata, loadCSS } from '../../scripts/lib-franklin.js';

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
    <div class="CoveoSearchbox" id="coveo-searchbox"></div>
  </div>
</span>`;

const TEMPLATE_CLOSE_ICON = `
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

// Remove all hyphens from a string
function cleanString(string = '') {
  return string.replace(/-/g, ' ');
}

export class SearchBar extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = TEMPLATE;
    this.root = this.firstElementChild;
    this.coveoConfig = getCoveoConfig();

    // Allow for mutiple search bars to be initiated on one page
    this.flags = {
      hasInit: false,
    };

    this.init();
    this.loadCoveo();
  }

  async loadCoveo() {
    await SearchBar.LoadCoveo();
    this._initCoveo();
  }

  init() {
    const booknameMeta = getMetadata('book-name');
    const productMeta = getMetadata('product');
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
        data-label="${cleanString(option.label)}" 
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
        this.querySelector('.dropbtn').textContent = `All ${cleanString(productMeta)} books`;
      }
      docSetOption.setAttribute('data-label', `All ${cleanString(productMeta)} books`);
      docSetOption.setAttribute('data-value', `@td_docsetid==("${docsetMeta}")`);
      docSetOption.append(`All ${cleanString(productMeta)} books`);
      appendDropdown.prepend(docSetOption);
    }
    if (booknameMeta) {
      const bookOption = document.createElement('a');
      this.querySelector('.coveo-dropdown-item.selected').classList.remove('selected');
      bookOption.classList.add('coveo-dropdown-item');
      bookOption.classList.add('selected');
      this.querySelector('.dropbtn').textContent = booknameMeta;
      bookOption.setAttribute('data-label', cleanString(booknameMeta));
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
    const { orgID, apiKey, searchPageURL } = this.coveoConfig;

    if (Coveo.SearchEndpoint.defaultEndpoint === undefined || !this.flags.hasInit) {
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
}

export default function decorate(block) {
  block.innerHTML = '<search-bar></search-bar>';
}

(async () => {
  customElements.define(TAG_NAME, SearchBar);
  loadCSS(`${window.hlx.codeBasePath}/blocks/search-bar/search-bar.css`);
})();
