import {
  assertValidDocsURL, DOCS_ORIGINS, getEnv,
  parseFragment, PATH_PREFIX, render,
} from '../../scripts/scripts.js';

import {
  loadBlock,
} from '../../scripts/lib-franklin.js';

/**
 * Loads the article source and template.
 * @param {string} path The path or url to the article
 */
async function load(path) {
  try {
    assertValidDocsURL(path);

    const articlePath = `${path}.plain.html`;
    const templatePath = '/blocks/article/article.html';

    const reqArticle = fetch(articlePath);
    const reqTemplate = fetch(templatePath);

    const [resArticle, resTemplate] = await Promise.all([reqArticle, reqTemplate]);
    const [article, template] = await Promise.all([resArticle.text(), resTemplate.text()]);

    return {
      ok: true, article: parseFragment(article), template: parseFragment(template),
    };
  } catch (error) {
    console.error(error);
    return { ok: false, error };
  }
}

/** @param {HTMLDivElement} block */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const res = await load(path);
  if (res.ok) {
    const { article, template } = res;

    // Fixup images src
    for (const image of article.querySelectorAll('img')) {
      const origin = DOCS_ORIGINS[getEnv()];
      const { pathname } = new URL(image.src);
      image.src = `${origin}${pathname.replace(PATH_PREFIX, `${PATH_PREFIX}/docs`)}`;
    }

    // "Slotify"
    const div = document.createElement('div');
    const docTitle = document.createElement('a');
    docTitle.setAttribute('slot', 'document');
    docTitle.href = window.location.href.split('/').slice(0, -2).join('/');
    docTitle.textContent = window.book.default.data[0].title;
    div.append(docTitle);

    const articleTitle = article.querySelector('h1, h2');
    if (articleTitle) {
      const span = document.createElement('span');
      span.setAttribute('slot', 'title');
      span.textContent = articleTitle.textContent;
      articleTitle.remove();
      div.append(span);
    }

    const content = document.createElement('div');
    content.setAttribute('slot', 'content');
    content.append(article);

    div.append(content);

    // Render with slots
    render(template, div);

    // Post render
    const href = window.location.href.split('/');
    const subPath = href.pop();
    const topicIndex = window.book.topics.data.findIndex(({ key }) => key === subPath.replaceAll('-', '_'));
    const currentTopic = window.book.topics.data[topicIndex];
    const prevTopic = window.book.topics.data[topicIndex - 1];
    const nextTopic = window.book.topics.data[topicIndex + 1];

    if (prevTopic.chapter === currentTopic.chapter) {
      template.querySelector('.prev').href = `${href.join('/')}/${prevTopic.key.replaceAll('_', '-')}`;
    } else {
      template.querySelector('.prev').href = `${href.slice(0, -1).join('/')}/${prevTopic.chapter}/${prevTopic.key.replaceAll('_', '-')}`;
    }

    if (nextTopic.chapter === currentTopic.chapter) {
      template.querySelector('.next').href = `${href.join('/')}/${nextTopic.key.replaceAll('_', '-')}`;
    } else {
      template.querySelector('.next').href = `${href.slice(0, -1).join('/')}/${nextTopic.chapter}/${nextTopic.key.replaceAll('_', '-')}`;
    }

    template.querySelector('.edit-github a').href = `https://github.com/hlxsites/prisma-cloud-docs/blob/main/${window.location.pathname.replace(PATH_PREFIX, 'docs')}.adoc`;

    // locale
    const locale = window.placeholders[`${PATH_PREFIX}/${document.documentElement.lang}`];
    template.querySelector('.locale-article-previous').textContent = locale.articlePrevious;
    template.querySelector('.locale-article-next').textContent = locale.articleNext;
    template.querySelector('.locale-article-edit-github').textContent = locale.articleEditGithub;
    template.querySelector('.locale-article-document').textContent = locale.articleDocument;

    block.innerHTML = '';
    block.append(template);

    // Load article blocks
    const blocks = '.hero, .admonition';
    for (const el of block.querySelectorAll(blocks)) {
      el.setAttribute('data-block-name', el.className.split(' ')[0]);
      loadBlock(el);
    }
  }
}
