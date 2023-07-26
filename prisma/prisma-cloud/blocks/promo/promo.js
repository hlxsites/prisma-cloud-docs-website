import { html } from "../../scripts/scripts.js";

/**
 * @param {HTMLDivElement} block
 */
export default function decorate(block) {
  block.append(html`
    <div class="promo-actions">
      <a
        href="https://github.com/hlxsites/prisma-cloud-docs"
        target="_blank"
        class="button-primary button-primary--blue"
        >Go to GitHub</a
      >
    </div>
  `);
}
