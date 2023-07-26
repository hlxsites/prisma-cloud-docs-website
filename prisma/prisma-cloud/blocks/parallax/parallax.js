import { html, isMobile } from "../../scripts/scripts.js";
import Animation from "./animation.js";

function mapEach(element, callback) {
  if (element instanceof window.HTMLElement) {
    return [callback(element)];
  }

  return map(element, callback);
}

/**
 * @param {HTMLDivElement} block
 */
export default function decorate(block) {
  block.append(html`
    <div class="parallax__layers">
      <div class="parallax__layer parallax__layer__0" data-amount="200">
        <div class="item"></div>
      </div>
      <div class="parallax__layer parallax__layer__1" data-amount="50">
        <div class="item"></div>
      </div>
    </div>
  `);

  const elements = block.querySelectorAll(".parallax__layer");
  if (elements && !isMobile()) {
    const animations = new Animation({ elements });
  }
}
