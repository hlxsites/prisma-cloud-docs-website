import {
  assertValidDocsURL,
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadBlocks,
} from '../../scripts/lib-franklin.js';

/**
 * Loads an article.
 * @param {string} path The path or url to the article
 * @returns {Promise<HTMLElement>} The root element of the article
 */
async function loadArticle(path) {
  assertValidDocsURL(path);

  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) return null;

  const main = document.createElement('main');
  main.innerHTML = await resp.text();
  decorateMain(main);
  await loadBlocks(main);
  return main;
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
