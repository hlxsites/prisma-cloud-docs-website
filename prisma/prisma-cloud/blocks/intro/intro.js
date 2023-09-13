import {
    PATH_PREFIX,
    loadLottie, parseFragment, playLottie, render,
} from '../../scripts/scripts.js';
import { fadeOut, removeActive, showRoute } from './utils.js';

// Lottie animations for each categoiry
const LOTTIE_PATHS = [`${window.hlx.codeBasePath}/assets/lottie-infrastructure.json`, `${window.hlx.codeBasePath}/assets/lottie-code.json`, `${window.hlx.codeBasePath}/assets/lottie-runtime.json`];

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

const LOTTIE_TEMPLATE = '<lottie-player loop mode="normal"></lottie-player>';

const TEMPLATE = /* html */ `
<div class="ops-intro">
    <a href="" class="back ops-icon-button">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" focusable="false"><path d="M9.408 0.837c-1.116 1.116-1.116 2.925 0 4.041l14.112 14.112c0.558 0.558 0.558 1.463 0 2.021l-14.112 14.112c-1.116 1.116-1.116 2.925 0 4.041s2.925 1.116 4.041 0l17.143-17.143c1.116-1.116 1.116-2.925 0-4.041l-17.143-17.143c-1.116-1.116-2.925-1.116-4.041 0z"></path></svg>
    </a>
    <div class="ops-intro-header">
    </div>
  <div slot="buttons" class="ops-nav"></div>
</div>
`;

let activeId = 'overview';
let isAnimating = false;

function isMobile() {
  return window.innerWidth < 1024;
}

/**
 * @param {HTMLElement} block the container element
 */
async function renderContent(block) {
  const { lang } = document.documentElement;
  const rows = [...block.querySelectorAll(':scope > div')];
  const overview = rows[0].querySelector(':scope > div');
  const categories = rows[1].querySelectorAll(':scope > div');

  const template = parseFragment(TEMPLATE);
  const buttonsSlot = template.querySelector('[slot="buttons"]');
  const headerSlot = template.querySelector('.ops-intro-header');

  overview.setAttribute('data-category-id', 'overview');
  overview.classList.add('header-section', 'is-active');
  headerSlot.append(overview);

  categories.forEach((category, index) => {
    const _fragment = parseFragment(TEMPLATE_BUTTON);
    const root = _fragment.querySelector('.ops-nav-item');
    const title = category.querySelector('h1');
    const id = title.getAttribute('id');
    title.setAttribute('id', ''); // Remvove id so hash anchor link doesnt trigger

    root.setAttribute('data-category-id', id);
    const titleSpan = _fragment.querySelector('.ops-nav-item-title');
    titleSpan.textContent = title.textContent;
    buttonsSlot.append(_fragment);

    category.setAttribute('data-category-id', id);
    category.classList.add('header-section');
    const position = document.createElement('span');
    position.classList.add('position');
    position.append(`0${index + 1}`);
    category.prepend(position);
    const categoryContentWrapper = document.createElement('div');
    categoryContentWrapper.classList.add('content-wrapper');
    // Wrap data in franklin in container element
    categoryContentWrapper.append(parseFragment(category.innerHTML));
    category.innerHTML = '';
    // Add lottie player
    const lottieTemplate = parseFragment(LOTTIE_TEMPLATE);
    category.append(lottieTemplate);
    category.append(categoryContentWrapper);
    headerSlot.append(category);

    // Add events
    const player = category.querySelector('lottie-player');
    player.addEventListener('rendered', () => {
      // Load via URL
      player.load(LOTTIE_PATHS[index]);
      console.log('LOTTIE_PATHS[index]: ', LOTTIE_PATHS[index]);
    });

    root.addEventListener('mouseenter', (e) => {
      if (isMobile()) {
        return;
      }
      loadLottie();
      const targetEl = e.target.closest('button');
      const targetId = targetEl.getAttribute('data-category-id');
      //   console.group();
      //   console.log('targetId: ', targetId);
      //   console.log('activeId: ', activeId);
      //   console.log('isAnimating: ', isAnimating);
      //   console.groupEnd();
      if (activeId === targetId && !isAnimating) {
        return;
      }
      activeId = targetId;
      isAnimating = true;
      const activeSection = headerSlot.querySelector('.is-active');

      activeSection.style.opacity = 0;

      playLottie(player);

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
    if (isMobile()) {
      return;
    }
    isAnimating = true;

    const activeSection = headerSlot.querySelector('.is-active');
    activeSection.style.opacity = 0;

    const player = activeSection.querySelector('lottie-player');
    if (player) {
      player.pause();
    }

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

    window.location.hash = targetId;
    return null;
  });

  // const template = parseFragment(TEMPLATE);
  const fragment = document.createElement('div');

  const backButton = template.querySelector('.back');
  backButton.href = `${PATH_PREFIX}/${lang}`;

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
      // Fade out current view
      const currentRoute = document.querySelector('.is-current-route');

      const player = currentRoute.querySelector('lottie-player');

      if (player) {
        player.pause();
      }

      fadeOut(currentRoute, () => {
        // Fade in new view
        showRoute(hash);
        // Reset to default state
        activeId = 'overview';
        isAnimating = false;
      });

      if (!hash) {
        // fade out category container
        const categoriesContainer = document.querySelector('.category-container');
        fadeOut(categoriesContainer, null, 'is-active');
        removeActive('.ops-category-nav-buttons');
      }
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
