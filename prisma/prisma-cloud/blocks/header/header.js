/* eslint-disable prefer-template */
// TODO a11y
// TODO i18n

import { getMetadata } from '../../scripts/lib-franklin.js';
import {
  PATH_PREFIX,
  isMobile,
  parseFragment,
  render,
  renderBreadCrumbs,
} from '../../scripts/scripts.js';
import '../language-selector/language-selector.js';
import '../search-bar/search-bar.js';
import '../theme-toggle/theme-toggle.js';

// <search-bar data-default-option="all"></search-bar>
const TEMPLATE = /* html */ `    
  <!-- Mobile -->
  <section class="pan-mobile-nav">
      <div class="nav-header">
          <div class="nav-header-top">
              <button class="btn-close btn-close-nav">
                <svg class="icon icon-close" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <title>Close</title>
                  <path d="M5.056 25.057c-0.521 0.521-0.521 1.365 0 1.886s1.365 0.521 1.886 0l9.057-9.057 9.057 9.057c0.521 0.521 1.365 0.521 1.886 0s0.521-1.365 0-1.886l-9.057-9.057 9.057-9.057c0.521-0.521 0.521-1.365 0-1.886s-1.365-0.521-1.886 0l-9.057 9.057-9.057-9.057c-0.521-0.521-1.365-0.521-1.886 0s-0.521 1.365 0 1.886l9.057 9.057-9.057 9.057z"></path>
                </svg>
              </button>
          </div>

          <div class="nav-breadcrumbs">
              <button type="button" class="btn-back">
                <svg class="icon icon-back" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <title>back</title>
                  <path d="M15.149 24.54c-0.733 0.747-1.921 0.747-2.654 0l-6.42-6.538c-1.167-1.188-1.167-3.116 0-4.304l6.42-6.538c0.733-0.747 1.921-0.747 2.654 0s0.734 1.96 0 2.708l-3.91 3.982h13.211c1.105 0 2 0.895 2 2s-0.895 2-2 2h-13.211l3.91 3.982c0.734 0.748 0.734 1.96 0 2.708z"></path>
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
              <div class="nav-expand">
              <svg class="icon icon-arrow" focusable="false" aria-label="Expand" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <title>Right Arrow</title>
                <path d="M7.527 0.669c-0.893 0.893-0.893 2.34 0 3.232l11.29 11.29c0.446 0.446 0.446 1.17 0 1.616l-11.29 11.29c-0.893 0.893-0.893 2.34 0 3.232s2.34 0.893 3.232 0l13.714-13.714c0.893-0.893 0.893-2.34 0-3.232l-13.714-13.714c-0.893-0.893-2.34-0.893-3.232 0z"></path>
              </svg>
              </div>
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
        <theme-toggle></theme-toggle>
        <language-selector></language-selector>
      </div>
  </section>

  <!-- Search -->
  <div class="pan-search-panel">
    <div class="search-panel-container">
      <!-- Start: Coveo Search Box Implementation -->
      <search-bar></search-bar>

      <!-- Start: Coveo Search Box Implementation -->
      <button class="btn-close search-panel-close locale-search-panel-close">
        <svg class="icon search-panel-close-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <title>Close</title>
          <path d="M5.056 25.057c-0.521 0.521-0.521 1.365 0 1.886s1.365 0.521 1.886 0l9.057-9.057 9.057 9.057c0.521 0.521 1.365 0.521 1.886 0s0.521-1.365 0-1.886l-9.057-9.057 9.057-9.057c0.521-0.521 0.521-1.365 0-1.886s-1.365-0.521-1.886 0l-9.057 9.057-9.057-9.057c-0.521-0.521-1.365-0.521-1.886 0s-0.521 1.365 0 1.886l9.057 9.057-9.057 9.057z"></path>
        </svg>
      </button>
    </div>
  </div>

  <!-- Desktop -->
  <div class="pan-desktop-nav">
      <button type="button" class="action-icon nav-open-sidemenu">
          <!-- <span class="locale-menu"></span> -->
          <svg focusable="false" class="icon icon-hamburger" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <title>Menu</title>
            <path d="M7.5 7h17c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5h-17c-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5z"></path>
            <path d="M7.5 21h17c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5h-17c-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5z"></path>
            <path d="M7.5 14h17c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5h-17c-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5z"></path>
          </svg>
      </button>
      <!-- Logo -->
      <section class="nav-logo-section dropdown">
          <div class="nav-logo">
              <slot name="logo"></slot>
              <svg class="icon icon-arrow" focusable="false" aria-label="Expand" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <title>Arrow</title>
                <path d="M7.527 0.669c-0.893 0.893-0.893 2.34 0 3.232l11.29 11.29c0.446 0.446 0.446 1.17 0 1.616l-11.29 11.29c-0.893 0.893-0.893 2.34 0 3.232s2.34 0.893 3.232 0l13.714-13.714c0.893-0.893 0.893-2.34 0-3.232l-13.714-13.714c-0.893-0.893-2.34-0.893-3.232 0z"></path>
              </svg>
          </div>
          <div class="nav-logo-menu drawer">
              <slot name="logo-menu"></slot>
          </div>
      </section>

      <!-- Menu -->
      <section class="nav-menu-section">
          <nav class="nav">
              <section class="nav-list">
                  <slot name="menu"></slot>
              </section>

              <section class="nav-menu-dropdown">
                  <slot name="menu-dropdown"></slot>
              </section>
          </nav>

          <section class="nav-right">
              <button class="nav-search-button locale-search-panel-open">
                <svg focusable="false" class="icon icon-search" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <title>Search</title>
                  <path d="M6 14c0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8s-8-3.582-8-8zM14 2c-6.627 0-12 5.373-12 12s5.373 12 12 12c2.592 0 4.991-0.822 6.953-2.219l5.633 5.633c0.781 0.781 2.047 0.781 2.828 0s0.781-2.047 0-2.828l-5.633-5.633c1.397-1.962 2.219-4.361 2.219-6.953 0-6.627-5.373-12-12-12z"></path>
                </svg>
                <span class="nav-search-title">Search All Documentation</span>
                <div class="nav-search-key">/</div>
              </button>
          </section>
      </section>
  </div>

  <div class="nav-mobile-books">
  <button type="button" class="nav-open-booksmenu">
    <svg focusable="false" class="icon icon-books" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <title>Show Docs</title>
      <path fill="none" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="4" stroke-width="3" d="M6 3.5h20c1.381 0 2.5 1.119 2.5 2.5v20c0 1.381-1.119 2.5-2.5 2.5h-20c-1.381 0-2.5-1.119-2.5-2.5v-20c0-1.381 1.119-2.5 2.5-2.5z"></path>
      <path fill="none" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="4" stroke-width="3"  d="M12.833 2v25.667"></path>          
    </svg>
    <span class="label">Table of Contents</span>
    <svg class="icon icon-arrow" focusable="false" aria-label="Expand" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <title>Right Arrow</title>
      <path d="M7.527 0.669c-0.893 0.893-0.893 2.34 0 3.232l11.29 11.29c0.446 0.446 0.446 1.17 0 1.616l-11.29 11.29c-0.893 0.893-0.893 2.34 0 3.232s2.34 0.893 3.232 0l13.714-13.714c0.893-0.893 0.893-2.34 0-3.232l-13.714-13.714c-0.893-0.893-2.34-0.893-3.232 0z"></path>
    </svg>
</button>
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
  const navPath = `${
    navMeta ? new URL(navMeta).pathname : `${PATH_PREFIX}/${lang}/nav`
  }.plain.html`;

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

// function localize(block) {
//   queueMicrotask(async () => {
//     const ph = await getPlaceholders();
//     block.querySelector('.locale-home').textContent = ph?.home;
//     block.querySelector('.locale-location').textContent = ph?.location;
//     block.querySelector('.locale-menu').textContent = ph?.menu;
//     block.querySelector('.locale-search-panel-close').ariaLabel = ph?.searchPanelClose;
//     block.querySelector('.locale-search-panel-open').ariaLabel = ph?.searchPanelOpen;
//   });
// }

/**
 * Add menu dropdowns, mobile columns and search interactions
 * @param {Element} block The header block element
 */
function addEventListeners(block) {
  const mobileBooksNav = document.querySelector('.sidenav-container');
  const mobileNav = block.querySelector('.pan-mobile-nav');
  const desktopNav = block.querySelector('.pan-desktop-nav');
  const searchPanel = block.querySelector('.pan-search-panel');

  /* Mobile */
  const mobileBooksMenuButton = block.querySelector('.nav-open-booksmenu');
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

  mobileBooksMenuButton.addEventListener('click', () => {
    document.body.classList.toggle('no-body-scroll');
    mobileBooksMenuButton.classList.toggle('is-active');
    mobileBooksNav.classList.toggle('aside-close');
  });

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

  mobileBreadcrumb.addEventListener(
    'click',
    (event) => {
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
        for (const el of [
          ...mobileNavMenuDetails.querySelectorAll('a'),
          ...mobileNavRootMenu.querySelectorAll(':scope > li > span'),
        ]) {
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
    },
    true,
  );

  /* Search */
  const searchButtonOpen = desktopNav.querySelector('.nav-search-button');
  const searchButtonClose = searchPanel.querySelector('.search-panel-close');

  // searchButtonOpen.addEventListener(
  //   "mouseenter",
  //   () => {
  //     import("../search-bar/search-bar.js");
  //   },
  //   { once: true }
  // );

  const focusSearchInput = () => {
    // Check for searchbar
    const searchInput = searchPanel.querySelector('.magic-box-input input');

    if (searchInput) {
      // Wait a tick before focusing
      setTimeout(() => {
        searchInput.focus();
      }, 100);
    }
  };

  window.addEventListener('keydown', (e) => {
    const { key } = e;
    const searchIsActive = searchPanel.classList.contains('active');

    if (key === '/' && !searchIsActive) {
      searchPanel.classList.add('active');

      // Focus on search input
      focusSearchInput();
    }

    if (key === 'Escape' && searchIsActive) {
      searchPanel.classList.remove('active');
    }
  });

  searchButtonOpen.addEventListener('click', () => {
    searchPanel.classList.add('active');

    // Focus on search input
    focusSearchInput();
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

  desktopMenus.forEach((menu) => {
    menu.classList.add('drawer');
  });

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
    const root = document.querySelector('.pan-desktop-nav .nav-menu-section');
    root.setAttribute('data-active-section', index);
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
    if (dropDownLeft > 0) {
      activeMenu.setAttribute('style', `left: ${dropDownLeft}px`);
    }
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

  // NOTE: not using nth-child due to safari not lacking support for elements without a parent
  nav.querySelectorAll('div > ul:not([slot="logo-menu"]) > li').forEach((menuItem) => {
    // Move the text node inside a span
    const span = document.createElement('span');
    span.append(menuItem.firstChild);
    menu.append(span);

    const links = menuItem.querySelector('ul');
    menuDropdown.append(links);
  });

  // Render with slots
  render(template, nav);

  // Post render
  const desktopNav = template.querySelector('.pan-desktop-nav');

  //
  const booknameMeta = getMetadata('book-name');
  const searchButtonTitle = desktopNav.querySelector('.nav-search-title');
  const searchBar = desktopNav.querySelector('search-bar');
  if (booknameMeta && searchButtonTitle) {
    searchButtonTitle.innerHTML = booknameMeta;
  } else if (!booknameMeta && searchBar) {
    // data-default-option
    searchBar.setAttribute('data-default-option', 'all');
  }

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

  for (const ul of [...navMenuDropdown.querySelectorAll(':scope > div > ul')].filter(
    (el) => el.querySelectorAll(':scope > ul').length === 0,
  )) {
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
  // localize(block);
  addEventListeners(block);
  // decorateIcons(block);

  document.body.querySelector('header').classList.add('loaded');
  store.emit('header:loaded');

  if (!isMobile()) {
    // renderBreadCrumbs();
  } else {
    store.once('delayed:loaded', renderBreadCrumbs);
  }
}
