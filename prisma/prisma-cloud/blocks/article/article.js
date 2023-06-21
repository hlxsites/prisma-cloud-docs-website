import {
  assertValidDocsURL,
  renderSidenav,
  getPlaceholders,
  loadBook,
  parseFragment,
  PATH_PREFIX,
  render,
  REDIRECTED_ARTICLE_KEY,
  decorateMain,
  DOCS_ORIGINS,
  setBranch, getBranch,
} from '../../scripts/scripts.js';

import {
  getMetadata,
  loadBlocks,
  updateSectionsStatus,
} from '../../scripts/lib-franklin.js';

const TEMPLATE = /* html */`
  <article class="pan-article">
      <div class="banner">
          <div class="banner-inner">
            <span class="banner-inner-desktop">
              <h2>
                  <span class="locale-article-document">Document:</span>
                  <slot name="document"></slot>
              </h2>
              <hr>
              <span class="title">
                <h1><slot name="title"></slot></h1>
              </span>
            </span>
          </div>
      </div>
      <div class="content hidden-not-found">
          <div class="content-inner">
              <div class="book-detail-pagination">
                  <a class="prev" href="#">
                      <i class="icon-arrow-left-circle"></i>
                      <div class="locale-article-previous">Previous</div>
                  </a>
                  <a class="next" href="#">
                      <div class="locale-article-next">Next</div>
                      <i class="icon-arrow-right-circle"></i>
                  </a>
              </div>
              <div class="edit-github">
                  <a href="#" target="_blank" rel="nofollow">
                      <span class="locale-article-edit-github"></span>
                      <i class="icon-share-alt"></i>
                  </a>
              </div>
              <div class="book-content">
                  <slot name="content"></slot>
              </div>
          </div>
      </div>
  </article>`;

/**
 * Load article as HTML
 * @param {string} href
 * @returns {Promise<{ok:boolean;data?:string;status:number;}>}
 */
async function loadArticle(href) {
  assertValidDocsURL(href);

  const url = new URL(`${href}.plain.html`);
  setBranch(url);

  const resp = await fetch(url.toString(), store.branch ? { cache: 'reload' } : undefined);
  if (!resp.ok) return resp;
  try {
    const lastModified = resp.headers.get('last-modified') !== 'null' ? new Date(resp.headers.get('last-modified')) : new Date();
    return {
      ok: true,
      status: resp.status,
      info: {
        lastModified,
      },
      data: await resp.text(),
    };
  } catch (e) {
    console.error('failed to parse article: ', e);
    return {
      ...resp,
      ok: false,
    };
  }
}

/**
 * @param {HTMLDivElement} block
 */
function localize(block) {
  queueMicrotask(async () => {
    const ph = await getPlaceholders();
    block.querySelector('.locale-article-previous').textContent = ph.previous;
    block.querySelector('.locale-article-next').textContent = ph.next;
    block.querySelector('.locale-article-edit-github').textContent = ph.editOnGithub;
    block.querySelector('.locale-article-document').textContent = ph.document;
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
  let redirect = `${PATH_PREFIX}/${document.documentElement.lang}/${store.product}/${version ? `${version}/` : ''}${bookKey}/${chapter.key}/${chapter.key}`;
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

/** @param {HTMLDivElement} block */
export default async function decorate(block) {
  let res;
  let articleFound = true;
  const link = block.querySelector('a');
  block.innerHTML = '';

  if (link) {
    try {
      let href = link.getAttribute('href') || link.innerText;
      if (href) {
        // change href to point to docs origin on lower envs
        if (store.env !== 'prod' && href.startsWith('/')) {
          href = `${DOCS_ORIGINS[store.env]}${href}`;
        }
        res = await loadArticle(href);
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!res || !res.ok) {
    console.error(`failed to load article (${res.status}): `, res);
    if (res.status === 404 && shouldRedirectMissing()) {
      await redirectToFirstChapter();
    }
    articleFound = false;
    block.classList.add('not-found');
  }

  const template = parseFragment(TEMPLATE);
  const fragment = document.createElement('div');

  const docTitle = document.createElement('a');
  docTitle.setAttribute('slot', 'document');
  docTitle.href = window.location.href.split('/').slice(0, -2).join('/');
  docTitle.textContent = store.mainBook.title;
  fragment.append(docTitle);

  if (articleFound) {
    const { data, info } = res;
    const article = parseFragment(data);
    const branch = getBranch();

    // Fixup images src
    for (const image of article.querySelectorAll('img')) {
      const imageURL = new URL(image.src);

      if (branch) {
        setBranch(imageURL, branch, false, true);
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
    store.emit('article:loaded', info);
  }

  // Render with slots
  render(template, fragment);
  block.append(template);
  localize(block);

  // Post render
  block.querySelector('.edit-github a').href = `https://github.com/hlxsites/prisma-cloud-docs/blob/main/${window.location.pathname.replace(PATH_PREFIX, 'docs')}.adoc`;

  if (store.mainBook) {
    loadBook(store.mainBook.href).then((book) => {
      store.emit('book:loaded', book);

      if (!articleFound) return;

      // to use the title from the book definition instead of metadata
      // const docSlot = block.querySelector('slot[name="document"]');
      // docSlot.textContent = book.default.data[0].title;

      const href = window.location.href.split('?')[0].split('/');
      const subPath = href.pop();
      const topicIndex = book.topics.data.findIndex(({ key }) => key === subPath);
      const currentTopic = book.topics.data[topicIndex];
      const prevTopic = book.topics.data[topicIndex - 1];
      const nextTopic = book.topics.data[topicIndex + 1];

      if (prevTopic) {
        if (prevTopic.chapter === currentTopic.chapter) {
          block.querySelector('.prev').href = `${href.join('/')}/${prevTopic.key.replaceAll('_', '-')}`;
        } else {
          block.querySelector('.prev').href = `${href.slice(0, -1).join('/')}/${prevTopic.chapter}/${prevTopic.key.replaceAll('_', '-')}`;
        }
      }

      if (nextTopic) {
        if (nextTopic.chapter === currentTopic.chapter) {
          block.querySelector('.next').href = `${href.join('/')}/${nextTopic.key.replaceAll('_', '-')}`;
        } else {
          block.querySelector('.next').href = `${href.slice(0, -1).join('/')}/${nextTopic.chapter}/${nextTopic.key.replaceAll('_', '-')}`;
        }
      }
    });
  }

  // Load sidenav
  renderSidenav(block);

  if (articleFound) {
    const bookContent = block.querySelector('.book-content div[slot="content"]');
    if (bookContent) {
      decorateMain(bookContent);
      loadBlocks(bookContent).then(() => {
        updateSectionsStatus(document.querySelector('main'));
      });
    }
  }
}
