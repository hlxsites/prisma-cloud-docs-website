import { parseFragment, render } from "../../scripts/scripts.js";

const TEMPLATE_BUTTON = `
<button slot="category-button" class="ops-nav-item">
    <span class="ops-nav-item-title"></span>
  <span>></span>
</button>
`;

const TEMPLATE = /* html */ `
<div class="ops-intro">
    <div class="ops-intro-header">
    </div>
  <div slot="buttons" class="ops-nav"></div>
</div>
`;

/**
 * @param {HTMLElement} block the container element
 */
async function renderContent(block) {
  const rows = [...block.querySelectorAll(":scope > div")];
  const overview = rows[0].querySelector(":scope > div");
  console.log("overview : ", overview);
  const categories = rows[1].querySelectorAll(":scope > div");
  console.log("categories: ", categories);

  const template = parseFragment(TEMPLATE);
  const buttonsSlot = template.querySelector('[slot="buttons"]');
  const headerSlot = template.querySelector(".ops-intro-header");

  overview.setAttribute("data-category-id", "overview");
  overview.classList.add("header-section", "is-active");
  headerSlot.append(overview);

  categories.forEach((category) => {
    const _fragment = parseFragment(TEMPLATE_BUTTON);
    const root = _fragment.querySelector(".ops-nav-item");
    const title = category.querySelector("h1");
    const id = title.getAttribute("id");

    root.setAttribute("data-category-id", id);
    const titleSpan = _fragment.querySelector(".ops-nav-item-title");
    titleSpan.textContent = title.textContent;
    buttonsSlot.append(_fragment);

    category.setAttribute("data-category-id", id);
    category.classList.add("header-section");
    headerSlot.append(category);
  });

  // const template = parseFragment(TEMPLATE);
  const fragment = document.createElement("div");

  // Render with slots
  render(template, fragment);
  // Clear out generated HTML
  block.innerHTML = "";
  block.append(template);
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  await renderContent(block);
}
