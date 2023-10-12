/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  block.classList.add('pan-hero', 'container');
  const h1 = block.querySelector('h1');
  h1.after(document.createElement('hr'));
}
