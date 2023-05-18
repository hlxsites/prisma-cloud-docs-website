import {
  assertValidDocsURL,
  renderSidenav,
  getPlaceholders,
  loadBook,
  parseFragment,
  PATH_PREFIX,
  render,
} from '../../scripts/scripts.js';

import {
  loadBlock,
} from '../../scripts/lib-franklin.js';

const TEMPLATE = /* html */`
  <article class="pan-article">
      <div class="banner">
          <div class="banner-inner">
              <h2>
                  <span class="locale-article-document"></span>
                  <slot name="document"></slot>
              </h2>
              <hr>
              <div class="hero">
                  <h1>
                      <slot name="title"></slot>
                  </h1>
              </div>
          </div>
      </div>
      <div class="content">
          <div class="content-inner">
              <div class="book-detail-pagination">
                  <a class="prev" href="#">
                      <i class="icon-arrow-left-circle"></i>
                      <div class="locale-article-previous"></div>
                  </a>
                  <a class="next" href="#">
                      <div class="locale-article-next"></div>
                      <i class="icon-arrow-right-circle"></i>
                  </a>
              </div>
              <div class="edit-github">
                  <a href="#" target="_blank" rel="nofollow">
                      <span class="locale-article-edit-github"></span>
                      <i class="icon-share-alt"></i>
                  </a>
              </div>
              <div class="book-pdf-content">
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

  const resp = await fetch(`${href}.plain.html`);
  if (!resp.ok) return resp;
  try {
    return {
      ok: true,
      status: resp.status,
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
    block.querySelector('.locale-article-previous').textContent = ph.articlePrevious;
    block.querySelector('.locale-article-next').textContent = ph.articleNext;
    block.querySelector('.locale-article-edit-github').textContent = ph.articleEditGithub;
    block.querySelector('.locale-article-document').textContent = ph.articleDocument;
  });
}

/** @param {HTMLDivElement} block */
export default async function decorate(block) {
  const res = await loadArticle(block.querySelector('a').href);
  if (!res.ok) {
    console.error(`failed to load article (${res.status}): `, res);
    return;
  }

  const template = parseFragment(TEMPLATE);
  const article = parseFragment(res.data);

  block.innerHTML = '';

  // Fixup images src
  for (const image of article.querySelectorAll('img')) {
    const { pathname } = new URL(image.src);
    image.src = `${store.docsOrigin}${pathname.replace(PATH_PREFIX, `${PATH_PREFIX}/docs`)}`;

    const picture = image.parentElement;
    if (picture.tagName === 'PICTURE') {
      for (const source of picture.querySelectorAll('source')) {
        const search = source.srcset.split('?')[1];
        source.srcset = `${image.src}?${search}`;
      }
    }
  }

  // "Slotify"
  const div = document.createElement('div');
  const docTitle = document.createElement('a');
  docTitle.setAttribute('slot', 'document');
  docTitle.href = window.location.href.split('/').slice(0, -2).join('/');
  div.append(docTitle);

  const articleTitle = article.querySelector('h1, h2');
  if (articleTitle) {
    const span = document.createElement('span');
    span.setAttribute('slot', 'title');
    span.textContent = articleTitle.textContent;
    articleTitle.remove();
    div.append(span);
  }

  const content = document.createElement('div');
  content.setAttribute('slot', 'content');
  content.append(article);

  div.append(content);

  // Render with slots
  render(template, div);
  block.append(template);
  localize(block);

  // Post render
  block.querySelector('.edit-github a').href = `https://github.com/hlxsites/prisma-cloud-docs/blob/main/${window.location.pathname.replace(PATH_PREFIX, 'docs')}.adoc`;

  loadBook(store.mainBook.href).then((book) => {
    docTitle.textContent = book.default.data[0].title;

    const href = window.location.href.split('/');
    const subPath = href.pop();
    const topicIndex = book.topics.data.findIndex(({ key }) => key === subPath.replaceAll('-', '_'));
    const currentTopic = book.topics.data[topicIndex];
    const prevTopic = book.topics.data[topicIndex - 1];
    const nextTopic = book.topics.data[topicIndex + 1];

    if (prevTopic.chapter === currentTopic.chapter) {
      block.querySelector('.prev').href = `${href.join('/')}/${prevTopic.key.replaceAll('_', '-')}`;
    } else {
      block.querySelector('.prev').href = `${href.slice(0, -1).join('/')}/${prevTopic.chapter}/${prevTopic.key.replaceAll('_', '-')}`;
    }

    if (nextTopic.chapter === currentTopic.chapter) {
      block.querySelector('.next').href = `${href.join('/')}/${nextTopic.key.replaceAll('_', '-')}`;
    } else {
      block.querySelector('.next').href = `${href.slice(0, -1).join('/')}/${nextTopic.chapter}/${nextTopic.key.replaceAll('_', '-')}`;
    }
  });

  // Load sidenav
  renderSidenav(block);

  // Load article blocks
  const blocks = '.hero, .admonition';
  for (const el of block.querySelectorAll(blocks)) {
    el.setAttribute('data-block-name', el.className.split(' ')[0]);
    loadBlock(el);
  }
}
