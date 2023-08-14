import { getMetadata } from "../../scripts/lib-franklin.js";
import {
  PATH_PREFIX,
  SPA_NAVIGATION,
  debounce,
  getIcon,
  getPlaceholders,
  html,
  isMobile,
  loadArticle,
  parseFragment,
  render,
} from "../../scripts/scripts.js";

const TEMPLATE = /* html */ `
<div class="toc-resizer"></div>
  <aside class="pan-sidenav">
      <!-- Mobile -->
      <!-- End Mobile -->
      <div class="toggle-aside">
          <i class="icon">${getIcon("chevron-right")}</i>
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

          <div class="languages">
            <div class="book-detail-banner-info">
              <div class="banner-info-label locale-book-current-language"></div>
                <div class="banner-dropdown language-dropdown">
                  <a>
                      <span slot="language"></span>
                      <i class="icon">${getIcon("chevron-down")}</i>
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
            <svg class="icon icon-collapse" focusable="false" aria-label="Collapse" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <title>collapse</title>
              <path d="M24.521 9.843c0.639-0.65 0.639-1.707 0-2.358-0.635-0.647-1.662-0.647-2.298 0l-6.42 6.538c-1.071 1.091-1.071 2.863 0 3.954l6.42 6.538c0.635 0.647 1.663 0.647 2.298 0 0.639-0.65 0.639-1.707 0-2.358l-5.517-5.619c-0.289-0.295-0.289-0.782 0-1.077l5.517-5.619z"></path>
              <path d="M16.521 9.843c0.639-0.65 0.639-1.707 0-2.358-0.635-0.647-1.662-0.647-2.298 0l-6.42 6.538c-1.071 1.091-1.071 2.863 0 3.954l6.42 6.538c0.635 0.647 1.662 0.647 2.298 0 0.639-0.65 0.639-1.707 0-2.358l-5.517-5.619c-0.289-0.295-0.289-0.782 0-1.077l5.517-5.619z"></path>
            </svg>
          </div>
          <h2 class="locale-toc-title"></h2>
          <hr>
          <div class="content-inner">
              
              <div class="search-toc">
                  <div class="search-toc-label">
                      <div class="filter-icon">
                          ${getIcon("filter")}
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

function formatDate(date) {
  const [month, day, year] = date.toString().split(" ").slice(1);
  return `${month} ${day}, ${year}`;
}

function handleSPANavigation(state) {
  const sidenav = document.querySelector(".block.sidenav .pan-sidenav");
  const banner = sidenav.querySelector("div.banner");
  const toc = sidenav.querySelector("div.toc-books");

  // change current sidenav item
  const prev = toc.querySelector("li.current");
  if (prev) {
    prev.classList.remove("current");
  }

  const next = toc.querySelector(`a[href="${state.siteHref}"]`);
  if (next) {
    next.closest("li").classList.add("current");
  }

  // update modified date
  const dateEl = banner.querySelector(
    '.book-detail-banner-info slot[name="date"]'
  );
  if (dateEl) {
    dateEl.textContent = formatDate(state.info.lastModified);
  }
  console.log("store: ", store);
  // update dropdown links
  const versionMenu = banner.querySelector(".version-dropdown-menu");
  if (versionMenu) {
    const curVers = store.version;

    versionMenu.querySelectorAll("li:not(.active) a").forEach((a) => {
      const nextVers = a.dataset.version;
      const [prefix] = a.href.split(`/${nextVers}/`);
      const suffix = state.siteHref
        .split(`/${curVers}/`)
        .slice(1)
        .join(`/${curVers}/`);
      a.href = `${prefix}/${nextVers}/${suffix}`;
    });
  }

  const langMenu = banner.querySelector(".language-dropdown-menu");
  if (langMenu) {
    const { lang: curLang } = document.documentElement;
    langMenu.querySelectorAll("li:not(.active) a").forEach((a) => {
      const nextLang = a.dataset.lang;
      const [prefix] = a.href.split(`/${nextLang}/`);
      const suffix = state.siteHref
        .split(`/${curLang}/`)
        .slice(1)
        .join(`/${curLang}/`);
      a.href = `${prefix}/${nextLang}/${suffix}`;
    });
  }
}

async function navigateArticleSPA(ev) {
  if (!SPA_NAVIGATION) return;

  const siteHref = ev.target.getAttribute("href");
  if (!siteHref) return;

  // convert website path to docs path
  const docHref = `${PATH_PREFIX}/docs${siteHref.substring(
    PATH_PREFIX.length
  )}`;

  // navigate normally to different books, only SPA within the same book
  if (!docHref.startsWith(store.bookPath)) return;

  ev.preventDefault();

  const res = await loadArticle(docHref);
  if (!res.ok) {
    // also navigate normally if article fetch fails
    console.error("failed to load article: ", docHref, res);
    window.location.href = siteHref;
    return;
  }

  const state = { docHref, siteHref, ...res };
  store.emit("spa:navigate:article", state);
  handleSPANavigation(state);
}

/**
 * Add version dropdown
 * @param {Element} wrapper
 */
function initVersionDropdown(wrapper) {
  const versionsContainer = wrapper.querySelector(".sidenav .banner .versions");
  const versionsDropdown = versionsContainer.querySelector(".version-dropdown");
  const versionButton = versionsDropdown.querySelector(".version-button");
  const versionsDropdownMenuContainer = versionsContainer.querySelector(
    ".version-dropdown-menu"
  );
  const curVersionKey = getMetadata("version");

  if (!store.product || curVersionKey === "not-applicable") {
    versionsContainer.remove();
    return;
  }

  const { lang } = document.documentElement;
  const versionsDropdownMenu = versionsDropdown.querySelector(
    ".version-dropdown-menu ul"
  );

  versionButton.addEventListener("click", () => {
    versionsDropdownMenuContainer.classList.toggle("is-active");
  });

  document.addEventListener("click", (event) => {
    const isClickInside = versionsContainer.contains(event.target);

    if (!isClickInside) {
      versionsDropdownMenuContainer.classList.remove("is-active");
    }
  });

  versionsDropdown.addEventListener(
    "mouseenter",
    async () => {
      const json = await store.fetchJSON(
        `${window.location.origin}${PATH_PREFIX}/${lang}/versions`,
        store.product
      );
      if (!json) return;

      const curVersion = json.data.find((row) => row.Key === curVersionKey);

      const { pathname } = window.location;
      // rm leading slash, lang, product
      let segments = pathname.substring(PATH_PREFIX.length).split("/").slice(3);
      // if current href has version folder, remove it
      if (curVersion.Folder) {
        segments = segments.slice(1);
      }
      const unversionedPath = segments.join("/");

      const makeHref = (folder) =>
        `${PATH_PREFIX}/${lang}/${store.product}/${
          folder ? `${folder}/` : ""
        }${unversionedPath}`;

      const newVersions = json.data
        .map((row) => {
          // exclude current version from dropdown
          if (row.Key === curVersionKey) {
            return undefined;
          }

          const li = document.createElement("li");
          const a = document.createElement("a");
          li.append(a);

          a.href = makeHref(row.Folder);
          a.textContent = row.Title;
          a.dataset.version = row.Folder;

          return li;
        })
        .filter((item) => !!item);

      versionsDropdownMenu.append(...newVersions);
    },
    { once: true }
  );
}

/**
 * Add version dropdown
 * @param {Element} wrapper
 */
async function initLanguagesDropdown(wrapper) {
  const langsContainer = wrapper.querySelector(".sidenav .banner .languages");
  const langsDropdown = langsContainer.querySelector(".language-dropdown");
  const curLangKey = document.documentElement.lang;

  if (!store.product || curLangKey === "not-applicable") {
    langsContainer.remove();
    return;
  }

  const { languages, langMap } = await store.getLocalizationInfo();
  if (!languages) {
    langsContainer.remove();
    return;
  }

  const langDropdownMenu = langsDropdown.querySelector(
    ".language-dropdown-menu ul"
  );
  const curLang = document.documentElement.lang;

  langsDropdown.addEventListener(
    "mouseenter",
    async () => {
      const { pathname } = window.location;
      // rm leading slash, lang
      const segments = pathname
        .substring(PATH_PREFIX.length)
        .split("/")
        .slice(2);
      const unlocalizedPath = segments.join("/");

      const makeHref = (lang) => `${PATH_PREFIX}/${lang}/${unlocalizedPath}`;

      const makeEntry = (lang, title) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        li.append(a);

        a.href = makeHref(lang);
        a.textContent = title;
        a.dataset.lang = lang;
        return li;
      };

      const otherLangItems = languages
        .map((lang) => {
          if (lang === curLang) {
            return undefined;
          }
          return makeEntry(lang, langMap[lang]);
        })
        .filter((item) => !!item);

      langDropdownMenu.append(...otherLangItems);
    },
    { once: true }
  );
}

/**
 * Add toggle interaction
 * @param {Element} wrapper
 */
function addEventListeners(wrapper) {
  let ww = window.innerWidth;

  wrapper.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    // Reset scroll to top of the page when changing view
    if (link) {
      setTimeout(() => {
        window.scrollTo({ top: 0 });
      }, 100);

      const mobileToggle = document.querySelector(".nav-open-booksmenu");
      if (mobileToggle.classList.contains("is-active")) {
        mobileToggle.click();
      }
    }

    /** @type {HTMLElement} */
    const toggle = event.target.closest(".toggle-aside");
    if (!toggle) return;

    const next = !wrapper.parentElement.classList.contains("aside-close");
    wrapper.parentElement.classList.toggle("aside-close", next);
    if (isMobile()) {
      toggle.querySelector("i").style.rotate = `${next ? "0" : "180"}deg`;
    }
  });

  // Mobile resize
  let mobileTriggered = false;
  let desktopTriggered = false;
  const handleWindowResize = debounce((event) => {
    ww = window.innerWidth;
    if (ww < 900 && !mobileTriggered) {
      mobileTriggered = true;
      desktopTriggered = false;
      wrapper.parentElement.classList.add("aside-close");
    } else if (ww >= 900 && !desktopTriggered) {
      mobileTriggered = false;
      desktopTriggered = true;
      wrapper.parentElement.classList.remove("aside-close");
    }
  }, 50);

  window.addEventListener("resize", handleWindowResize);

  const form = wrapper.querySelector(".form-input");
  const input = form.querySelector("input");
  const reset = form.querySelector("button");
  const toc = wrapper.querySelector(".toc-books");

  const toggleExpanded = (el, toggle) => {
    let parent = el.parentElement.closest("li");
    while (parent) {
      parent.ariaExpanded = toggle;
      if (parent.dataset.key) {
        parent.hidden = !toggle;
      }
      parent = parent.parentElement.closest("li");
    }
  };

  input.addEventListener("input", () => {
    const { value } = input;

    const links = toc.querySelectorAll("a");

    if (value) {
      reset.hidden = false;

      const query = value.toLowerCase();
      const find = (link) => link.textContent.toLowerCase().includes(query);

      links.forEach((link) => {
        if (!find(link)) {
          const { textContent } = link;
          link.textContent = textContent;
          link.textContent = link.innerHTML.replaceAll("&nbsp;", " ");

          toggleExpanded(link, false);
        }
      });

      links.forEach((link) => {
        if (find(link)) {
          link.innerHTML = link.textContent
            .replace(new RegExp(`(${value})`, "gi"), "<mark>$1</mark>")
            .replaceAll(" ", "&nbsp;");

          toggleExpanded(link, true);
        }
      });
    } else {
      reset.hidden = true;

      links.forEach((link) => {
        const { textContent } = link;

        link.textContent = textContent;
        link.textContent = link.innerHTML.replaceAll("&nbsp;", " ");
        link.closest("li[data-key]").hidden = false;

        toggleExpanded(link, "false");
      });

      toggleExpanded(toc.querySelector("li.current"), "true");
    }
  });

  reset.addEventListener("click", () => {
    reset.hidden = true;
    requestAnimationFrame(() => {
      input.dispatchEvent(new Event("input"));
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  // TOC Resizer
  const resizer = wrapper.querySelector(".toc-resizer");
  const sidebar = wrapper;
  const minWidth = 375;

  const resize = (e) => {
    const maxWidth = ww / 2;
    const targetSize = e.x;
    const size = `${targetSize}px`;
    if (targetSize < maxWidth && targetSize >= minWidth) {
      sidebar.style.flexBasis = size;
      resizer.style.transform = `translateX(${size})`;
    }
  };

  resizer.addEventListener("mousedown", () => {
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", resize, false);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", resize, false);
        document.body.style.userSelect = "auto";
      },
      false
    );
  });
}

function localize(block) {
  queueMicrotask(async () => {
    const ph = await getPlaceholders();
    block.querySelector(".locale-toc-form-input").placeholder = ph.tocFormInput;
    block.querySelector(".locale-book-last-updated").textContent =
      ph.lastUpdated;
    const curVersion = block.querySelector(".locale-book-current-version");
    if (curVersion) {
      curVersion.textContent = ph.currentVersion;
    }
    const curLang = block.querySelector(".locale-book-current-language");
    if (curLang) {
      curLang.textContent = ph.currentLanguage;
    }
    block.querySelector(".locale-toc-title").textContent = ph.tableOfContents;
    block.querySelector(".locale-toc-filter").textContent = ph.filter;

    block.querySelector(".locale-article-document").textContent =
      ph.articleDocument;
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

function hasSubtopics(topic) {
  return (
    topic.children &&
    (topic.children.length > 1 ||
      topic.children.some(
        (sub) => sub.name !== topic.name && sub.key !== topic.key
      ))
  );
}

function bookToList(book) {
  const root = document.createElement("ul");

  let current = root;
  const addSubList = (title, href, key) => {
    const item = document.createElement("li");
    item.dataset.key = key;
    const div = document.createElement("div");
    const link = document.createElement("a");
    link.innerText = title;
    link.href = href || "";
    link.addEventListener("click", navigateArticleSPA);

    div.append(link);

    const expander = document.createElement("span");
    expander.classList.add("icon-toggle");
    expander.append(html`<svg
      class="icon icon-arrow"
      focusable="false"
      aria-label="Expand"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <title>Right Arrow</title>
      <path
        d="M7.527 0.669c-0.893 0.893-0.893 2.34 0 3.232l11.29 11.29c0.446 0.446 0.446 1.17 0 1.616l-11.29 11.29c-0.893 0.893-0.893 2.34 0 3.232s2.34 0.893 3.232 0l13.714-13.714c0.893-0.893 0.893-2.34 0-3.232l-13.714-13.714c-0.893-0.893-2.34-0.893-3.232 0z"
      ></path>
    </svg>`);
    div.append(expander);

    item.append(div);

    current.append(item);

    expander.addEventListener("click", (e) => {
      e.preventDefault();
      const li = link.closest("li");
      li.ariaExpanded = !(li.ariaExpanded === "true");
    });

    const next = document.createElement("ul");
    item.append(next);
    current = next;
    return current;
  };

  const bookUl = addSubList(book.title, book.path, book.path);
  book.chapters.forEach((chapter) => {
    // reset back to the book list for each new chapter
    current = bookUl;

    // add the chapter
    const chapterUl = addSubList(
      chapter.name,
      `${book.path}/${chapter.key}/${chapter.key}`,
      chapter.key
    );

    const makeHref = (topic, parentKey) =>
      `${book.path}/${chapter.key}/${parentKey ? `${parentKey}/` : ""}${
        topic.key
      }`;

    // then the topics recursively
    const processTopic = (topic, parentKey) => {
      if (!parentKey) {
        // reset back to the chapter list for each new topic
        current = chapterUl;
      }

      const li = document.createElement("li");
      const link = document.createElement("a");
      link.innerText = topic.name;
      link.href = makeHref(topic, parentKey);
      link.addEventListener("click", navigateArticleSPA);

      const div = document.createElement("div");
      div.append(link);
      li.append(div);
      current.append(li);

      if (topic.children && topic.children.length) {
        if (hasSubtopics(topic)) {
          addSubList(
            topic.name,
            `${book.path}/${chapter.key}/${parentKey ? `${parentKey}/` : ""}${
              topic.key
            }/${topic.key}`,
            topic.key
          );
          topic.children.forEach((subtopic) => {
            processTopic(
              subtopic,
              `${parentKey ? `${parentKey}/` : ""}${topic.key}${
                subtopic.parent ? `/${subtopic.parent}` : ""
              }`
            );
          });
        } else {
          // has children, but not subtopics to render
          // this means the link on the parent is actually the child's link
          const [first] = topic.children;
          link.href = `${link.href}/${first.key}`;
        }
      }
    };
    chapter.children.forEach((topic) => processTopic(topic));
  });

  return root;
}

/**
 * @param {HTMLDivElement} container
 * @param {any} book
 * @param {boolean} expand
 * @param {HTMLUListElement} replace
 */
function renderTOC(container, book, expand, replace) {
  const list = bookToList(book);
  const rootList = list.querySelector(":scope > li > ul");
  // Clean dups
  rootList.querySelectorAll(":scope > li li[data-key]").forEach((li) => {
    const prev = li.previousElementSibling;
    if (
      prev &&
      prev.querySelector("a").textContent.trim() ===
        li.querySelector("a").textContent.trim()
    ) {
      prev.remove();
    }
  });

  // remove all first list entries that are identical to their parent
  rootList
    .querySelectorAll(":scope li[data-key] > ul > li:first-child")
    .forEach((li) => {
      const parent = li.parentElement.closest("li");
      if (!parent) return;

      const parentLink = parent.querySelector(":scope > div > a");
      if (!parentLink) return;

      if (parentLink.textContent === li.textContent) {
        li.remove();
      }
    });

  // replace or append
  if (replace) {
    container.replaceChild(list, replace);
  } else {
    container.append(list);
  }

  // Set current
  const current = rootList.querySelector(
    `a[href="${window.location.pathname}"]`
  );
  console.log("current", current);
  if (current) {
    const currentLi = current.closest("li");
    currentLi.classList.add("current");

    // Expand from current leaf to root
    if (expand) {
      let closestListItem = currentLi;
      while (closestListItem) {
        closestListItem.ariaExpanded = "true";
        closestListItem = closestListItem.parentElement.closest("li");
      }
    }

    // Scroll to current - wait a tick and then scroll
    setTimeout(() => {
      requestAnimationFrame(() => {
        container.scrollTop = currentLi.offsetTop;
      });
    }, 100);
  }
}

/**
 * @param {HTMLElement} block
 * @param {HTMLElement} container
 */
function initAdditionalBooks(block, container) {
  const mainBook = container.querySelector("ul");

  // insert books in order defined in metadata
  store.allBooks.forEach((book) => {
    container.append(
      book.mainBook
        ? mainBook
        : html` <ul data-additional-book-href="${book.href}">
            <li data-key="" aria-expanded="false">
              <div>
                <a>${book.title}</a>
                <span>
                  <i class="icon"> ${getIcon("chevron-right")} </i>
                </span>
              </div>
            </li>
          </ul>`
    );
  });

  // load additional book data on block hover, replace toc list once loaded
  block.addEventListener(
    "mouseenter",
    async () => {
      container
        .querySelectorAll("[data-additional-book-href]")
        .forEach((list) => {
          store
            .fetchJSON(list.dataset.additionalBookHref, [
              "default",
              "chapters",
              "topics",
            ])
            .then((data) => {
              const sorted = sortBook(data);
              renderTOC(container, sorted, false, list);
            });
        });
    },
    { once: true }
  );
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  block.innerHTML = "";
  const template = parseFragment(TEMPLATE);

  const toggle = template.querySelector(".toggle-aside");
  const wrapper = block.closest(".sidenav-wrapper");
  wrapper.append(toggle);

  const div = document.createElement("div");

  const docTitle = document.createElement("a");
  docTitle.setAttribute("slot", "document");
  docTitle.href = window.location.href.split("/").slice(0, -2).join("/");
  div.append(docTitle);

  // Render with slots
  render(template, div);
  block.append(template);
  localize(block);

  const curVersionBtn = block.querySelector('[slot="version"]');
  if (curVersionBtn) {
    curVersionBtn.textContent = getMetadata("version-title");
  }

  const curLangBtn = block.querySelector('[slot="language"]');
  if (curLangBtn) {
    curLangBtn.textContent = getMetadata("language-title");
  }

  const toc = block.querySelector(".content-inner .toc-books");
  if (isMobile()) {
    wrapper.parentElement.classList.add("aside-close");
  }

  store.once("article:loaded", (info) => {
    block.querySelector('slot[name="title"]').textContent = info.title;
    block.querySelector('slot[name="date"]').textContent = formatDate(
      info.lastModified
    );
  });

  store.once("book:loaded", (book) => {
    block.querySelector('a[slot="document"]').textContent =
      book.default.data[0].title;

    const sorted = sortBook(book);
    renderTOC(toc, sorted, true);
    initAdditionalBooks(block, toc);

    addEventListeners(wrapper);
    initVersionDropdown(wrapper);
    initLanguagesDropdown(wrapper);
  });

  if (SPA_NAVIGATION) {
    store.on("spa:navigate:article", handleSPANavigation);
  }
}
