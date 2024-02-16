/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import {
  BRANCH_ORIGIN,
  DOCS_ORIGINS,
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
  } else if (!href.endsWith('.plain.html')) {
    href = `${href}.plain.html`;
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
        // add /docs/ prefix if missing
        const pathname = imageURL.pathname.startsWith('/docs/') ? imageURL.pathname : `/docs${imageURL.pathname}`;
        image.src = `${store.docsOrigin}${pathname}${imageURL.search}`;
      }

      const picture = image.parentElement;
      if (picture.tagName === 'PICTURE') {
        const [baseUrl] = image.src.split('?');
        for (const source of picture.querySelectorAll('source')) {
          const search = source.srcset.split('?')[1];
          source.srcset = `${baseUrl}?${search}`;
        }
      }
    }
  }

  await decorateMain(main);
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
    const url = new URL(
      !href.startsWith('/') && !href.startsWith('.')
        ? href
        : `${DOCS_ORIGINS[store.env]}${href}`,
    );
    setBranch(url, store.branch, true);
    href = url.toString();
  }

  const fragment = await loadFragment(href, fromDocs);

  if (fragment) {
    let classes = [];
    let children = [];
    fragment.querySelectorAll(':scope .section').forEach((fragmentSection) => {
      classes = [...classes, ...fragmentSection.classList];
      children = [...children, ...fragmentSection.childNodes];
    });

    block.closest('.section').classList.add(...classes);
    block.closest('.fragment-wrapper').replaceWith(...children);
  }
}
