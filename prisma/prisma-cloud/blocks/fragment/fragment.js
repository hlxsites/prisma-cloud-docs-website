/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import {
  BRANCH_ORIGIN,
  decorateMain,
  isValidDocsURL,
  isValidWebURL,
  setBranch,
} from '../../scripts/scripts.js';

import {
  loadBlocks, updateSectionsStatus,
} from '../../scripts/lib-franklin.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @param {boolean} fromDocs whether the fragment exists in docs repo
 * @returns {Promise<HTMLElement>} The root element of the fragment
 */
async function loadFragment(path, fromDocs) {
  let href = path;
  if (!href) return null;
  if (!href.startsWith('/') && !href.startsWith('.')) {
    if (isValidWebURL(href)) {
      try {
        const url = new URL(href);
        url.pathname += '.plain.html';
        href = url.toString().slice(url.origin.length);
      } catch (_) {
        // noop
      }
    } else if (!isValidDocsURL(href)) {
      return null;
    }
  } else if (fromDocs) {
    const url = new URL(href, store.branch ? BRANCH_ORIGIN : store.docsOrigin);
    url.pathname += '.plain.html';
    href = url.toString();
  }

  const resp = await fetch(href);
  if (!resp.ok) {
    console.warn(`failed to fetch fragment (${resp.status})`, resp);
    return null;
  }

  const text = await resp.text();
  const main = document.createElement('main');
  main.innerHTML = text;

  if (fromDocs) {
    // adjust image urls to point to docs origin
    for (const image of main.querySelectorAll('img')) {
      const imageURL = new URL(image.src);

      if (store.branch) {
        setBranch(imageURL, store.branch);
        image.src = imageURL.toString();
      } else {
        image.src = `${store.docsOrigin}${imageURL.pathname}`;
      }

      const picture = image.parentElement;
      if (picture.tagName === 'PICTURE') {
        for (const source of picture.querySelectorAll('source')) {
          const search = source.srcset.split('?')[1];
          source.srcset = `${image.src}?${search}`;
        }
      }
    }
  }

  decorateMain(main);
  await loadBlocks(main);
  updateSectionsStatus(main);
  return main;
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  let href = link ? link.getAttribute('href') : block.textContent.trim();
  const fromDocs = block.classList.contains('docs');

  if (store.branch) {
    const url = new URL(href);
    setBranch(url, store.branch, true);
    href = url.toString();
  }

  const fragment = await loadFragment(href, fromDocs);

  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
