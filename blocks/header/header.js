// TODO Search
// TODO a11y
// TODO i18n

import {
  getMetadata, decorateIcons,
} from '../../scripts/lib-franklin.js';
import {
  render, parseFragment, PATH_PREFIX, renderBreadCrumbs, getPlaceholders, isMobile,
} from '../../scripts/scripts.js';

const TEMPLATE = /* html */`
  <!-- Mobile -->
  <section class="pan-mobile-nav hidden-md hidden-lg">
      <div class="nav-header">
          <div class="nav-header-top">
              <button class="btn-close-nav">
                  <svg x="0px" y="0px" viewBox="0 0 128 128">
                          <path d="M71.5,64l54.9-54.9c2.1-2.1,2.1-5.5,0-7.5c-2.1-2.1-5.5-2.1-7.5,0L64,56.5L9.1,1.6C7-0.5,3.6-0.5,1.6,1.6s-2.1,5.5,0,7.5 L56.5,64L1.6,118.9c-2.1,2.1-2.1,5.5,0,7.5c1,1,2.4,1.6,3.8,1.6s2.7-0.5,3.8-1.6L64,71.5l54.9,54.9c1,1,2.4,1.6,3.8,1.6 c1.4,0,2.7-0.5,3.8-1.6c2.1-2.1,2.1-5.5,0-7.5L71.5,64z"></path>
                      </svg>
              </button>
          </div>

          <div class="nav-breadcrumbs">
              <button type="button" class="btn-back">
                  <svg x="0px" y="0px" viewBox="0 0 13 10">
          <path d="M0.2,5.4l4.3,4.3c0.2,0.3,0.6,0.3,0.9,0c0.3-0.2,0.3-0.7,0-0.9L2.3,5.7h9.8c0.4,0,0.7-0.3,0.7-0.7s-0.3-0.7-0.7-0.7H2.3 l3.1-3.1c0.3-0.2,0.3-0.7,0-0.9C5.2,0,4.8,0,4.6,0.3L0.2,4.5C0.1,4.8,0.1,5.2,0.2,5.4z"></path>
        </svg>
              </button>
              <ol class="breadcrumb">
                  <li class="active">
                      <a href="#home" class="locale-home"></a>
                  </li>
              </ol>
          </div>

      </div>

      <div class="nav-inner">
          <nav class="nav-menu-section">
              <div class="nav-expand"><span></span><span></span></div>
              <div class="nav-menu root-menu active">
                  <slot name="menu"></slot>
              </div>
              <div class="nav-menu-details" hidden>
                  <slot name="menu-dropdown"></slot>
              </div>
              <ul class="nav-menu nav-menu-expanded inactive"></ul>
              <ul class="nav-menu nav-menu-expanded inactive"></ul>
          </nav>
      </div>

      <div class="nav-bottom">
          <div class="nav-lang">
              <button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  EN
                  <svg width="9" height="6" viewBox="0 0 9 6">
                      <g fill="none">
                          <g>
                              <path d="M 0 0L 3.5 3.5L 7 0" transform="translate(1 1)" stroke="white" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round"></path>
                          </g>
                      </g>
                  </svg>
              </button>
              <div class="dropdown-menu">
                  <div>
                      <span class="locale-location"></span>
                      <button>
                          <svg width="12" height="12" viewBox="0 0 12 12">
                              <g fill="none">
                                  <g>
                                      <path d="M 10 0L 0 10" transform="translate(1 1)" stroke="#36424B"
                                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M 0 0L 10 10" transform="translate(1 1)" stroke="#36424B"
                                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </g>
                              </g>
                          </svg>
                      </button>
                  </div>
                  <ul class="language-list"></ul>
              </div>
          </div>
      </div>
  </section>

  <!-- Search -->
  <div class="pan-search-panel">
      <div class="search-panel-container container">
          <button class="search-panel-close locale-search-panel-close">
              <i class="ion-ios-close-outline"></i>
          </button>
      </div>
  </div>

  <!-- Desktop -->
  <div class="pan-desktop-nav container">
      <!-- Logo -->
      <section class="nav-logo-section dropdown">
          <div class="nav-logo">
              <slot name="logo"></slot>
          </div>
          <div class="nav-logo-menu">
              <slot name="logo-menu"></slot>
          </div>
      </section>

      <!-- Menu -->
      <section class="nav-menu-section">
          <nav class="nav visible-lg visible-md">
              <section class="nav-list">
                  <slot name="menu"></slot>
                  <img src="/assets/tdlogo-2020-white.webp" alt/>
              </section>

              <section class="nav-menu-dropdown">
                  <slot name="menu-dropdown"></slot>
              </section>
          </nav>

          <section class="nav-right">
              <button class="nav-search-button locale-search-panel-open">
                  <svg x="0px" y="0px" viewBox="0 0 128 128">
                  <path d="M125.9,115.5L94.5,84.1c0,0,0,0-0.1,0C101,75.3,105,64.4,105,52.6c0-29-23.5-52.5-52.5-52.5S0,23.6,0,52.6 s23.5,52.5,52.5,52.5c12,0,22.9-4,31.8-10.8c0,0,0,0,0,0l31.4,31.4c2.8,2.8,7.4,2.8,10.2,0C128.7,122.9,128.7,118.3,125.9,115.5z M52.5,90.6c-21,0-38-17-38-38c0-21,17-38,38-38s38,17,38,38C90.5,73.6,73.5,90.6,52.5,90.6z"></path>
              </svg>
              </button>

              <button type="button" class="hidden-lg hidden-md nav-open-sidemenu">
                  <span class="locale-menu"></span>
              </button>
          </section>
      </section>
  </div>

  <!-- Background themed banner -->
  <div class="pan-banner"></div>`;

/**
 * Loads header template
 */
async function load() {
  // fetch nav content & template
  const navMeta = getMetadata('nav');
  const { lang } = document.documentElement;
  const navPath = `${navMeta ? new URL(navMeta).pathname : `${PATH_PREFIX}/${lang}/nav`}.plain.html`;

  try {
    const res = await fetch(navPath);
    const nav = await res.text();

    return {
      ok: true,
      nav: parseFragment(nav),
      template: parseFragment(TEMPLATE),
    };
  } catch (error) {
    console.error(error);
    return { ok: false, error };
  }
}

function localize(block) {
  queueMicrotask(async () => {
    const ph = await getPlaceholders();
    block.querySelector('.locale-home').textContent = ph.home;
    block.querySelector('.locale-location').textContent = ph.location;
    block.querySelector('.locale-menu').textContent = ph.menu;
    block.querySelector('.locale-search-panel-close').ariaLabel = ph.searchPanelClose;
    block.querySelector('.locale-search-panel-open').ariaLabel = ph.searchPanelOpen;
  });
}

/**
 * Add menu dropdowns, mobile columns and search interactions
 * @param {Element} block The header block element
 */
function addEventListeners(block) {
  const mobileNav = block.querySelector('.pan-mobile-nav');
  const desktopNav = block.querySelector('.pan-desktop-nav');
  const searchPanel = block.querySelector('.pan-search-panel');

  /* Mobile */
  const mobileNavCloseButton = mobileNav.querySelector('.pan-mobile-nav .btn-close-nav');
  const mobileNavRootMenu = mobileNav.querySelector('.pan-mobile-nav .root-menu');
  const mobileNavMenuExpanded = mobileNav.querySelectorAll('.pan-mobile-nav .nav-menu-expanded');
  const mobileNavMenuDetails = mobileNav.querySelector('.pan-mobile-nav .nav-menu-details');
  const mobileNavMenuDetailsItems = mobileNavMenuDetails.querySelectorAll(':scope > div > ul');
  const mobileNavBreadcrumb = mobileNav.querySelector('.pan-mobile-nav .nav-breadcrumbs');
  const mobileBreadcrumb = mobileNavBreadcrumb.querySelector('.breadcrumb');
  const mobileBreadcrumbBackButton = mobileNavBreadcrumb.querySelector('.btn-back');
  const mobileMenuButton = desktopNav.querySelector('.nav-open-sidemenu');

  const toggleActiveMenu = (currentActive, currentInactive) => {
    currentInactive.classList.add('active');
    currentInactive.classList.remove('inactive');
    currentActive.classList.remove('active');
    currentActive.classList.add('inactive');
  };

  const renderMenuItem = (item) => {
    const clone = item.cloneNode(true);
    const ul = clone.querySelector('ul');
    if (ul) {
      ul.remove();
    }

    return clone;
  };

  mobileMenuButton.addEventListener('click', () => {
    document.body.classList.add('no-body-scroll');
    mobileNav.classList.add('active');
  });

  mobileNavCloseButton.addEventListener('click', () => {
    document.body.classList.remove('no-body-scroll');
    mobileNav.classList.remove('active');
  });

  mobileNavRootMenu.addEventListener('click', ({ target }) => {
    if (target.matches('span')) {
      const selectedMenuIndex = [...mobileNavRootMenu.children].indexOf(target.parentElement);
      const selectedMenuDetails = mobileNavMenuDetailsItems[selectedMenuIndex];

      mobileNavMenuExpanded[0].innerHTML = '';
      for (const item of selectedMenuDetails.children) {
        const clone = renderMenuItem(item);
        mobileNavMenuExpanded[0].append(clone);
      }

      toggleActiveMenu(mobileNavRootMenu, mobileNavMenuExpanded[0]);

      const breadcrumbItemHome = mobileBreadcrumb.children[0];
      const newBreadcrumbItem = breadcrumbItemHome.cloneNode(true);
      newBreadcrumbItem.classList.add('active');

      const newBreadcrumbItemLink = newBreadcrumbItem.querySelector('a');
      newBreadcrumbItemLink.textContent = target.textContent;
      newBreadcrumbItemLink.href = `#${target.textContent.trim().replace(/\s/g, '-')}`;
      breadcrumbItemHome.classList.remove('active');
      mobileBreadcrumb.append(newBreadcrumbItem);
      mobileNavBreadcrumb.classList.add('has-back-btn');
    }
  });

  for (const mobileNavMenuExpandedItem of mobileNavMenuExpanded) {
    mobileNavMenuExpandedItem.addEventListener('click', (event) => {
      if (event.target.querySelector('.nav-expand')) {
        event.preventDefault();

        let details;
        for (const link of mobileNavMenuDetails.querySelectorAll('a')) {
          if (link.textContent === event.target.textContent) {
            details = link.closest('li').querySelectorAll(':scope > ul > li');
            break;
          }
        }

        if (details) {
          const active = block.querySelector('.pan-mobile-nav .nav-menu-expanded.active');
          const inactive = block.querySelector('.pan-mobile-nav .nav-menu-expanded.inactive');

          inactive.innerHTML = '';
          inactive.append(...[...details].map((li) => renderMenuItem(li)));

          toggleActiveMenu(active, inactive);

          const breadcrumbItemHome = mobileBreadcrumb.children[0];
          const newBreadcrumbItem = breadcrumbItemHome.cloneNode(true);
          newBreadcrumbItem.classList.add('active');

          const newBreadcrumbItemLink = newBreadcrumbItem.querySelector('a');
          newBreadcrumbItemLink.textContent = event.target.textContent;
          newBreadcrumbItemLink.href = `#${event.target.getAttribute('href')}`;

          mobileBreadcrumb.querySelector('.active').classList.remove('active');
          mobileBreadcrumb.append(newBreadcrumbItem);
        }
      }
    });
  }

  mobileBreadcrumbBackButton.addEventListener('click', () => {
    const active = mobileBreadcrumb.querySelector('.active');
    active.previousElementSibling.querySelector('a').click();
  });

  mobileBreadcrumb.addEventListener('click', (event) => {
    event.preventDefault();

    const li = event.target.closest('li');
    if (li.classList.contains('active')) {
      return;
    }

    const active = block.querySelector('.pan-mobile-nav .nav-menu-expanded.active');
    const inactive = block.querySelector('.pan-mobile-nav .nav-menu-expanded.inactive');

    // Home
    if (li.querySelector('a[href="#home"]')) {
      mobileBreadcrumb.innerHTML = '';
      mobileBreadcrumb.append(li);
      mobileNavBreadcrumb.classList.remove('has-back-btn');

      toggleActiveMenu(active, mobileNavRootMenu);
    } else {
      for (const el of [...mobileNavMenuDetails.querySelectorAll('a'), ...mobileNavRootMenu.querySelectorAll(':scope > li > span')]) {
        if (el.textContent === event.target.textContent) {
          if (mobileBreadcrumb.querySelector('li:nth-child(2)') === li) {
            const selectedMenuIndex = [...mobileNavRootMenu.children].indexOf(el.closest('li'));
            const selectedMenuDetails = mobileNavMenuDetailsItems[selectedMenuIndex];

            inactive.innerHTML = '';
            for (const item of selectedMenuDetails.children) {
              const clone = renderMenuItem(item);
              inactive.append(clone);
            }
          } else {
            const details = el.closest('li').querySelectorAll(':scope > ul > li');

            inactive.innerHTML = '';
            inactive.append(...[...details].map((item) => renderMenuItem(item)));
          }

          toggleActiveMenu(active, inactive);

          const newActiveBreadcrumb = event.target.closest('li');

          while (newActiveBreadcrumb.nextElementSibling) {
            newActiveBreadcrumb.nextElementSibling.remove();
          }
          newActiveBreadcrumb.classList.add('active');

          break;
        }
      }
    }
  }, true);

  /* Search */
  const searchButtonOpen = desktopNav.querySelector('.nav-search-button');
  const searchButtonClose = searchPanel.querySelector('.search-panel-close');
  searchButtonOpen.addEventListener('click', () => {
    searchPanel.classList.add('active');
  });

  searchButtonClose.addEventListener('click', () => {
    searchPanel.classList.remove('active');
  });

  /* Desktop */
  const desktopNavLogo = desktopNav.querySelector('.nav-logo');
  const desktopNavList = desktopNav.querySelector('.nav-list');
  const desktopNavListItems = desktopNavList.querySelectorAll('span');
  const desktopDropdown = desktopNav.querySelector('.nav-menu-dropdown');
  const desktopMenus = desktopDropdown.querySelectorAll('div > ul');

  const clearActive = () => {
    for (const item of desktopNavListItems) {
      item.classList.remove('active');
    }
    const activeMenu = desktopDropdown.querySelector('div > ul.showmenu');
    if (activeMenu) {
      activeMenu.classList.remove('showmenu');
    }
  };

  const showMenu = (target) => {
    clearActive();
    target.classList.add('active');
    desktopDropdown.classList.add('showdropdown');

    const index = [...target.parentElement.children].indexOf(target);
    const activeMenu = desktopMenus[index];
    activeMenu.classList.add('showmenu');

    const panNavDropdown = document.querySelector('.nav-menu-dropdown');
    const linkCenter = target.offsetLeft + target.offsetWidth / 2;
    const dropDownWidth = activeMenu.getBoundingClientRect().width;

    // Snap the dropdown to the left edge for larger menus
    let dropDownLeft = linkCenter - dropDownWidth / 2;

    // Horizontally center the dropdown for the largest menus
    if (dropDownLeft < 0) dropDownLeft = 0;

    const panNavDropdownLeft = panNavDropdown.getBoundingClientRect().left;
    const marginRight = window.screen.width - (panNavDropdownLeft + dropDownWidth);

    if (marginRight < panNavDropdownLeft) {
      dropDownLeft = (marginRight - panNavDropdownLeft) / 2;
    }

    // Set the computed left position
    activeMenu.setAttribute('style', `left: ${dropDownLeft}px`);
  };

  const hideMenu = () => {
    clearActive();
    desktopDropdown.classList.remove('showdropdown');
  };

  desktopNavList.addEventListener('mouseover', ({ target }) => {
    if (target.matches('span')) {
      showMenu(target);
    }
  });

  block.addEventListener('mouseleave', () => {
    hideMenu();
  });

  desktopNavLogo.addEventListener('mouseover', () => {
    hideMenu();
  });
}

/**
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const res = await load();
  if (!res.ok) {
    return;
  }

  const { nav, template } = res;

  // "Slotify"
  nav.querySelector('a').setAttribute('slot', 'logo');
  nav.querySelector('ul').setAttribute('slot', 'logo-menu');

  const menu = document.createElement('div');
  menu.setAttribute('slot', 'menu');
  nav.append(menu);

  const menuDropdown = document.createElement('div');
  menuDropdown.setAttribute('slot', 'menu-dropdown');
  nav.append(menuDropdown);

  for (const menuItem of nav.querySelectorAll('div:nth-child(2) > ul > li')) {
    // Move the text node inside a span
    const span = document.createElement('span');
    span.append(menuItem.firstChild);
    menu.append(span);

    const links = menuItem.querySelector('ul');
    menuDropdown.append(links);
  }

  // Render with slots
  render(template, nav);

  // Post render
  const desktopNav = template.querySelector('.pan-desktop-nav');
  const navList = desktopNav.querySelector('.nav-list');
  const navListItems = navList.querySelectorAll('span');
  const backgroundImage = navList.querySelector('img');
  navListItems.forEach((item) => item.append(backgroundImage.cloneNode(true)));

  const navMenuDropdown = desktopNav.querySelector('.nav-menu-dropdown');
  for (const menuWithIcon of [...navMenuDropdown.querySelectorAll('li')].filter((el) => el.querySelector(':scope > .icon + ul'))) {
    const div = document.createElement('div');
    div.classList.add('has-icon');
    div.append(menuWithIcon.querySelector('.icon'));
    // text child
    div.append(menuWithIcon.firstChild);
    menuWithIcon.prepend(div);
  }
  for (const menuWithoutLink of navMenuDropdown.querySelectorAll('div > ul > li')) {
    if (!menuWithoutLink.querySelector(':scope > a')) {
      const div = document.createElement('div');
      // text child
      div.append(menuWithoutLink.firstChild);
      menuWithoutLink.prepend(div);
    }
  }

  for (const ul of [...navMenuDropdown.querySelectorAll(':scope > div > ul')].filter((el) => el.querySelectorAll(':scope > ul').length === 0)) {
    ul.classList.add('has-not-ul');
  }

  const mobileNav = template.querySelector('.pan-mobile-nav');
  const navMobileRootMenu = mobileNav.querySelector('.root-menu');
  const navMobileRootMenuItems = navMobileRootMenu.querySelectorAll('span:not(:empty)');
  const navMobileMenuDetails = mobileNav.querySelector('.nav-menu-details');
  const navMobileMenuDetailsItems = navMobileMenuDetails.querySelectorAll('li');
  const navMobileMenuExpand = mobileNav.querySelector('.nav-expand');

  for (const navMobileRootMenuItem of navMobileRootMenuItems) {
    navMobileRootMenuItem.append(navMobileMenuExpand.cloneNode(true));
    const li = document.createElement('li');
    li.append(navMobileRootMenuItem);
    navMobileRootMenu.append(li);
  }

  for (const navMobileMenuDetailsItem of navMobileMenuDetailsItems) {
    // Has icon
    const icon = navMobileMenuDetailsItem.querySelector('.icon');
    if (icon) {
      const a = document.createElement('a');
      a.href = '#';
      a.append(icon);
      a.append([...navMobileMenuDetailsItem.childNodes].find((child) => !child.tagName));

      navMobileMenuDetailsItem.prepend(a);
    }

    // Text node only
    if (!navMobileMenuDetailsItem.querySelector(':scope > *:not(ul)')) {
      const a = document.createElement('a');
      a.href = '#';
      a.append(navMobileMenuDetailsItem.firstChild);

      navMobileMenuDetailsItem.prepend(a);
    }

    // Has sub nav items
    if (navMobileMenuDetailsItem.querySelector('ul')) {
      navMobileMenuDetailsItem.querySelector('a, div').append(navMobileMenuExpand.cloneNode(true));
    }
  }
  navMobileRootMenu.querySelector('[slot]').remove();
  navMobileMenuExpand.remove();

  block.firstElementChild.replaceWith(...template.children);
  localize(block);
  addEventListeners(block);
  decorateIcons(block);
  document.body.querySelector('header').classList.add('loaded');

  if (store.pageTemplate === 'book') {
    if (!isMobile()) {
      renderBreadCrumbs();
    } else {
      store.once('delayed:loaded', renderBreadCrumbs);
    }
  }
}
