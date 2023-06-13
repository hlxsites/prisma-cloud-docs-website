import { html } from '../../scripts/scripts.js';

function extractColWidths(block) {
  const match = /(?:\s|^)colgroup-(?<cols>[^ ]*)/.exec(block.className);
  if (!match) return [];

  const { cols } = match.groups || {};
  if (!cols) return [];

  return cols.split('-');
}

/**
 * @param {HTMLDivElement} block
 */
export default function decorate(block) {
  const headless = block.classList.contains('headless');
  const colWidths = extractColWidths(block);
  const rows = [...block.querySelectorAll(':scope > div')];

  const table = document.createElement('table');

  block.innerHTML = '';
  block.appendChild(table);

  if (colWidths.length) {
    const colgroup = html`
      <colgroup>
        ${colWidths.map((col) => `<col style="width: ${col}%">`).join('\n')}
      </colgroup>`;
    table.appendChild(colgroup);
  }

  if (!headless) {
    const head = rows.shift();
    if (!head) return;

    const cells = [...head.querySelectorAll(':scope > div')];
    const thead = html`
    <table>
      <thead>
        <tr>
          ${cells.map((cell) => `<th>${cell.innerHTML}</th>`).join('\n')}
        </tr>
      </thead>
    </table>`.firstElementChild;
    table.appendChild(thead);
  }

  const tbody = html`<table><tbody></tbody></table>`.firstElementChild;
  table.appendChild(tbody);

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const tr = html`
    <table>
      <tr>
        ${cells.map((cell) => `<td>${cell.innerHTML}</td>`).join('\n')}
      </tr>
    </table>`.firstElementChild.firstElementChild;
    tbody.appendChild(tr);
  });
}
