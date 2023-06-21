import { getMetadata } from '../../scripts/lib-franklin.js';
import {
  PATH_PREFIX, getIcon, getPlaceholders, html, isMobile, parseFragment, render,
} from '../../scripts/scripts.js';

const TEMPLATE = /* html */`
  <aside class="pan-sidenav">
      <div class="toggle-aside">
          <i class="icon">${getIcon('chevron-right')}</i>
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
                <div class="banner-dropdown version-dropdown">
                  <a>
                      <span slot="version"></span>
                      <i class="icon">${getIcon('chevron-down')}</i>
                  </a>
                  <div class="banner-dropdown-menu version-dropdown-menu">
                    <ul>
                      <li class="active">
                        <a href="#" slot="version"></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          <div class="languages">
            <div class="book-detail-banner-info">
              <div class="banner-info-label locale-book-current-language"></div>
                <div class="banner-dropdown language-dropdown">
                  <a>
                      <span slot="language"></span>
                      <i class="icon">${getIcon('chevron-down')}</i>
                  </a>
                  <div class="banner-dropdown-menu language-dropdown-menu">
                    <ul>
                      <li class="active">
                        <a href="#" slot="language"></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
          <div class="toggle-aside">
            <i class="icon">${getIcon(`chevron-${isMobile() ? 'down' : 'left'}`)}</i>
          </div>
          <h2 class="locale-toc-title"></h2>
          <hr>
          <div class="content-inner">
              <div class="search-toc">
                  <div class="search-toc-label">
                      <div class="filter-icon">
                          ${getIcon('filter')}
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
  const versionsContainer = wrapper.querySelector('.sidenav .banner .versions');
  const versionsDropdown = versionsContainer.querySelector('.version-dropdown');
  const curVersionKey = getMetadata('version');

  if (!store.product || curVersionKey === 'not-applicable') {
    versionsContainer.remove();
    return;
  }

  const { lang } = document.documentElement;
  const versionsDropdownMenu = versionsDropdown.querySelector('.version-dropdown-menu ul');

  versionsDropdown.addEventListener('mouseenter', async () => {
    const json = await store.fetchJSON(`${window.location.origin}${PATH_PREFIX}/${lang}/versions`, store.product);
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
 * Add version dropdown
 * @param {Element} wrapper
 */
async function initLanguagesDropdown(wrapper) {
  const langsContainer = wrapper.querySelector('.sidenav .banner .languages');
  const langsDropdown = langsContainer.querySelector('.language-dropdown');
  const curLangKey = document.documentElement.lang;

  if (!store.product || curLangKey === 'not-applicable') {
    langsContainer.remove();
    return;
  }

  const { languages, langMap } = await store.getLocalizationInfo();
  if (!languages) {
    langsContainer.remove();
    return;
  }

  const langDropdownMenu = langsDropdown.querySelector('.language-dropdown-menu ul');
  const curLang = document.documentElement.lang;

  langsDropdown.addEventListener('mouseenter', async () => {
    const { pathname } = window.location;
    // rm leading slash, lang
    const segments = pathname.substring(PATH_PREFIX.length).split('/').slice(2);
    const unlocalizedPath = segments.join('/');

    const makeHref = (lang) => `${PATH_PREFIX}/${lang}/${unlocalizedPath}`;

    const makeEntry = (lang, title) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      li.append(a);

      a.href = makeHref(lang);
      a.textContent = title;
      return li;
    };

    const otherLangItems = languages.map((lang) => {
      if (lang === curLang) {
        return undefined;
      }
      return makeEntry(lang, langMap[lang]);
    }).filter((item) => !!item);

    langDropdownMenu.append(...otherLangItems);
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
      toggle.querySelector('i').style.rotate = `${next ? '0' : '180'}deg`;
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
    block.querySelector('.locale-book-last-updated').textContent = ph.lastUpdated;
    const curVersion = block.querySelector('.locale-book-current-version');
    if (curVersion) {
      curVersion.textContent = ph.currentVersion;
    }
    const curLang = block.querySelector('.locale-book-current-language');
    if (curLang) {
      curLang.textContent = ph.currentLanguage;
    }
    block.querySelector('.locale-toc-title').textContent = ph.tableOfContents;
    block.querySelector('.locale-toc-filter').textContent = ph.filter;

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
    expander.append(html`<i class="icon">${getIcon('chevron-right')}</i>`);
    // expander.classList.add('icon-arrow-right', 'icon-toggle');
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
    addSubList(chapter.name, `${book.path}/${chapter.key}/${chapter.key}`, chapter.key);

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
        addSubList(topic.name, `${book.path}/${chapter.key}/${parentKey ? `${parentKey}/` : ''}${topic.key}/${topic.key}`, topic.key);
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
    currentItem = nextItem(currentItem.querySelector('ul'), nextKey);
  }
}

function scrollTOC(container, currentLink) {
  if (!currentLink) return;
  const currentLi = currentLink.closest('li');
  if (!currentLi) return;

  const doScroll = (count = 0) => {
    if (container.clientHeight) {
      container.scrollTop = currentLi.offsetTop;
    } else if (count < 100) {
      setTimeout(() => doScroll(count + 1), 5);
    }
  };
  doScroll();
}

/**
 * @param {HTMLDivElement} container
 * @param {any} book
 * @param {boolean} expand
 * @param {HTMLUListElement} replace
 */
function renderTOC(container, book, expand, replace) {
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

  // replace or append
  if (replace) {
    container.replaceChild(list, replace);
  } else {
    container.append(list);
  }

  if (expand) {
    list.querySelector('li').ariaExpanded = 'true';
  }

  // path to current doc inside book
  // from: /prisma/prisma-cloud/en/compute/pcee/admin-guide/install/getting-started
  // to: /install/getting-started
  const docPath = window.location.pathname.split('/').slice(7).join('/');
  expandTOCByPath(rootList, docPath);
  scrollTOC(container, current);
}

/**
 * @param {HTMLElement} container
 */
function initAdditionalBooks(container) {
  const mainBook = container.querySelector('ul');

  let afterMainBook = false;
  store.allBooks.forEach((book) => {
    if (book.mainBook) {
      afterMainBook = true;
    } else {
      // insert books in order defined in metadata
      const position = afterMainBook ? 'afterend' : 'beforebegin';
      const list = html`
        <ul>
          <li data-key="" aria-expanded="false">
            <div>
              <a>${book.title}</a>
              <span>
                <i class="icon">
                  ${getIcon('chevron-right')}
                </i>
              </span>
            </div>
          </li>
        </ul>`;
      mainBook.insertAdjacentElement(position, list);

      // load additional book data on hover, replace toc list once loaded
      list.addEventListener('mouseenter', async () => {
        const data = await store.fetchJSON(book.href, ['default', 'chapters', 'topics']);
        const sorted = sortBook(data);
        renderTOC(container, sorted, false, list);
      }, { once: true });
    }
  });
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

  const curLangBtn = block.querySelector('[slot="language"]');
  if (curLangBtn) {
    curLangBtn.textContent = getMetadata('language-title');
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
    initAdditionalBooks(toc);

    addEventListeners(wrapper);
    initVersionDropdown(wrapper);
    initLanguagesDropdown(wrapper);
  });
}
