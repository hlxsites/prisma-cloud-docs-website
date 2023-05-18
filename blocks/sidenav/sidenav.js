import { getPlaceholders, parseFragment } from '../../scripts/scripts.js';

const TEMPLATE = /* html */`
  <aside class="pan-sidenav">
      <div class="toggle-aside">
          <i class="icon-arrow-right"></i>
      </div>
      <div class="banner">
          <div class="banner-inner">
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

      <div class="content hidden-xs">
          <div class="content-inner">
              <div class="toggle-aside">
                  <i class="icon-arrow-left"></i>
              </div>
              <h2 class="locale-toc-title"></h2>
              <hr>
              <div class="search-toc">
                  <div class="search-toc-label">
                      <div class="filter-icon">
                          <img src="/assets/filter.svg" alt="" loading="lazy">
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
      wrapper.classList.toggle('aside-close', !wrapper.classList.contains('aside-close'));
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
  });
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  block.innerHTML = '';
  const fragment = parseFragment(TEMPLATE);

  const toggle = fragment.querySelector('.toggle-aside');
  const wrapper = block.closest('.sidenav-wrapper');
  wrapper.classList.add('hidden-xs');

  wrapper.append(toggle);
  block.append(fragment);
  localize(block);

  addEventListeners(wrapper);

  // TODO display TOC links and filter
}
