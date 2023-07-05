import {
  PATH_PREFIX, SPA_NAVIGATION, getPlaceholders, loadBook, parseFragment,
} from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

const TEMPLATE = /* html */`
  <nav class="pan-breadcrumbs">
    <ol>
        <li>
            <a href="/" class="locale-home"></a>
        </li>
        <li>
            <a href="/prisma" class="locale-prisma"></a>
        </li>
        <li>
            <a href="/prisma/prisma-cloud" class="locale-prisma-cloud"></a>
        </li>
        <slot></slot>
    </ol>
  </nav>`;

/**
 *
 * @param {HTMLDivElement} block
 */
function localize(block) {
  queueMicrotask(async () => {
    const ph = await getPlaceholders();
    block.querySelector('.locale-home').textContent = ph.home;
    block.querySelector('.locale-prisma').textContent = ph.prisma;
    block.querySelector('.locale-prisma-cloud').textContent = ph.prismaCloud;
  });
}

function renderContent(block, book) {
  block.innerHTML = '';

  const fragment = parseFragment(TEMPLATE);

  const slot = fragment.querySelector('slot');
  if (store.pageTemplate !== 'book' || !book) {
    slot.remove();
  } else {
    const { lang } = document.documentElement;
    const path = [];
    const pathname = window.location.pathname.replace(PATH_PREFIX, '').split('/').slice(2);

    const additionalNavItems = pathname.map((subPath, index) => {
      path.push(subPath);

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `${PATH_PREFIX}/${lang}/${path.join('/')}`;
      li.append(a);

      // Book
      if (index === 1) {
        a.textContent = book.default.data[0].title;
        a.href = `${PATH_PREFIX}/${lang}/${path.join('/')}`;

        return li;
      }

      // TODO Identify version via meta

      // Chapter
      if (index === 2) {
        const chapter = book.chapters.data.find(({ key }) => key === subPath);
        if (chapter) {
          a.textContent = chapter.name;
          a.href = `${PATH_PREFIX}/${lang}/${path.join('/')}/${chapter.key}`;

          return li;
        }
      }

      // Topic
      if (index > 2) {
        const topic = book.topics.data.find(({ key }) => key.replaceAll('_', '-') === subPath);
        if (topic && topic.key.replaceAll('_', '-') !== topic.chapter) {
          a.textContent = topic.name;

          return li;
        }
      }

      return null;
    })
      .filter((el) => el !== null);

    slot.replaceWith(...additionalNavItems);
  }

  block.append(fragment);
  localize(block);
}

/** @param {HTMLDivElement} block */
export default async function decorate(block) {
  const bookHref = block.querySelector('a').href;
  const book = bookHref ? await loadBook(bookHref) : undefined;
  const section = block.closest('.breadcrumbs-container');
  if (section) {
    section.classList.add('section', 'full-width');
  }

  renderContent(block, book);

  if (getMetadata('template').startsWith('landing')) {
    block.classList.add('container');
  } else if (SPA_NAVIGATION) {
    store.on('spa:navigate:article', () => {
      renderContent(block, book);
    });
  }
}
