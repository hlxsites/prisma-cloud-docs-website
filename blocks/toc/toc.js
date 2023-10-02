/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const ul = document.createElement('ul');
  block.querySelectorAll('.sectlevel2 li').forEach((li) => {
    ul.append(li);
  });
  block.innerHTML = '';
  block.append(ul);
}
