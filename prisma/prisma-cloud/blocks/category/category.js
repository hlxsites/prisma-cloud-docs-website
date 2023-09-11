import { parseFragment, render } from '../../scripts/scripts.js';
import { showRoute } from '../intro/utils.js';
import { collapseSection, expandSection } from './utils.js';

const TEMPLATE_BUTTON = `
<div slot="category-button" class="ops-accordion-item">
  <button class="summary">
    <span class="eyebrow">Use Case</span>
    <slot name="teaser"></slot>
  </button>
  <slot name="details" class="accordion-details"></slot>
</div>
`;

const TEMPLATE = /* html */ `
<div class="ops-category">
  <slot name="overview">

  </slot>
  <div slot="buttons" class="ops-accordion"></div>
</div>
`;

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

  const template = parseFragment(TEMPLATE);
  const templateRoot = template.querySelector('.ops-category');
  templateRoot.setAttribute('data-route', `#${categoryRouteId}`);
  const overviewSlot = template.querySelector('slot[name="overview"]');
  overview.classList.add('overview');
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

    buttonsSlot.append(_fragment);

    root.addEventListener('click', (e) => {
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

    index += 1;
  }

  // const template = parseFragment(TEMPLATE);
  const fragment = document.createElement('div');

  // Render with slots
  render(template, fragment);
  // Clear out generated HTML
  block.innerHTML = '';
  block.append(template);
  // localize(block);
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  await renderContent(block);
  // Get current hash, render that view
  const { hash } = window.location;
  showRoute(hash);
}
