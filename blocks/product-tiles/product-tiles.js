import { html } from '../../scripts/scripts.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`product-tiles-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const link = col.querySelector('a');
      if (!link) {
        return;
      }
      const wrapLink = html`<a href="${link.href}">`;
      [...col.children].forEach((child) => {
        child.remove();
        wrapLink.appendChild(child);
      });
      col.appendChild(wrapLink);
      // wrapLink.appendChild(col);
    });
  });
}
