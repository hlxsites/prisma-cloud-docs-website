import {
  decoratePills, html, isValidDocsURL, isValidWebURL,
} from '../../scripts/scripts.js';

/**
 * @param {HTMLElement} block
 */
function extractColWidths(block) {
  const firstRow = block.querySelector('div');
  const firstCol = firstRow.querySelector('div');
  if (firstCol.innerText !== 'col-widths') {
    return [];
  }

  const cols = firstCol.nextElementSibling.textContent.split(',');
  const maxVal = parseInt([...cols].sort().reverse()[0], 10);
  const widths = cols.map((swid) => Math.round((100 * parseInt(swid, 10)) / maxVal));
  firstRow.remove();
  return widths;
}

/**
 * @param {HTMLElement} block
 */
function extractColSpans(block) {
  const firstRow = block.querySelector('div');
  const firstCol = firstRow.querySelector('div');
  if (firstCol.innerText !== 'col-spans') {
    return [];
  }

  const cols = firstCol.nextElementSibling.textContent.split(',');
  firstRow.remove();
  return cols;
}

async function sheetToDivTable(path) {
  let href = path;
  if (!href) return null;
  if (!href.startsWith('/') && !href.startsWith('.')) {
    if (isValidWebURL(href)) {
      try {
        href = href.slice(new URL(href).origin.length);
      } catch (_) {
        // noop
      }
    } else if (!isValidDocsURL(href)) {
      return null;
    }
  }

  const json = await store.fetchJSON(href);
  if (!json || !json.data) {
    return null;
  }

  let tableStr = '<div>';
  json.data.forEach((row, i) => {
    if (i === 0) {
      tableStr += `<div>${Object.keys(row)
        .map((header) => `<div>${header}</div>`)
        .join('')}</div>`;
    }
    tableStr += `<div>${Object.values(row)
      .map((cell) => `<div>${cell}</div>`)
      .join('')}</div>`;
  });
  tableStr += '</div>';

  return html`${tableStr}`;
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const headless = block.classList.contains('headless');
  const colSpans = extractColSpans(block);
  const colWidths = extractColWidths(block);

  let rows = [...block.querySelectorAll(':scope > div')];
  if (rows.length === 1 && rows[0].children.length === 1) {
    const cell = rows[0].children.item(0);
    const link = cell.querySelector('a');
    if (link && cell.childElementCount === 1) {
      const divTable = await sheetToDivTable(link.href || link.innerText);
      if (divTable) {
        rows = [...divTable.querySelectorAll(':scope > div')];
      }
    }
  }

  if (!rows) return;

  const table = document.createElement('table');
  block.innerHTML = '';
  block.appendChild(table);

  if (colWidths.length) {
    const colgroup = document.createElement('colgroup');
    colWidths.forEach((colWidth) => {
      const col = document.createElement('col');
      col.style.width = `${colWidth}%`;
      colgroup.appendChild(col);
    });

    table.appendChild(colgroup);
  }

  if (!headless) {
    const head = rows.shift();
    if (!head) return;

    const cells = [...head.querySelectorAll(':scope > div')];
    const thead = html` <table>
      <thead>
        <tr>
          ${cells.map((cell, i) => `<th${colSpans[i] ? ` colspan="${colSpans[i]}"` : ''}>${cell.innerHTML}</th>`).join('\n')}
        </tr>
      </thead>
    </table>`.firstElementChild;
    table.appendChild(thead);
  }

  const tbody = html`<table>
    <tbody></tbody>
  </table>`.firstElementChild;
  table.appendChild(tbody);

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const tr = html` <table>
      <tr>
        ${cells.map((cell) => `<td>${cell.innerHTML}</td>`).join('\n')}
      </tr>
    </table>`.firstElementChild.firstElementChild;
    tbody.appendChild(tr);
  });

  decoratePills(table);
}
