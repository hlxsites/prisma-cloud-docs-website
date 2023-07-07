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
} from "../../scripts/scripts.js";

import {
  getMetadata,
  loadBlocks,
  updateSectionsStatus,
} from "../../scripts/lib-franklin.js";

const TEMPLATE = /* html */ `
  <article class="pan-article">
    <div class="article-actions">
      <div class="back-home">
          <a href="#" target="_blank" rel="nofollow">
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
      <div class="banner">
          <div class="banner-inner">
            <span class="banner-inner-desktop">
              <h2>
                  <span class="locale-article-document">Document:</span>
                  <slot name="document"></slot>
              </h2>
              <span class="title">
                <h1><slot name="title"></slot></h1>
              </span>
              <span class="last-updated">
              Last updated:&nbsp;
              <slot name="time"></slot>
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
              <div class="book-content">
                  <slot name="content"></slot>
              </div>
          </div>
      </div>
  </article>`;

/**
 * @param {HTMLDivElement} block
 */
function localize(block) {
  queueMicrotask(async () => {
    const ph = await getPlaceholders();
    block.querySelector(".locale-article-previous").textContent = ph.previous;
    block.querySelector(".locale-article-next").textContent = ph.next;
    block.querySelector(".locale-article-edit-github").textContent =
      ph.editOnGithub;
    block.querySelector(".locale-article-document").textContent = ph.document;
  });
}

function shouldRedirectMissing() {
  if (store.redirectedArticle) {
    return false;
  }
  const { pathname } = window.location;
  const segments = pathname.substring(PATH_PREFIX.length).split("/").slice(2);
  const version = getMetadata("version");
  return segments.length >= (version === "not-applicable" ? 4 : 5);
}

async function redirectToFirstChapter() {
  const book = await loadBook(store.mainBook.href);
  if (!book) return;

  const chapter = book.chapters.data[0];
  const version = getMetadata("version");
  const bookKey = book.default.data[0].path.split("/").pop();
  let redirect = `${PATH_PREFIX}/${document.documentElement.lang}/${
    store.product
  }/${version && version !== "not-applicable" ? `${version}/` : ""}${bookKey}/${
    chapter.key
  }/${chapter.key}`;

  if (store.branch) {
    redirect += `?branch=${store.branch}`;
  }

  // set flag to avoid infinite loops on books with bad first chapter/topics
  try {
    sessionStorage.setItem(REDIRECTED_ARTICLE_KEY, "true");
  } catch (_) {
    redirect += `#${REDIRECTED_ARTICLE_KEY}`;
  }
  window.location.href = redirect;
}

/**
 * @param {HTMLElement} block the container element
 * @param {string} hrefOrRes href on render, html string on rerender
 * @param {*} rerender whether this is a rerender
 */
async function renderContent(block, hrefOrRes, rerender = false) {
  let articleFound = true;
  block.innerHTML = "";

  let res = hrefOrRes;
  if (!rerender) {
    res = await loadArticle(hrefOrRes);
    if (!res || !res.ok) {
      console.error(`failed to load article (${res.status}): `, res);
      if (res.status === 404 && shouldRedirectMissing()) {
        await redirectToFirstChapter();
      }
      articleFound = false;
      block.classList.add("not-found");
    }
  }

  const template = parseFragment(TEMPLATE);
  const fragment = document.createElement("div");

  const docTitle = document.createElement("a");
  docTitle.setAttribute("slot", "document");
  docTitle.href = window.location.href.split("/").slice(0, -2).join("/");
  docTitle.textContent = store.mainBook.title;
  fragment.append(docTitle);

  if (articleFound) {
    const { html, info } = res;
    console.log("res: ", res);
    const article = parseFragment(html);

    // Set last updated
    const lastUpdated = res?.info?.lastModified;
    if (lastUpdated) {
      const lastUpdatedLocale = lastUpdated.toLocaleString("default", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const time = document.createElement("time");
      time.setAttribute("slot", "time");
      time.textContent = lastUpdatedLocale;
      time.setAttribute("datetime", lastUpdated.toISOString());
      fragment.append(time);
    }

    // Fixup images src
    for (const image of article.querySelectorAll("img")) {
      console.log("image: ", image);
      const imageURL = new URL(image.src);

      if (store.branch) {
        setBranch(imageURL, store.branch);
        image.src = imageURL.toString();
      } else {
        image.src = `${store.docsOrigin}${imageURL.pathname}`;
      }

      const picture = image.parentElement;
      if (picture.tagName === "PICTURE") {
        for (const source of picture.querySelectorAll("source")) {
          const search = source.srcset.split("?")[1];
          source.srcset = `${image.src}?${search}`;
        }
      }
    }

    const articleTitle = article.querySelector("h1, h2");
    if (articleTitle) {
      info.title = articleTitle.textContent;
      document.title = info.title;
      const span = document.createElement("span");
      span.setAttribute("slot", "title");
      span.textContent = info.title;
      articleTitle.remove();
      fragment.append(span);
    }

    const content = document.createElement("div");
    content.setAttribute("slot", "content");
    content.append(article);

    fragment.append(content);

    // Remove class if coming from first chapter
    block.classList.remove("not-found");

    store.emit("article:loaded", info);
  }

  // Render with slots
  render(template, fragment);
  block.append(template);
  localize(block);

  // Post render
  block.querySelector(
    ".edit-github a"
  ).href = `https://github.com/hlxsites/prisma-cloud-docs/blob/main/${window.location.pathname.replace(
    PATH_PREFIX,
    "docs"
  )}.adoc`;

  if (store.mainBook) {
    loadBook(store.mainBook.href).then((book) => {
      store.emit("book:loaded", book);

      if (!articleFound) return;

      // to use the title from the book definition instead of metadata
      // const docSlot = block.querySelector('slot[name="document"]');
      // docSlot.textContent = book.default.data[0].title;

      const hrefParts = window.location.href.split("?")[0].split("/");
      const subPath = hrefParts.pop();
      const topicIndex = book.topics.data.findIndex(
        ({ key }) => key === subPath
      );
      const currentTopic = book.topics.data[topicIndex];
      const prevTopic = book.topics.data[topicIndex - 1];
      const nextTopic = book.topics.data[topicIndex + 1];

      if (prevTopic) {
        if (prevTopic.chapter === currentTopic.chapter) {
          block.querySelector(".prev").href = `${hrefParts.join(
            "/"
          )}/${prevTopic.key.replaceAll("_", "-")}`;
        } else {
          block.querySelector(".prev").href = `${hrefParts
            .slice(0, -1)
            .join("/")}/${prevTopic.chapter}/${prevTopic.key.replaceAll(
            "_",
            "-"
          )}`;
        }
      }

      if (nextTopic) {
        if (nextTopic.chapter === currentTopic.chapter) {
          block.querySelector(".next").href = `${hrefParts.join(
            "/"
          )}/${nextTopic.key.replaceAll("_", "-")}`;
        } else {
          block.querySelector(".next").href = `${hrefParts
            .slice(0, -1)
            .join("/")}/${nextTopic.chapter}/${nextTopic.key.replaceAll(
            "_",
            "-"
          )}`;
        }
      }
    });
  }

  // Load sidenav, once
  if (!rerender) {
    renderSidenav(block);
  }

  if (articleFound) {
    const bookContent = block.querySelector(
      '.book-content div[slot="content"]'
    );
    if (bookContent) {
      decorateMain(bookContent);
      loadBlocks(bookContent).then(() => {
        updateSectionsStatus(bookContent);
      });
    }
  }
}

/** @param {HTMLDivElement} block */
export default async function decorate(block) {
  const link = block.querySelector("a");
  if (link) {
    try {
      const href = link.getAttribute("href") || link.innerText;
      if (href) {
        if (store.branch) {
          const url = new URL(href);
          setBranch(url, store.branch);

          await renderContent(block, url.toString());
        } else {
          await renderContent(block, href);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (SPA_NAVIGATION) {
    store.on("spa:navigate:article", async (res) => {
      await renderContent(block, res, true);
      block.querySelector("article").scrollIntoView();
    });
  }

  // Wrap images in div
  for (const image of block.querySelectorAll("img")) {
    const imageWrapper = document.createElement("div");
    imageWrapper.setAttribute("class", "image-wrapper");
    image.insertAdjacentElement("afterend", imageWrapper);
    imageWrapper.append(image);
  }
}
