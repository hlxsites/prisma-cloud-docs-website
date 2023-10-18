/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // adjust previous heading to h2, with smaller class, if needed
  const prevWrapper = block.parentElement.previousElementSibling;
  if (!prevWrapper) return;

  const heading = prevWrapper.querySelector('h3,h4,h5,h6');
  if (!heading) return;

  const cls = heading.tagName.toLowerCase();
  const newHeading = document.createElement('h2');
  newHeading.textContent = heading.textContent;
  newHeading.id = heading.id;
  newHeading.classList.add(cls);
  heading.replaceWith(newHeading);
}
