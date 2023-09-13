import { playLottie } from '../../scripts/scripts.js';
import { collapseSection } from '../category/utils.js';

export const crossFade = (element, targetElement) => {
  element.style.opacity = 0;

  const transitionOut = () => {
    element.classList.remove('is-active');

    targetElement.classList.add('is-active');

    setTimeout(() => {
      targetElement.style.opacity = 1;
    }, 100);

    // Remove this event listener so it only gets triggered once
    element.removeEventListener('transitionend', transitionOut);
  };

  element.addEventListener('transitionend', transitionOut);
};

export const removeActive = (targetClass) => {
  const activeButton = document.querySelector(`${targetClass} .is-active`);
  if (activeButton) {
    activeButton.classList.remove('is-active');
  }
};

export const fadeOut = (element, callback, targetClass = 'is-current-route') => {
  element.style.opacity = 0;

  const transitionOut = () => {
    element.classList.remove(targetClass);
    element.classList.remove('stagger-transitions');

    // Remove this event listener so it only gets triggered once
    element.removeEventListener('transitionend', transitionOut);

    if (callback) {
      callback();
    }
  };

  element.addEventListener('transitionend', transitionOut);
};

export const fadeIn = (element, targetClass = 'is-current-route') => {
  if (!element) {
    return;
  }
  element.classList.add(targetClass);

  setTimeout(() => {
    element.style.opacity = 1;
    element.classList.add('stagger-transitions');
  }, 100);
};

export const showRoute = (hash) => {
  let targetCategory = null;
  if (!hash) {
    targetCategory = document.querySelector('.intro-container');
    const headers = document.querySelectorAll('.header-section');
    if (headers) {
      // Rest to intial page state
      headers.forEach((item, i) => {
        item.removeAttribute('style');
        item.classList.remove('is-active');
        if (i === 0) {
          item.classList.add('is-active');
        }
      });
    }
    window.scrollTo({ top: 0 });
  } else {
    const categoriesContainer = document.querySelector('.category-container');
    targetCategory = document.querySelector(`[data-route="${hash}"]`);

    // Reset accordions
    const openAccordions = categoriesContainer.querySelectorAll('[slot="category-button"][data-collapsed="false"]');
    if (openAccordions.length > 0) {
      openAccordions.forEach((item) => {
        const detailsSlot = item.querySelector('.accordion-details');
        collapseSection(detailsSlot);
        item.setAttribute('data-collapsed', true);
      });
    }

    removeActive('.ops-category-nav-buttons');
    const desktopNav = document.querySelector('.ops-category-nav');
    if (desktopNav) {
      const targetButton = desktopNav.querySelector(`[data-category-nav-route="${hash}"]`);
      if (targetButton) {
        targetButton.classList.add('is-active');
      }
    }

    // Play animation
    if (targetCategory) {
      const player = targetCategory.querySelector('lottie-player');
      playLottie(player);
    }

    // Update mobile nav
    const mobileNav = categoriesContainer.querySelector('.ops-category-nav-mobile');
    if (mobileNav) {
      const drawer = mobileNav.querySelector('.drawer');
      const nodes = Array.prototype.slice.call(drawer.children);
      const targetItem = mobileNav.querySelector(`[data-category-nav-route="${hash}"]`);
      if (targetItem) {
        const nodeIndex = nodes.indexOf(targetItem);
        const title = mobileNav.querySelector('.title');
        title.textContent = targetItem.textContent;
        title.setAttribute('data-index', `0${nodeIndex + 1}`);
        drawer.classList.remove('is-active');
      }
    }

    fadeIn(categoriesContainer, 'is-active');
    window.scrollTo({ top: 0 });
  }
  fadeIn(targetCategory);
};
