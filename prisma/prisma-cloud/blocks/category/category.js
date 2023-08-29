/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const rows = [...block.querySelectorAll(":scope > div")];

  const head = rows[1].querySelectorAll(":scope > div");
  const headCols = head.length;
  const content = rows.slice(2, rows.length);

  const { store } = content.reduce(
    (ret, row) => {
      const rowCols = row.querySelectorAll(":scope > div");
      const titleRow = row.firstElementChild;
      const title = titleRow.firstElementChild;
      const slug = title?.getAttribute("id");
      const items = Array.from(
        row.querySelectorAll(":scope > div:not(:first-child)")
      );

      if (ret.store.size === 0 || rowCols.length === headCols) {
        ret.store.set(slug, {
          title: title.textContent,
          teaser: titleRow,
          items,
        });
        ret.title = slug;
      } else if (ret.store.has(ret.title)) {
        const values = ret.store.get(ret.title);

        values.items = [...values.items, ...items];
        ret.store.set(ret.title, values);
      }

      return ret;
    },
    {
      store: new Map(),
      title: null,
    }
  );

  console.log("store : ", store);
}
