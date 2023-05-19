import {
  PATH_PREFIX, getPlaceholders, parseFragment, render,
} from '../../scripts/scripts.js';

const TEMPLATE = /* html */`
  <aside class="pan-sidenav">
      <div class="toggle-aside">
          <i class="icon-arrow-right"></i>
      </div>
      <div class="banner">
          <div class="banner-inner">
              <span class="banner-inner-mobile">
                <h2>
                    <span class="locale-article-document">Document</span>
                    <slot name="document"></slot>
                </h2>
                <hr>
                <span class="title">
                  <h1><slot name="title"></slot></h1>
                </span>
              </span>
              <div class="book-detail-banner-info">
                  <div class="banner-info-label locale-book-last-updated"></div>
                  <slot name="date">May 4, 2023</slot>
              </div>
              <div class="versions">
                  <div class="book-detail-banner-info">
                      <div class="banner-info-label locale-book-current-version"></div>
                      <div class="version-dropdown">
                          <a>
                              <span>Prisma Cloud Enterprise Edition</span>
                              <i class="icon-arrow-down"></i>
                          </a>
                          <div class="version-dropdown-menu">
                              <ul>
                                  <li class="active">
                                      <a href="#">
                                          Version Prisma Cloud Enterprise Edition
                                      </a>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div class="content">
          <div class="toggle-aside">
              <i class="icon-arrow-left"></i>
          </div>
          <h2 class="locale-toc-title"></h2>
          <hr>
          <div class="content-inner">
              <div class="search-toc">
                  <div class="search-toc-label">
                      <div class="filter-icon">
                          <img src="/icons/filter.svg" alt="" loading="lazy">
                      </div>
                      <span class="locale-toc-filter"></span>
                  </div>
                  <div class="search-toc-container">
                      <div class="form">
                          <div class="form-input">
                              <input class="locale-toc-form-input">
                          </div>
                      </div>
                  </div>
              </div>
              <div class="toc-books"></div>
          </div>
      </div>
  </aside>`;

/**
 * Add toggle interaction
 * @param {Element} wrapper
 */
function addEventListeners(wrapper) {
  wrapper.addEventListener('click', (event) => {
    if (event.target.closest('.toggle-aside')) {
      wrapper.parentElement.classList.toggle('aside-close', !wrapper.parentElement.classList.contains('aside-close'));
    }
  });
}

function localize(block) {
  queueMicrotask(async () => {
    const ph = await getPlaceholders();
    block.querySelector('.locale-toc-form-input').placeholder = ph.tocFormInput;
    block.querySelector('.locale-book-last-updated').textContent = ph.bookLastUpdated;
    block.querySelector('.locale-book-current-version').textContent = ph.bookCurrentVersion;
    block.querySelector('.locale-toc-title').textContent = ph.tocTitle;
    block.querySelector('.locale-toc-filter').textContent = ph.tocFilter;

    block.querySelector('.locale-article-document').textContent = ph.articleDocument;
  });
}

function sortBook(book) {
  // eslint-disable-next-line no-param-reassign
  book = JSON.parse(JSON.stringify(book));

  const data = book.default.data[0];
  data.path = data.path.replace(`${PATH_PREFIX}/docs`, PATH_PREFIX);

  data.chapters = book.chapters.data;

  const topics = book.topics.data;
  topics.forEach(({ chapter, parent, ...topic }) => {
    let parentItem = data.chapters.find(({ key }) => key === chapter);
    if (parent) {
      parentItem = parentItem.children.find(({ key }) => key === parent);
    }

    parentItem.children = parentItem.children || [];
    parentItem.children.push(topic);
  });
  return data;
}

function bookToList(book) {
  const root = document.createElement('ul');

  let current = root;
  const addSubList = (title, href, key) => {
    const item = document.createElement('li');
    item.dataset.key = key;
    const link = document.createElement('a');
    link.innerText = title;
    link.href = href || '';
    item.append(link);

    const expander = document.createElement('a');
    expander.innerText = 'v';
    expander.classList.add('expand-trigger');
    item.append(expander);

    current.append(item);

    expander.addEventListener('click', (e) => {
      e.preventDefault();
      const li = link.closest('li');
      li.ariaExpanded = !(li.ariaExpanded === 'true');
    });

    const next = document.createElement('ul');
    item.append(next);
    current = next;
    return current;
  };

  const bookUl = addSubList(book.title, book.path, book.path);
  book.chapters.forEach((chapter) => {
    // reset back to the book list for each new chapter
    current = bookUl;

    // add the chapter
    addSubList(chapter.name, `${book.path}/${chapter.key}`, chapter.key);

    const makeHref = (topic, parentKey) => `${book.path}/${chapter.key}/${parentKey ? `${parentKey}/` : ''}${topic.key}`;

    // then the topics recursively
    const processTopic = (topic, parentKey) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.innerText = topic.name;
      link.href = makeHref(topic, parentKey);
      li.append(link);
      current.append(li);

      if (topic.children) {
        addSubList(topic.name, `${book.path}/${chapter.key}/${parentKey ? `${parentKey}/` : ''}${topic.key}`, topic.key);
        topic.children.forEach((subtopic) => {
          processTopic(subtopic, `${parentKey ? `${parentKey}/` : ''}${topic.key}${subtopic.parent ? `/${subtopic.parent}` : ''}`);
        });
      }
    };
    chapter.children.forEach((topic) => processTopic(topic));
  });

  return root;
}

function expandTOCByPath(container, path) {
  let rootPath;
  const nextItem = (list, key) => [...list.querySelectorAll(':scope > ul > li')].find((li) => {
    if (!key.startsWith(li.dataset.key)) {
      return false;
    }
    if (!rootPath) {
      rootPath = li.dataset.key;
    }
    return true;
  });

  let currentItem = nextItem(container, path);
  if (!currentItem) return;

  const segments = path.substring(rootPath.length).split('/').slice(1);
  while (currentItem && segments.length) {
    currentItem.ariaExpanded = 'true';
    const nextKey = segments.shift();
    currentItem = nextItem(currentItem, nextKey);
  }
}

// eslint-disable-next-line no-unused-vars
function filterBook(book, query) {
  // TODO: filter by includes in name/title
  return book;
}

function renderTOC(container, book, query) {
  let filtered = book;
  if (query) {
    filtered = filterBook(book, query);
  }

  const list = bookToList(filtered);
  container.append(list);
  expandTOCByPath(container, window.location.pathname);
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  block.innerHTML = '';
  const template = parseFragment(TEMPLATE);

  const toggle = template.querySelector('.toggle-aside');
  const wrapper = block.closest('.sidenav-wrapper');
  wrapper.append(toggle);

  const div = document.createElement('div');
  const docTitle = document.createElement('a');
  docTitle.setAttribute('slot', 'document');
  docTitle.href = window.location.href.split('/').slice(0, -2).join('/');
  div.append(docTitle);

  // Render with slots
  render(template, div);
  block.append(template);
  localize(block);

  const toc = block.querySelector('.content-inner .toc-books');
  if (window.screen.width < 768) {
    wrapper.parentElement.classList.add('aside-close');
  }

  store.once('article:loaded', () => {
    block.querySelector('slot[name="title"]').textContent = document.title;
  });
  store.once('book:loaded', (book) => {
    block.querySelector('a[slot="document"]').textContent = book.default.data[0].title;

    const sorted = sortBook(book);
    renderTOC(toc, sorted, undefined);

    addEventListeners(wrapper);
  });

  // TODO display TOC links and filter
}
