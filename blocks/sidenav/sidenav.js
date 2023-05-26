import { getMetadata } from '../../scripts/lib-franklin.js';
import {
  PATH_PREFIX, getPlaceholders, isMobile, parseFragment, render,
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
                    <span class="locale-article-document">Document:</span>
                    <slot name="document"></slot>
                </h2>
                <hr>
                <span class="title">
                  <h1><slot name="title"></slot></h1>
                </span>
              </span>
              <div class="book-detail-banner-info">
                  <div class="banner-info-label locale-book-last-updated"></div>
                  <slot name="date">-</slot>
              </div>
              <div class="versions">
                  <div class="book-detail-banner-info">
                      <div class="banner-info-label locale-book-current-version"></div>
                      <div class="version-dropdown">
                          <a>
                              <span slot="version"></span>
                              <i class="icon-arrow-down"></i>
                          </a>
                          <div class="version-dropdown-menu">
                              <ul>
                                  <li class="active">
                                      <a href="#" slot="version"></a>
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
              <i class="icon-arrow-${isMobile() ? 'down' : 'left'}"></i>
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
                          <form class="form-input">
                              <input class="locale-toc-form-input">
                              <button type="reset" hidden><span class="ion-close"></span></button>
                          </form>
                      </div>
                  </div>
              </div>
              <div class="toc-books"></div>
          </div>
      </div>
  </aside>`;

/**
 * Add version dropdown
 * @param {Element} wrapper
 */
function initVersionDropdown(wrapper) {
  const versionsDropdown = wrapper.querySelector('.version-dropdown');
  const curVersionKey = getMetadata('version');

  if (!store.product || curVersionKey === 'not-applicable') {
    versionsDropdown.remove();
    return;
  }

  const { lang } = document.documentElement;
  const versionsDropdownMenu = versionsDropdown.querySelector('.version-dropdown-menu ul');

  versionsDropdown.addEventListener('mouseenter', async () => {
    const json = await store.fetchJSON(`${PATH_PREFIX}/${lang}/versions`, store.product);
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

    // TODO: This still doesn't quite work since the book directory names also change
    //        eg. `admin-guide-pcee` -> `<version>/admin-guide-pcce`
    // Possible workaround is to specify the entire folder path inside versions.json,
    // but first will figure out whether paths can be normalized to match across versions.
    const makeHref = (folder) => `${PATH_PREFIX}/${lang}/${store.product}/${folder ? `${folder}/` : ''}${unversionedPath}`;

    const newVersions = json.data.map((row) => {
      // exclude current version from dropdown
      if (row.Key === curVersionKey) {
        return undefined;
      }

      const li = document.createElement('li');
      const a = document.createElement('a');
      li.append(a);

      a.href = makeHref(row.Folder);
      a.textContent = row.Title;

      return li;
    }).filter((item) => !!item);

    versionsDropdownMenu.append(...newVersions);
  }, { once: true });
}

/**
 * Add toggle interaction
 * @param {Element} wrapper
 */
function addEventListeners(wrapper) {
  wrapper.addEventListener('click', (event) => {
    /** @type {HTMLElement} */
    const toggle = event.target.closest('.toggle-aside');
    if (!toggle) return;

    const next = !wrapper.parentElement.classList.contains('aside-close');
    wrapper.parentElement.classList.toggle('aside-close', next);
    if (isMobile()) {
      toggle.querySelector('i').className = `icon-arrow-${next ? 'down' : 'up'}`;
    }
  });

  const form = wrapper.querySelector('.form-input');
  const input = form.querySelector('input');
  const reset = form.querySelector('button');
  const toc = wrapper.querySelector('.toc-books');

  const toggleExpanded = (el, toggle) => {
    let parent = el.parentElement.closest('li');
    while (parent) {
      parent.ariaExpanded = toggle;
      if (parent.dataset.key) {
        parent.hidden = !toggle;
      }
      parent = parent.parentElement.closest('li');
    }
  };

  input.addEventListener('input', () => {
    const { value } = input;

    const links = toc.querySelectorAll('a');

    if (value) {
      reset.hidden = false;

      const query = value.toLowerCase();
      const find = (link) => link.textContent.toLowerCase().includes(query);

      links.forEach((link) => {
        if (!find(link)) {
          const { textContent } = link;
          link.textContent = textContent;

          toggleExpanded(link, false);
        }
      });

      links.forEach((link) => {
        if (find(link)) {
          link.innerHTML = link.textContent.replace(new RegExp(`(${value})`, 'gi'), '<mark>$1</mark>').replaceAll(' ', '&nbsp;');

          toggleExpanded(link, true);
        }
      });
    } else {
      reset.hidden = true;

      links.forEach((link) => {
        const { textContent } = link;

        link.textContent = textContent;
        link.closest('li[data-key]').hidden = false;

        toggleExpanded(link, 'false');
      });

      toggleExpanded(toc.querySelector('li.current'), 'true');
    }
  });

  reset.addEventListener('click', () => {
    reset.hidden = true;
    requestAnimationFrame(() => {
      input.dispatchEvent(new Event('input'));
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
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
    const div = document.createElement('div');
    const link = document.createElement('a');
    link.innerText = title;
    link.href = href || '';
    div.append(link);

    const expander = document.createElement('span');
    expander.classList.add('icon-arrow-right', 'icon-toggle');
    div.append(expander);

    item.append(div);

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
      const div = document.createElement('div');
      div.append(link);
      li.append(div);
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

function expandTOCByPath(rootList, path) {
  let rootPath;
  const nextItem = (list, key) => [...list.querySelectorAll(':scope > li')].find((li) => {
    if (!key.startsWith(li.dataset.key)) {
      return false;
    }
    if (!rootPath) {
      rootPath = li.dataset.key;
    }
    return true;
  });

  let currentItem = nextItem(rootList, path);
  if (!currentItem) return;

  const segments = path.substring(rootPath.length).split('/').slice(1);
  while (currentItem && segments.length) {
    currentItem.ariaExpanded = 'true';
    const nextKey = segments.shift();
    currentItem = nextItem(currentItem, nextKey);
  }
}

function renderTOC(container, book, expand) {
  const list = bookToList(book);
  const rootList = list.querySelector(':scope > li > ul');
  // Clean dups
  rootList.querySelectorAll(':scope > li li[data-key]').forEach((li) => {
    const prev = li.previousElementSibling;
    if (prev && prev.querySelector('a').textContent.trim() === li.querySelector('a').textContent.trim()) {
      prev.remove();
    }
  });
  // Set current
  const current = rootList.querySelector(`a[href="${window.location.pathname}"]`);
  if (current) {
    current.closest('li').classList.add('current');
  }
  container.append(list);

  if (expand) {
    list.querySelector('li').ariaExpanded = 'true';
  }

  expandTOCByPath(rootList, window.location.pathname.split('/').slice(6).join('/'));
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

  const curVersionBtn = block.querySelector('[slot="version"]');
  if (curVersionBtn) {
    curVersionBtn.textContent = getMetadata('version-title');
  }

  const toc = block.querySelector('.content-inner .toc-books');
  if (isMobile()) {
    wrapper.parentElement.classList.add('aside-close');
  }

  store.once('article:loaded', (info) => {
    block.querySelector('slot[name="title"]').textContent = info.title;

    const [month, day, year] = info.lastModified.toString().split(' ').slice(1);
    block.querySelector('slot[name="date"]').textContent = `${month} ${day}, ${year}`;
  });

  store.once('book:loaded', (book) => {
    block.querySelector('a[slot="document"]').textContent = book.default.data[0].title;

    const sorted = sortBook(book);
    renderTOC(toc, sorted, true);

    addEventListeners(wrapper);
    initVersionDropdown(wrapper);
  });

  store.once('delayed:loaded', () => {
    // Lazy load additional books non blocking
    Promise.all(store.additionalBooks.map((additionalBook) => new Promise((resolve) => {
      store.fetchJSON(additionalBook.href, ['default', 'chapters', 'topics']).then((value) => {
        additionalBook.value = value;
        resolve();
      });
    })))
      .then(() => {
        store.additionalBooks.forEach((additionalBook) => {
          renderTOC(toc, sortBook(additionalBook.value));
        });
      });
  });
}
