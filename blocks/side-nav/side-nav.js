import { assertValidDocsURL, html } from '../../scripts/scripts.js';

/**
 * @param {string} path
 * @returns {Promise<Record<string, unknown>>}
 */
async function loadNavJSON(path) {
  assertValidDocsURL(path);

  const resp = await fetch(`${path}.json?sheet=default&sheet=chapters&sheet=topics`);
  if (!resp.ok) return null;
  try {
    return await resp.json();
  } catch (e) {
    console.error('failed to parse nav: ', e);
    return null;
  }
}

const template = () => html`
    <div class="toc-wrapper">
      <div class="toggle-aside">
        <i class="icon-arrow-up"></i>
      </div>
      <h2>Table of Contents</h2>
      <hr>
      <div class="toc"></div>
    </div>`;

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();

  /** @type {Record<string, any[]>} */
  const json = await loadNavJSON(path);
  block.innerHTML = '';
  block.appendChild(template());
  const toc = block.querySelector('.toc');
  console.log('[sidenav] json: ', json);

  const { chapters } = json;
  chapters.forEach((chapter) => {
    const { topics } = chapter;
    toc.appendChild(html`
      <ul>
        <li>
          ${chapter.name}
          <ul>${topics.map((topic) => /* html */`
            <ul>
              <li>
                ${topic.name}
              </li>
            </ul>`).join('')}
          </ul>
        </li>
      </ul>`);
  });
}
