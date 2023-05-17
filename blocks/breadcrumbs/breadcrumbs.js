import { parseFragment, PATH_PREFIX } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

/**
 * Loads breadcrumbs template
 */
async function load() {
  // fetch template
  const templatePath = '/blocks/breadcrumbs/breadcrumbs.html';

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

/** @param {HTMLDivElement} block */
export default async function decorate(block) {
  const res = await load();
  if (res.ok) {
    const { template } = res;

    const div = document.createElement('div');
    div.setAttribute('slot', 'book');

    const slot = template.querySelector('slot');

    if (getMetadata('template') === 'book') {
      const { lang } = document.documentElement;

      const path = [];
      const pathname = window.location.pathname.replace(PATH_PREFIX, '').split('/').slice(2);

      const additionalNavItems = pathname.map((subPath, index) => {
        path.push(subPath);

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `${window.location.origin}${PATH_PREFIX}/${lang}/${path.join('/')}`;
        li.append(a);

        // Book
        if (index === 1) {
          a.textContent = window.book.default.data[0].title;
          a.href = `${window.location.origin}${PATH_PREFIX}/${lang}/${path.join('/')}`;

          return li;
        }

        // TODO Identify version via meta

        // Chapter
        if (index === 2) {
          const chapter = window.book.chapters.data.find(({ key }) => key === subPath);
          if (chapter) {
            a.textContent = chapter.name;
            a.href = `${window.location.origin}${PATH_PREFIX}/${lang}/${path.join('/')}/${chapter.key}`;

            return li;
          }
        }

        // Topic
        if (index > 2) {
          const topic = window.book.topics.data.find(({ key }) => key.replaceAll('_', '-') === subPath);
          if (topic && topic.key.replaceAll('_', '-') !== topic.chapter) {
            a.textContent = topic.name;

            return li;
          }
        }

        return null;
      })
        .filter((el) => el !== null);

      slot.replaceWith(...additionalNavItems);
    } else {
      slot.remove();
    }

    // locale
    const locale = window.placeholders[`${PATH_PREFIX}/${document.documentElement.lang}`];
    template.querySelector('.locale-home').textContent = locale.home;
    template.querySelector('.locale-prisma').textContent = locale.prisma;
    template.querySelector('.locale-prisma-cloud').textContent = locale.prismaCloud;

    block.innerHTML = '';
    block.classList.add('container');
    block.append(template);
  }
}
