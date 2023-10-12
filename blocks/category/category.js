import {
  PATH_PREFIX, collapseSection,
  parseFragment, render, showRoute,
} from '../../scripts/scripts.js';

const TEMPLATE_BUTTON = `
<div slot="category-button" class="ops-accordion-item">
  <button class="summary">
    <span class="eyebrow">Use Case</span>
    <slot name="teaser"></slot>
  </button>
  <slot name="details" class="accordion-details"></slot>
  <div class="ops-accordion-item-toggle">
    <span class="ops-accordion-item-toggle-expand">See more outcomes</span>
    <span class="ops-accordion-item-toggle-close">Close outcomes</span>
    <svg focusable="false" aria-label="Clear" class="icon icon-down-arrow" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <title>Down Arrow</title>
      <path d="M7.79 9.671c-0.867-0.894-2.276-0.894-3.144 0-0.862 0.889-0.862 2.327 0 3.217l8.717 8.988c1.455 1.5 3.817 1.5 5.272 0l8.717-8.988c0.862-0.889 0.862-2.327 0-3.217-0.867-0.894-2.276-0.894-3.144 0l-7.492 7.724c-0.393 0.405-1.043 0.405-1.436 0l-7.492-7.724z"></path>
    </svg>
  </div>
</div>
`;

const TEMPLATE = /* html */ `
<div class="ops-category">
  <slot name="overview">

  </slot>
  <div slot="buttons" class="ops-accordion"></div>
</div>
`;

const TEMPLATE_NAV = /* html */ `
<div class="ops-category-nav">
  <a href="" class="back ops-icon-button category-back">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" focusable="false"><path d="M9.408 0.837c-1.116 1.116-1.116 2.925 0 4.041l14.112 14.112c0.558 0.558 0.558 1.463 0 2.021l-14.112 14.112c-1.116 1.116-1.116 2.925 0 4.041s2.925 1.116 4.041 0l17.143-17.143c1.116-1.116 1.116-2.925 0-4.041l-17.143-17.143c-1.116-1.116-2.925-1.116-4.041 0z"></path></svg>
  </a>
  <div class="ops-category-nav-buttons">

  </div>
</div>
`;

const TEMPLATE_MOBILE_NAV = `
<div class="ops-category-nav-mobile">
    <div class="drawer"></div>
    <button class="nav-label selected">
    <span class="title">Secure the Infrastructure</span>
    <svg focusable="false" aria-label="Clear" class="icon icon-down-arrow" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <title>Down Arrow</title>
        <path d="M7.79 9.671c-0.867-0.894-2.276-0.894-3.144 0-0.862 0.889-0.862 2.327 0 3.217l8.717 8.988c1.455 1.5 3.817 1.5 5.272 0l8.717-8.988c0.862-0.889 0.862-2.327 0-3.217-0.867-0.894-2.276-0.894-3.144 0l-7.492 7.724c-0.393 0.405-1.043 0.405-1.436 0l-7.492-7.724z"></path>
    </svg>
    </button>
</div>
`;

const LOTTIE_TEMPLATE = '<lottie-player loop mode="normal"></lottie-player>';

const expandSection = (element) => {
  // Get the height of the element's inner content, regardless of its actual size
  const sectionHeight = element.scrollHeight;

  // Have the element transition to the height of its inner content
  element.style.height = `${sectionHeight}px`;

  // When the next css transition finishes (which should be the one we just triggered)
  element.addEventListener('transitionend', () => {
    // Remove this event listener so it only gets triggered once
    // eslint-disable-next-line no-caller, no-restricted-properties, no-undef
    element.removeEventListener('transitionend', arguments.callee);

    // Remove "height" from the element's inline styles, so it can return to its initial value
    element.style.height = null;
  });

  // Mark the section as "currently not collapsed"
  element.setAttribute('data-collapsed', 'false');
};

function toNodeList(arrayOfNodes, fragment) {
  let items = [];
  arrayOfNodes.forEach((item, i) => {
    items.push(item);
    // Group use case with steps
    if (i % 2) {
      const div = document.createElement('div');
      div.classList.add('row');

      div.append(items?.[0].cloneNode(true));
      div.append(items?.[1].cloneNode(true));
      fragment.append(div);
      items = [];
    }
  });
}

/**
 * @param {HTMLElement} block the container element
 */
async function renderContent(block) {
  const { lang } = document.documentElement;
  const rows = [...block.querySelectorAll(':scope > div')];

  const overview = rows[0].querySelector(':scope > div');
  const overviewTitle = overview.querySelector('h1');
  const categoryId = overviewTitle.getAttribute('id');
  const categoryRouteId = categoryId.substring(0, categoryId.length - 2);
  const head = rows[1].querySelectorAll(':scope > div');
  const headCols = head.length;
  const content = rows.slice(2, rows.length);

  // Create data model from Fraklink's DOM output
  const { store } = content.reduce(
    (ret, row) => {
      const rowCols = row.querySelectorAll(':scope > div');
      const titleRow = row.firstElementChild;
      const title = titleRow.firstElementChild;
      const slug = title?.getAttribute('id');

      if (ret.store.size === 0 || rowCols.length === headCols) {
        // Skip first cell which is the title
        const items = Array.from(row.querySelectorAll(':scope > div:not(:first-child)'));

        ret.store.set(slug, {
          title: title.textContent,
          teaser: titleRow,
          items,
        });
        ret.title = slug;
      } else if (ret.store.has(ret.title)) {
        const items = Array.from(row.querySelectorAll(':scope > div'));
        const values = ret.store.get(ret.title);

        values.items = [...values.items, ...items];
        ret.store.set(ret.title, values);
      }

      return ret;
    },
    {
      store: new Map(),
      title: null,
    },
  );

  console.log('store : ', store);

  /** Prepend category nav */
  const hasCategoryNav = document.querySelector('.ops-category-nav');
  if (!hasCategoryNav) {
    const navTemplate = parseFragment(TEMPLATE_NAV);
    const categoryContainer = document.querySelector('.category-container');
    categoryContainer.prepend(navTemplate);

    // Mobile nav
    const mobileNavTemplate = parseFragment(TEMPLATE_MOBILE_NAV);
    categoryContainer.prepend(mobileNavTemplate);
  }

  // Add category nav button
  const categoryNav = document.querySelector('.ops-category-nav-buttons');
  const mobileNav = document.querySelector('.ops-category-nav-mobile');
  const mobileNavDrawer = mobileNav.querySelector('.ops-category-nav-mobile .drawer');
  const categoryNavLink = document.createElement('a');
  categoryNavLink.textContent = overviewTitle.textContent;
  categoryNavLink.href = `${PATH_PREFIX}/${lang}/operationalize#${categoryRouteId}`;
  categoryNavLink.setAttribute('data-category-nav-route', `#${categoryRouteId}`);
  if (categoryNav && mobileNav) {
    categoryNav.append(categoryNavLink);
    mobileNavDrawer.append(categoryNavLink.cloneNode(true));
  }

  const backButton = document.querySelector('.category-back');
  backButton.href = `${PATH_PREFIX}/${lang}/operationalize#`;

  const template = parseFragment(TEMPLATE);
  const templateRoot = template.querySelector('.ops-category');
  templateRoot.setAttribute('data-route', `#${categoryRouteId}`);
  const overviewSlot = template.querySelector('slot[name="overview"]');
  overview.classList.add('overview');

  // Add lottie player
  const lottieTemplate = parseFragment(LOTTIE_TEMPLATE);
  overview.append(lottieTemplate);

  overviewSlot.replaceWith(overview.cloneNode(true));

  const buttonsSlot = template.querySelector('[slot="buttons"]');
  let index = 0;
  for (const [key, value] of store.entries()) {
    const _fragment = parseFragment(TEMPLATE_BUTTON);
    const root = _fragment.querySelector('[slot="category-button"]');
    root.setAttribute('id', key);
    root.setAttribute('data-collapsed', true);
    root.setAttribute('style', `--index: ${index / 10}s`);

    const teaserSlot = _fragment.querySelector('slot[name="teaser"]');
    teaserSlot.replaceWith(value.teaser.cloneNode(true));

    // Details
    const detailsSlot = _fragment.querySelector('slot[name="details"]');
    toNodeList(value.items, detailsSlot);
    const rowsOfContent = value.items.length / 2;

    buttonsSlot.append(_fragment);

    if (rowsOfContent > 1) {
      root.classList.add('accordion-active');
      root.addEventListener('click', (e) => {
        const anchorEl = e.target.closest('a');
        if (anchorEl) {
          return;
        }
        const rootEl = e.target.closest('[slot="category-button"]');
        const isCollapsed = rootEl.getAttribute('data-collapsed') === 'true';

        if (isCollapsed) {
          expandSection(detailsSlot);
          rootEl.setAttribute('data-collapsed', false);
        } else {
          collapseSection(detailsSlot);
          rootEl.setAttribute('data-collapsed', true);
        }
      });
    }

    index += 1;
  }

  // Make all links open in new tab
  for (const anchorLink of template.querySelectorAll('a')) {
    anchorLink.setAttribute('target', '_blank');
  }

  const toggleDrawer = mobileNav.querySelector('.selected');

  toggleDrawer.addEventListener('click', () => {
    mobileNavDrawer.classList.toggle('is-active');
  });

  // const template = parseFragment(TEMPLATE);
  const fragment = document.createElement('div');

  // Render with slots
  render(template, fragment);
  // Clear out generated HTML
  block.innerHTML = '';
  block.append(template);
  // localize(block);

  // Post-render
  // Add events
  // loadLottie();
  // const player = block.querySelector('lottie-player');
  // player.addEventListener('rendered', () => {
  //   // Load via URL
  //   player.load(LOTTIE_PATHS[categoryRouteId]);
  // });

  // Get current hash, render that view
  const { hash } = window.location;
  showRoute(hash);
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  renderContent(block);
}
