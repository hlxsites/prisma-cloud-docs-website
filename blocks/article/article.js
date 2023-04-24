import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadBlocks,
} from '../../scripts/lib-franklin.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {Promise<HTMLElement>} The root element of the fragment
 */
async function loadArticle(path) {
  // TODO: make sure we only load from specific origins
  // if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  // }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const article = await loadArticle(path);
  if (article) {
    const articleSection = article.querySelector(':scope .section');
    if (articleSection) {
      block.closest('.section').classList.add(...articleSection.classList);
      block.closest('.article-wrapper').replaceWith(...articleSection.childNodes);
    }
  }
}