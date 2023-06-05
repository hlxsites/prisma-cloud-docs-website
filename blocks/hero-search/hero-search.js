import { debounce, html } from '../../scripts/scripts.js';

/**
 * @param {HTMLInputElement} input
 */
function attachSearch(input) {
  const doSearch = (ev) => {
    if (ev.key === 'ENTER') {
      // TODO: make search call, redirect, etc
    }
  };

  input.addEventListener('input', debounce((ev) => {
    // TODO: autocomplete
  }));

  input.addEventListener('keyup', doSearch);
}

/**
 * @param {HTMLDivElement} block
 */
export default function decorate(block) {
  block.append(html`<input type="text" id="hero-search-input"/>`);

  const section = block.closest('div.section');
  const wrapper = section.querySelector('.hero-search-wrapper');
  const input = block.querySelector('#hero-search-input');

  attachSearch(input);

  wrapper.append(html`<div class="hero-search-background"></div>`);
  section.classList.add('full-width');
  block.classList.add('container');

  const init = (breadcrumbSect) => {
    section.remove();
    breadcrumbSect.insertAdjacentElement('beforebegin', section);
  };

  const prevSib = section.previousElementSibling;
  if (prevSib && prevSib.classList.contains('breadcrumbs-container')) {
    // rearrange now
    init(prevSib);
  } else {
    // wait for breadcrumbs, rearrange when loaded
    const main = document.querySelector('main');
    const observer = new MutationObserver((entries) => {
      const ready = entries.find(
        (entry) => [...entry.addedNodes].find(
          (added) => added.classList.contains('breadcrumbs-container'),
        ),
      );
      if (ready) {
        init(section.previousElementSibling);
        observer.disconnect();
      }
    });
    observer.observe(main, { childList: true });
  }
}
