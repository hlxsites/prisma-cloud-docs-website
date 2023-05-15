// TODO Search
// TODO a11y
// TODO i18n

import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { render, parseFragment } from '../../scripts/scripts.js';

/**
 * Loads header template
 */
async function load() {
  // fetch nav content & template
  const navMeta = getMetadata('nav');
  const { lang } = document.documentElement;
  const navPath = `${navMeta ? new URL(navMeta).pathname : `/prisma/prisma-cloud/${lang}/nav`}.plain.html`;
  const templatePath = '/blocks/header/header.html';

  const reqNav = fetch(navPath);
  const reqTemplate = fetch(templatePath);

  try {
    const [resNav, resTemplate] = await Promise.all([reqNav, reqTemplate]);
    const [nav, template] = await Promise.all([resNav.text(), resTemplate.text()]);

    return {
      ok: true, nav: parseFragment(nav), template: parseFragment(template),
    };
  } catch (error) {
    console.error(error);
    return { ok: false, error };
  }
}

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
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const res = await load();
  if (res.ok) {
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

    // locale
    const locale = window.placeholders[`/prisma/prisma-cloud/${document.documentElement.lang}`];
    template.querySelector('.locale-home').textContent = locale.home;
    template.querySelector('.locale-location').textContent = locale.location;
    template.querySelector('.locale-menu').textContent = locale.menu;
    template.querySelector('.locale-search-panel-close').ariaLabel = locale.searchPanelClose;
    template.querySelector('.locale-search-panel-open').ariaLabel = locale.searchPanelOpen;

    block.firstElementChild.replaceWith(...template.children);

    addEventListeners(block);
    decorateIcons(block);

    document.body.querySelector('header').classList.add('loaded');
  }
}
