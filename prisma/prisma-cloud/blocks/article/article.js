import {
  PATH_PREFIX,
  REDIRECTED_ARTICLE_KEY,
  SPA_NAVIGATION,
  decorateMain,
  getPlaceholders,
  loadArticle,
  loadBook,
  parseFragment,
  render,
  renderSidenav,
  setBranch,
} from '../../scripts/scripts.js';

import {
  getMetadata, loadBlocks, updateSectionsStatus,
} from '../../scripts/lib-franklin.js';

const TEMPLATE_ICON_COPY = /* html */ `
<svg class="icon icon-copy" focusable="false" aria-label="Copy" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="icon / 24 / copy">
<mask id="mask0_256_643" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
<rect id="24x24" width="24" height="24"/>
</mask>
<g mask="url(#mask0_256_643)">
<path id="icon" fill-rule="evenodd" clip-rule="evenodd" d="M4 5C4 4.44772 4.44772 4 5 4H14C14.5523 4 15 4.44772 15 5V7H10C8.34315 7 7 8.34315 7 10V15H5C4.44772 15 4 14.5523 4 14V5ZM7 17H5C3.34314 17 2 15.6569 2 14V5C2 3.34315 3.34315 2 5 2H14C15.6569 2 17 3.34315 17 5V7H19C20.6569 7 22 8.34315 22 10V19C22 20.6569 20.6569 22 19 22H10C8.34315 22 7 20.6569 7 19V17ZM10 9H19C19.5523 9 20 9.44771 20 10V19C20 19.5523 19.5523 20 19 20H10C9.44772 20 9 19.5523 9 19V10C9 9.44772 9.44771 9 10 9Z" />
</g>
</g>
</svg>

`;

const TEMPLATE = /* html */ `
  <article class="pan-article">
    <div class="article-actions contain">
      <div class="back-home">
          <a href="#" target="_self" rel="nofollow">
            <svg class="icon icon-logo" focusable="false" aria-label="Home" version="1.1" xmlns="http://www.w3.org/2000/svg" width="27" height="32" viewBox="0 0 27 32">
              <title>prisma-cloud-logo</title>
              <path fill="#54bee4" d="M19.288 6.519l-7.783 14.817h7.783v10.664l-16.088-16 16.088-16v6.519z"></path>
              <path fill="#54bee4" d="M19.288 23.409v-14.817l7.783 14.817h-7.783z"></path>
            </svg>
              Prisma Cloud TechDocs
          </a>
      </div>
      <div class="edit-github">
          <a href="#" target="_blank" rel="nofollow">
              <span class="locale-article-edit-github"></span>
              <i class="icon-share-alt"></i>
          </a>
      </div>
      </div>
      <div class="banner contain">
          <div class="banner-inner">
            <span class="banner-inner-desktop">
              <h2>
                  <span class="locale-article-document">Document:</span>
                  <slot name="document"></slot>
              </h2>
              <span class="title">
                <h1><slot name="title"></slot></h1>
              </span>
              <div class="banner-meta">
                <span class="last-updated">
                Last updated:&nbsp;
                <slot name="time"></slot>
                </span>
              
              <div class="versions">
                    <div class="book-detail-banner-info">
                        <div class="banner-dropdown version-dropdown">
                        <div class="banner-dropdown-menu version-dropdown-menu drawer">
                            <ul>
                            </ul>
                          </div>
                          <button class="version-button">
                              <span slot="version"></span>
                              <div class="icon-container">
                              <svg class="icon icon-arrow-down" focusable="false" aria-label="Expand" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                              <title>down-arrow</title>
                              <path d="M7.79 9.671c-0.867-0.894-2.276-0.894-3.144 0-0.862 0.889-0.862 2.327 0 3.217l8.717 8.988c1.455 1.5 3.817 1.5 5.272 0l8.717-8.988c0.862-0.889 0.862-2.327 0-3.217-0.867-0.894-2.276-0.894-3.144 0l-7.492 7.724c-0.393 0.405-1.043 0.405-1.436 0l-7.492-7.724z"></path>
                              </svg>
                              </div>
                          </button>
                        </div>
                      </div>
                    </div>
                </div>
                </div>
            </span>

            
      </div>
      <div class="content hidden-not-found contain">
          <div class="content-inner">
              <div class="book-content">
                  <slot name="content"></slot>
              </div>
          </div>
      </div>
  </article>
  <div class="article-sidebar">
    <div class="article-outline">
      <span class="article-outline-title">On This Page</span>
      <web-scroll-spy>
        <slot name="outline"></slot>
      </web-scroll-spy>
    </div>
    <theme-toggle></theme-toggle>
  </div>
  `;

/**
 * Add version dropdown
 * @param {Element} wrapper
 */
function initVersionDropdown(wrapper) {
  const versionsContainer = wrapper.querySelector('.article .banner .versions');
  const versionsDropdown = versionsContainer.querySelector('.version-dropdown');
  const versionButton = versionsDropdown.querySelector('.version-button');
  const versionsDropdownMenuContainer = versionsContainer.querySelector('.version-dropdown-menu');
  const curVersionKey = getMetadata('version');

  if (!store.product || curVersionKey === 'not-applicable') {
    versionsContainer.remove();
    return;
  }

  const { lang } = document.documentElement;
  const versionsDropdownMenu = versionsDropdown.querySelector('.version-dropdown-menu ul');

  versionButton.addEventListener('click', () => {
    versionsDropdownMenuContainer.classList.toggle('is-active');
  });

  document.addEventListener('click', (event) => {
    const isClickInside = versionsContainer.contains(event.target);

    if (!isClickInside) {
      versionsDropdownMenuContainer.classList.remove('is-active');
    }
  });

  versionsDropdown.addEventListener(
    'mouseenter',
    async () => {
      const json = await store.fetchJSON(
        `${window.location.origin}${PATH_PREFIX}/${lang}/versions`,
        store.product,
      );

      if (!json) return;

      const curVersion = json.data.find((row) => row.Key === curVersionKey);

      const { pathname } = window.location;
      // rm leading slash, lang, product
      let segments = pathname.substring(PATH_PREFIX.length).split('/').slice(3);
      // if current href has version folder, remove it
      if (curVersion.Folder) {
        segments = segments.slice(1);
      }
      const unversionedPath = segments.join('/');

      const makeHref = (folder) => `${PATH_PREFIX}/${lang}/${store.product}/${folder ? `${folder}/` : ''}${unversionedPath}`;

      const newVersions = json.data
        .map((row) => {
          // exclude current version from dropdown
          if (row.Key === curVersionKey) {
            return undefined;
          }

          const li = document.createElement('li');
          const a = document.createElement('a');
          li.append(a);

          a.href = makeHref(row.Folder);
          a.textContent = row.Title;
          a.dataset.version = row.Folder;

          return li;
        })
        .filter((item) => !!item);

      versionsDropdownMenu.append(...newVersions);
    },
    { once: true },
  );
}

/**
 * @param {HTMLDivElement} block
 */
function localize(block) {
  queueMicrotask(async () => {
    const ph = await getPlaceholders();
    block.querySelector('.locale-article-edit-github').textContent = ph.editOnGithub;
    const articleDoc = block.querySelector('.locale-article-document');
    if (articleDoc) {
      block.querySelector('.locale-article-document').textContent = ph.document;
    }
  });
}

function shouldRedirectMissing() {
  if (store.redirectedArticle) {
    return false;
  }
  const { pathname } = window.location;
  const segments = pathname.substring(PATH_PREFIX.length).split('/').slice(2);
  const version = getMetadata('version');
  return segments.length >= (version === 'not-applicable' ? 4 : 5);
}

async function redirectToFirstChapter() {
  const book = await loadBook(store.mainBook.href);
  if (!book) return;

  const chapter = book.chapters.data[0];
  const version = getMetadata('version');
  const bookKey = book.default.data[0].path.split('/').pop();
  let redirect = `${PATH_PREFIX}/${document.documentElement.lang}/${store.product}/${
    version && version !== 'not-applicable' ? `${version}/` : ''
  }${bookKey}/${chapter.key}/${chapter.key}`;

  if (store.branch) {
    redirect += `?branch=${store.branch}`;
  }

  // set flag to avoid infinite loops on books with bad first chapter/topics
  try {
    sessionStorage.setItem(REDIRECTED_ARTICLE_KEY, 'true');
  } catch (_) {
    redirect += `#${REDIRECTED_ARTICLE_KEY}`;
  }
  window.location.href = redirect;
}

const decorateCodeBlocks = (block) => {
  // Add copy code button
  for (const pre of block.querySelectorAll('pre')) {
    const button = document.createElement('button');
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    const code = pre.querySelector('code');
    button.classList.add('button-copy', 'button-copy-code');
    button.innerHTML = TEMPLATE_ICON_COPY;
    button.addEventListener('click', () => {
      const codeToCopy = code.textContent;
      // Use textarea to keep multi line formatting
      const dummy = document.createElement('textarea');
      document.body.appendChild(dummy);
      dummy.value = codeToCopy;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);

      button.classList.add('active');

      setTimeout(() => {
        button.classList.remove('active');
      }, 2000);
    });
    wrapper.append(code);
    pre.append(wrapper);
    pre.prepend(button);
  }
};

const decorateImages = (block) => {
  // Wrap images in div
  for (const image of block.querySelectorAll('img')) {
    const imageWrapper = document.createElement('div');
    // Use data selector to prevent franklin from automatically trying to load a block
    imageWrapper.setAttribute('data-class', 'image-wrapper');
    image.insertAdjacentElement('afterend', imageWrapper);
    imageWrapper.append(image);
  }
};

const decorateTitles = (block) => {
  // Add page outline
  const pageOutline = document.createElement('ul');
  pageOutline.setAttribute('slot', 'outline');
  const outlineSlot = block.querySelector('[name="outline"]');
  const bookContent = block.querySelector('.book-content');
  const articleTitles = bookContent.querySelectorAll('h1, h2, h3, h4, h5, h6');

  for (const articleTitle of articleTitles) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');

    const title = articleTitle.textContent;
    const slug = articleTitle.getAttribute('id');
    link.setAttribute('href', `#${slug}`);
    link.textContent = title;
    listItem.append(link);
    pageOutline.append(listItem);

    articleTitle.setAttribute('data-id', slug);
    articleTitle.setAttribute('data-docs-heading', true);

    articleTitle.innerHTML = `
          <div class="anchor" style="height: 50px"></div>
          ${title}
          <button class="button-copy button-copy-link">
            <span>
              <svg class="icon icon-link" focusable="false" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <title>Link</title>
              <path d="M8 12c-2.209 0-4 1.791-4 4s1.791 4 4 4h4c1.105 0 2 0.895 2 2s-0.895 2-2 2h-4c-4.418 0-8-3.582-8-8s3.582-8 8-8h4c1.105 0 2 0.895 2 2s-0.895 2-2 2h-4z"></path>
              <path d="M24 20c2.209 0 4-1.791 4-4s-1.791-4-4-4h-4c-1.105 0-2-0.895-2-2s0.895-2 2-2h4c4.418 0 8 3.582 8 8s-3.582 8-8 8h-4c-1.105 0-2-0.895-2-2s0.895-2 2-2h4z"></path>
              <path d="M10 16c0-1.105 0.895-2 2-2h8c1.105 0 2 0.895 2 2v0c0 1.105-0.895 2-2 2h-8c-1.105 0-2-0.895-2-2v0z"></path>
              </svg>
            </span>
          </button>
      `;

    const button = articleTitle.querySelector('.button-copy');
    articleTitle.addEventListener('click', () => {
      const { origin, pathname } = window.location;
      const toCopy = `${origin}${pathname}#${slug}`;
      const dummy = document.createElement('textarea');
      document.body.appendChild(dummy);
      dummy.value = toCopy;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);

      button.classList.add('active');

      setTimeout(() => {
        button.classList.remove('active');
      }, 2000);
    });
  }

  outlineSlot.replaceWith(pageOutline.cloneNode(true));

  // Only show outline if there are headings in the article
  if (articleTitles?.length > 0) {
    const pageOutlineContainer = document.querySelector('.article-outline');
    pageOutlineContainer.classList.add('is-visible');
  }

  // Start scrollspy
  const scrollSpy = block.querySelector('web-scroll-spy');
  if (scrollSpy) {
    scrollSpy.setAttribute('ready', true);
  }

  const hash = window.location?.hash;
  if (hash) {
    const target = block.querySelector(`${hash}`);

    if (target) {
      window.scrollTo({
        top: -500,
      });
    }
  }
};

/**
 * @param {HTMLElement} block the container element
 * @param {string} hrefOrRes href on render, html string on rerender
 * @param {*} rerender whether this is a rerender
 */
async function renderContent(block, hrefOrRes, rerender = false) {
  let articleFound = true;
  block.innerHTML = '';

  let res = hrefOrRes;
  if (!rerender) {
    res = await loadArticle(hrefOrRes);
    if (!res || !res.ok) {
      console.error(`failed to load article (${res.status}): `, res);
      if (res.status === 404 && shouldRedirectMissing()) {
        await redirectToFirstChapter();
      }
      articleFound = false;
      block.classList.add('not-found');
    }
  }

  const template = parseFragment(TEMPLATE);
  const fragment = document.createElement('div');

  const docTitle = document.createElement('a');
  docTitle.setAttribute('slot', 'document');
  docTitle.href = window.location.href.split('/').slice(0, -2).join('/');
  docTitle.textContent = store?.mainBook?.title;
  fragment.append(docTitle);

  if (articleFound) {
    const { html, info } = res;
    const article = parseFragment(html);

    // Set last updated
    const lastUpdated = res?.info?.lastModified;
    if (lastUpdated) {
      const lastUpdatedLocale = lastUpdated.toLocaleString('default', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const time = document.createElement('time');
      time.setAttribute('slot', 'time');
      time.textContent = lastUpdatedLocale;
      time.setAttribute('datetime', lastUpdated.toISOString());
      fragment.append(time);
    }

    // Fixup images src
    for (const image of article.querySelectorAll('img')) {
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

    const articleTitle = article.querySelector('h1, h2');
    if (articleTitle) {
      info.title = articleTitle.textContent;
      document.title = info.title;
      const span = document.createElement('span');
      span.setAttribute('slot', 'title');
      span.textContent = info.title;
      articleTitle.remove();
      fragment.append(span);
    }

    const content = document.createElement('div');
    content.setAttribute('slot', 'content');
    content.append(article);

    fragment.append(content);

    // Remove class if coming from first chapter
    block.classList.remove('not-found');

    store.emit('article:loaded', info);
  }

  // Render with slots
  render(template, fragment);
  block.append(template);
  localize(block);

  // Post render
  block.querySelector(
    '.edit-github a',
  ).href = `https://github.com/hlxsites/prisma-cloud-docs/blob/main/${window.location.pathname.replace(
    PATH_PREFIX,
    'docs',
  )}.adoc`;

  // update dropdown links
  const versionMenu = block.querySelector('.version-dropdown-menu');
  if (versionMenu) {
    const curVers = store.version;

    versionMenu.querySelectorAll('li:not(.active) a').forEach((a) => {
      const siteHref = window.location.href;
      const nextVers = a.dataset.version;
      const [prefix] = a.href.split(`/${nextVers}/`);
      const suffix = siteHref.split(`/${curVers}/`).slice(1).join(`/${curVers}/`);
      a.href = `${prefix}/${nextVers}/${suffix}`;
    });
  }

  // Add link to division landing
  const backHomeLink = block.querySelector('.back-home a');
  if (backHomeLink) {
    const locale = window.location.pathname.split('/')?.[3];
    const divisionLandingUrl = `${window.location.origin}${window.hlx.codeBasePath}/${locale}`;
    backHomeLink.setAttribute('href', divisionLandingUrl);
  }

  // Show last updated if it exisxts
  const lastUpdated = res?.info?.lastModified;
  if (lastUpdated) {
    const lastUpdatedWrapper = document.querySelector('.last-updated');
    lastUpdatedWrapper.classList.add('is-visible');
  }

  if (store.mainBook) {
    loadBook(store.mainBook.href).then((book) => {
      store.emit('book:loaded', book);

      // if (!articleFound) return;

      // to use the title from the book definition instead of metadata
      // const docSlot = block.querySelector('slot[name="document"]');
      // docSlot.textContent = book.default.data[0].title;
    });
  }

  // Load sidenav, once
  if (!rerender) {
    renderSidenav(block);
    await import('../theme-toggle/theme-toggle.js');
    await import('../../scripts/scroll-spy.js');
  }

  if (articleFound) {
    const bookContent = block.querySelector('.book-content div[slot="content"]');
    if (bookContent) {
      decorateMain(bookContent);
      await loadBlocks(bookContent);
      updateSectionsStatus(bookContent);

      // Do article modifications after load to avoid gdoc race condition
      decorateTitles(block);
      decorateImages(block);
      decorateCodeBlocks(block);
    }
  }
}

const renderCurrentVersion = (block) => {
  const curVersionBtn = block.querySelector('[slot="version"]');
  if (curVersionBtn) {
    curVersionBtn.textContent = getMetadata('version-title');
  }
};

/** @param {HTMLDivElement} block */
export default async function decorate(block) {
  const link = block.querySelector('a');

  if (link) {
    try {
      const href = link.getAttribute('href') || link.innerText;
      if (href) {
        if (store.branch) {
          const url = new URL(href);
          setBranch(url, store.branch);

          await renderContent(block, url.toString());
          renderCurrentVersion(block);
          initVersionDropdown(block);
        } else {
          await renderContent(block, href);
          renderCurrentVersion(block);
          initVersionDropdown(block);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (SPA_NAVIGATION) {
    store.on('spa:navigate:article', async (res) => {
      await renderContent(block, res, true);
      // block.querySelector("article").scrollIntoView();
      renderCurrentVersion(block);
      initVersionDropdown(block);
    });
  }
}
