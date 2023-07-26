import { clamp, lerp, mapRange } from "./maths.js";

export default class ParallaxItem {
  constructor({ element }) {
    this.element = element.querySelector("div");

    this.disableOnMobile = true;
    this.ease = 0.12;
    this.desktopAmount = parseInt(element.getAttribute("data-amount")) || 0;
    this.parallax = {
      current: -this.amount || 0,
      target: -this.amount || 0,
      previous: -this.amount || 0,
    };

    this.onResize();
  }

  getOffset(element, scroll = 0) {
    const box = element.getBoundingClientRect();

    return {
      bottom: box.bottom,
      height: box.height,
      left: box.left,
      top: box.top + scroll,
      width: box.width,
    };
  }

  onResize(scrollY = 0) {
    this.amount = this.desktopAmount;
    // Wait a tick
    setTimeout(() => {
      this.offset = this.getOffset(this.element, scrollY);
    }, 100);
  }

  update(scroll, wh) {
    if (!this.offset) {
      return;
    }

    const offsetBottom = scroll.current + wh;

    if (offsetBottom >= this.offset.top) {
      const targetParallax = clamp(
        -this.amount,
        this.amount,
        mapRange(
          -this.offset.height,
          wh,
          this.offset.top - scroll.target,
          this.amount,
          -this.amount
        )
      );

      this.parallax.previous = lerp(
        this.parallax.previous || -this.amount,
        targetParallax,
        this.ease
      );

      this.element.style.transform = `translate3d(0, ${this.parallax.previous}px, 0)`;
    } else {
      this.element.style.transform = `translate3d(0, -${this.amount}px, 0)`;
    }
  }
}
