import { parseFragment, PATH_PREFIX } from '../../scripts/scripts.js';

/**
 * Loads sidenav template
 */
async function load() {
  // fetch template
  const templatePath = '/blocks/sidenav/sidenav.html';

  try {
    const reqTemplate = await fetch(templatePath);

    return {
      ok: true, template: parseFragment(await reqTemplate.text()),
    };
  } catch (error) {
    console.error(error);
    return { ok: false, error };
  }
}

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

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const res = await load();

  if (res.ok) {
    const { template } = res;

    // locale
    const locale = window.placeholders[`${PATH_PREFIX}/${document.documentElement.lang}`];
    template.querySelector('.locale-toc-form-input').placeholder = locale.tocFormInput;
    template.querySelector('.locale-book-last-updated').textContent = locale.bookLastUpdated;
    template.querySelector('.locale-book-current-version').textContent = locale.bookCurrentVersion;
    template.querySelector('.locale-toc-title').textContent = locale.tocTitle;
    template.querySelector('.locale-toc-filter').textContent = locale.tocFilter;

    block.innerHTML = '';

    const toggle = template.querySelector('.toggle-aside');
    const wrapper = block.closest('.sidenav-wrapper');
    wrapper.classList.add('hidden-xs');

    wrapper.append(toggle);
    block.append(template);

    addEventListeners(wrapper);

    // TODO display TOC links and filter
  }
}
