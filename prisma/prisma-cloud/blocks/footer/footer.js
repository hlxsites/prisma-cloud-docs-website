import { decorateIcons, readBlockConfig } from "../../scripts/lib-franklin.js";
import { PATH_PREFIX } from "../../scripts/scripts.js";
import "../theme-toggle/theme-toggle.js";
/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = "";

  // fetch footer content
  const footerPath =
    cfg.footer || `${PATH_PREFIX}/${document.documentElement.lang}/footer`;
  const resp = await fetch(
    `${footerPath}.plain.html`,
    window.location.pathname.endsWith("/footer") ? { cache: "reload" } : {}
  );

  if (!resp.ok) {
    return;
  }

  const html = await resp.text();

  // decorate footer DOM
  const footer = document.createElement("div");
  footer.innerHTML = html;
  decorateIcons(footer);

  const classes = ["links", "socials", "legal"];
  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (!section) {
      return;
    }
    section.classList.add(`footer-${c}`);
  });

  const legal = footer.querySelector(".footer-legal");
  if (legal) {
    const wrap = document.createElement("div");
    wrap.append(...legal.children);
    legal.replaceChildren(wrap);
  }

  block.append(footer);
}
