/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import {
  assertValidDocsURL,
  assertValidWebURL,
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadBlocks,
} from '../../scripts/lib-franklin.js';

function isValidWebURL(href) {
  try {
    assertValidWebURL(href);
  } catch (_) {
    return false;
  }
  return true;
}

function isValidDocsURL(href) {
  try {
    assertValidDocsURL(href);
  } catch (_) {
    return false;
  }
  return true;
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {Promise<HTMLElement>} The root element of the fragment
 */
async function loadFragment(path) {
  let href = path;
  if (!href) return null;
  if (!href.startsWith('/') && !href.startsWith('.')) {
    if (isValidWebURL(href)) {
      try {
        href = href.slice(new URL(href).origin.length);
      } catch (_) {
        // noop
      }
    } else if (!isValidDocsURL(href)) {
      return null;
    }
  }

  const resp = await fetch(`${href}.plain.html`);
  if (resp.ok) {
    const main = document.createElement('main');
    main.innerHTML = await resp.text();
    decorateMain(main);
    await loadBlocks(main);
    return main;
  }

  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
