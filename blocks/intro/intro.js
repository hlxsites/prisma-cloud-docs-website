import { parseFragment, render } from '../../scripts/scripts.js';
import { fadeOut, showRoute } from './utils.js';

const TEMPLATE_BUTTON = `
<button slot="category-button" class="ops-nav-item">
    <div class="ops-nav-item-wrapper">
        <span class="ops-nav-item-title"></span>
        <svg class="icon icon-arrow" focusable="false" aria-label="Arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="#4799FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 5L19 12L12 19" stroke="#4799FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg> 
    </div>   
</button>
`;

const TEMPLATE = /* html */ `
<div class="ops-intro">
    <div class="ops-intro-header">
    </div>
  <div slot="buttons" class="ops-nav"></div>
</div>
`;

let activeId = 'overview';
let isAnimating = false;

/**
 * @param {HTMLElement} block the container element
 */
async function renderContent(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const overview = rows[0].querySelector(':scope > div');
  const categories = rows[1].querySelectorAll(':scope > div');

  const template = parseFragment(TEMPLATE);
  const buttonsSlot = template.querySelector('[slot="buttons"]');
  const headerSlot = template.querySelector('.ops-intro-header');

  overview.setAttribute('data-category-id', 'overview');
  overview.classList.add('header-section', 'is-active');
  headerSlot.append(overview);

  categories.forEach((category) => {
    const _fragment = parseFragment(TEMPLATE_BUTTON);
    const root = _fragment.querySelector('.ops-nav-item');
    const title = category.querySelector('h1');
    const id = title.getAttribute('id');

    root.setAttribute('data-category-id', id);
    const titleSpan = _fragment.querySelector('.ops-nav-item-title');
    titleSpan.textContent = title.textContent;
    buttonsSlot.append(_fragment);

    category.setAttribute('data-category-id', id);
    category.classList.add('header-section');
    headerSlot.append(category);

    // Add events
    root.addEventListener('mouseenter', (e) => {
      const targetEl = e.target.closest('button');
      const targetId = targetEl.getAttribute('data-category-id');

      if (activeId === targetId && !isAnimating) {
        return;
      }
      activeId = targetId;
      isAnimating = true;
      const activeSection = headerSlot.querySelector('.is-active');

      activeSection.style.opacity = 0;

      const transitionOut = () => {
        console.log('transitionOut', targetId);
        activeSection.classList.remove('is-active');

        const target = headerSlot.querySelector(
          `[data-category-id="${targetId}"]`,
        );

        if (targetId === activeId) {
          target.classList.add('is-active');
          target.style.opacity = 1;
        }

        // Remove this event listener so it only gets triggered once
        activeSection.removeEventListener('transitionend', transitionOut);
        isAnimating = false;
      };

      activeSection.addEventListener('transitionend', transitionOut);
    });
  });

  buttonsSlot.addEventListener('mouseleave', () => {
    isAnimating = true;

    const activeSection = headerSlot.querySelector('.is-active');
    activeSection.style.opacity = 0;

    const transitionOut = () => {
      activeSection.classList.remove('is-active');

      const target = headerSlot.querySelector('[data-category-id="overview"]');
      activeId = 'overview';

      target.classList.add('is-active');
      target.style.opacity = 1;

      // Remove this event listener so it only gets triggered once
      activeSection.removeEventListener('transitionend', transitionOut);
      isAnimating = false;
    };

    activeSection.addEventListener('transitionend', transitionOut);
  });

  buttonsSlot.addEventListener('click', (e) => {
    const targetEl = e.target.closest('button');
    const targetId = targetEl.getAttribute('data-category-id');

    // Franklin dedupes headings by incrementing integer
    // const targetCategory = document
    //   .getElementById(`${targetId}-1`)
    //   .closest('.ops-category');
    // console.log('targetCategory: ', targetCategory);

    // if (!targetCategory) {
    //   return null;
    // }

    // const intro = document.querySelector('.intro-container');
    // crossFade(intro, targetCategory);
    window.location.hash = targetId;
    return null;
  });

  // const template = parseFragment(TEMPLATE);
  const fragment = document.createElement('div');

  // Render with slots
  render(template, fragment);
  // Clear out generated HTML
  block.innerHTML = '';
  block.append(template);
}

function addEvents() {
  window.addEventListener(
    'hashchange',
    () => {
      const { hash } = window.location;
      console.log(window.location);
      // Fade out current view
      const currentRoute = document.querySelector('.is-current-route');
      fadeOut(currentRoute, () => {
        // Fade in new view
        showRoute(hash);
      });
    },
    false,
  );
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  await renderContent(block);
  // Get current hash, render that view
  const { hash } = window.location;
  showRoute(hash);
  addEvents();
}
