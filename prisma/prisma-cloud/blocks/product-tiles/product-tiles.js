export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`product-tiles-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const link = col.querySelector("a");
      if (!link) {
        return;
      }
      // Prevent double wrapping of links
      // const wrapLink = html`<a href="${link.href}"></a>`;
      // [...col.children].forEach((child) => {
      //   child.remove();
      //   wrapLink.appendChild(child);
      // });
      // col.appendChild(wrapLink);
    });
  });
}
