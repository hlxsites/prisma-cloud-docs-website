import { loadCSS } from '../../scripts/lib-franklin.js';

const TAG_NAME = 'card-carousel';
const BUNDLE_PATH = (ext) => `${window.hlx.codeBasePath}/blocks/card-carousel/splide.min.${ext}`;
const TEMPLATE = /* html */ `
<div class="card-carousel">
<section class="splide">
 <div class="splide__track">
<ul class="splide__list">
<li class="splide__slide">
        <a href="/" class="card">
          <span class="chip">Blog</span>
          <h5 class="title">
            <span class="eyebrow">Research Report</span>
            AppSec for the Modern Engineering Ecosystem
          </h5>
        </a>
      </li>
</ul>
  </div>
</section>
</div>
`;

const SPLIDE_CONFIG = {
  arrowPath:
    'M9.408 0.837c-1.116 1.116-1.116 2.925 0 4.041l14.112 14.112c0.558 0.558 0.558 1.463 0 2.021l-14.112 14.112c-1.116 1.116-1.116 2.925 0 4.041s2.925 1.116 4.041 0l17.143-17.143c1.116-1.116 1.116-2.925 0-4.041l-17.143-17.143c-1.116-1.116-2.925-1.116-4.041 0z',
  focus: 0,
  gap: 24,
  heightRatio: 0.3,
  omitEnd: true,
  padding: { right: 0 },
  perPage: 2,
  perMove: 2,
  breakpoints: {
    768: {
      heightRatio: 0.6,
      padding: { right: 0 },
      perPage: 2,
    },
    560: {
      heightRatio: 1,
      perPage: 1,
      perMove: 1,
    },
  },
};

export class CardCarousel extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = TEMPLATE;
    this.root = this.firstElementChild;

    this.flags = {
      blogLoaded: false,
      splideLoaded: false,
    };

    // this.init();
    this.loadSplide();

    store.once('blog:loaded', () => {
      this.flags.blogLoaded = true;
      this._initSplide();
    });
  }

  async loadSplide() {
    await CardCarousel.LoadSplide();
    this.flags.splideLoaded = true;
    this._initSplide();
  }

  static async LoadSplide() {
    if (!CardCarousel._SplideLoading) {
      let resolve;
      let reject;

      CardCarousel._SplideLoading = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      loadCSS(BUNDLE_PATH('css'));
      import(BUNDLE_PATH('js')).then(resolve).catch(reject);
    }

    return CardCarousel._SplideLoading;
  }

  _initSplide() {
    const splideRoot = this.querySelector('.splide');
    const loaded = this.flags.blogLoaded && this.flags.splideLoaded;

    if (loaded && splideRoot) {
      const splide = new window.Splide(splideRoot, SPLIDE_CONFIG);
      splide.mount();
      // Wait a tick and then trigger a refresh on the size
      setTimeout(() => {
        splide.refresh();
      }, 100);
    }
  }
}

export default function decorate(block) {
  block.innerHTML = '<card-carousel></card-carousel>';
}

(async () => {
  customElements.define(TAG_NAME, CardCarousel);
  loadCSS(`${window.hlx.codeBasePath}/blocks/card-carousel/card-carousel.css`);
})();
