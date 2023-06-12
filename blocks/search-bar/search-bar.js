/* global Coveo */
import { getMetadata, loadCSS } from '../../scripts/lib-franklin.js';

const TAG_NAME = 'search-bar';
const COVEO_BUNDLE_VERSION = 'v2.10082';
const BUNDLE_PATH = (ext) => `/blocks/search-bar/coveo-search-${COVEO_BUNDLE_VERSION}.min.${ext}`;

const TEMPLATE = /* html */`
<div class="search-bar">
  <div class="dropdown">
    <button id="selected-button" class='dropbtn'>All Prisma Cloud Documentation</button>
    <div class="dropdown-content" style="display: none;">
      <a class="coveo-dropdown-item selected" data-label="All Prisma Cloud Documentation" data-value="@panproductcategory==('Prisma Cloud')">All Prisma Cloud Documentation</a>
      <a class="coveo-dropdown-item" data-label="All Documentation" data-value="all">All Documentation</a>
    </div>
  </div>
  <div id="searchbox">
    <div class="CoveoAnalytics" data-search-hub="TechDocsPANW_SH"></div>
    <div class="CoveoSearchbox" id="coveo-searchbox"></div>
  </div>
</span>`;

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

    if (docsetMeta && productMeta) {
      const docSetOption = document.createElement('a');
      docSetOption.classList.add('coveo-dropdown-item');
      if (!booknameMeta) {
        this.querySelector('.coveo-dropdown-item.selected').classList.remove('selected');
        docSetOption.classList.add('selected');
        this.querySelector('.dropbtn').textContent = `All ${productMeta} books`;
      }
      docSetOption.setAttribute('data-label', `All ${productMeta} books`);
      docSetOption.setAttribute('data-value', `@td_docsetid==("${docsetMeta}")`);
      docSetOption.append(`All ${productMeta} books`);
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
      import(BUNDLE_PATH('js'))
        .then(resolve)
        .catch(reject);
    }

    return SearchBar._CoveoLoading;
  }

  _initCoveo() {
    const cConfig = this.coveoConfig;
    if (Coveo.SearchEndpoint.defaultEndpoint === undefined) {
      const searchBoxRoot = this.querySelector('#searchbox');
      Coveo.SearchEndpoint.configureCloudV2Endpoint(cConfig.orgID, cConfig.apiKey);
      Coveo.$$(searchBoxRoot).on('newQuery', () => {
        const dropdownSelectedValue = this.querySelector('.coveo-dropdown-item.selected').getAttribute('data-value');
        try {
          if (dropdownSelectedValue !== 'all') {
            Coveo.state(searchBoxRoot, 'hq', dropdownSelectedValue);
            Coveo.state(searchBoxRoot, 'hd', this.querySelector('.coveo-dropdown-item.selected').getAttribute('data-label').trim());
          }
        } catch (error) {
          console.log(error);
        }
      });
      Coveo.initSearchbox(searchBoxRoot, cConfig.searchPageURL);
      const dropDownOpen = this.querySelector('.dropbtn');
      const dropDownLoad = this.querySelector('.dropdown-content');
      dropDownOpen.addEventListener('click', () => {
        if (dropDownLoad.style.display === 'none') {
          dropDownLoad.style.display = 'block';
        } else {
          dropDownLoad.style.display = 'none';
        }
      });

      for (const dropoption of this.querySelectorAll('.coveo-dropdown-item')) {
        dropoption.addEventListener('click', (event) => {
          this.querySelector('.coveo-dropdown-item.selected').classList.remove('selected');
          event.target.classList.add('selected');
          this.querySelector('.dropbtn').textContent = event.target.getAttribute('data-label');
          dropDownLoad.setAttribute('style', 'display : none');
        });
      }
    }
  }
}

export default function decorate(block) {
  block.innerHTML = '<search-bar></search-bar>';
}

(async () => {
  customElements.define(TAG_NAME, SearchBar);
  loadCSS('/blocks/search-bar/search-bar.css');
})();
