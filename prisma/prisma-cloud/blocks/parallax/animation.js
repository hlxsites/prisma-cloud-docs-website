import { lerp } from "./maths.js";
import ParallaxItem from "./parallax-item.js";

export default class Animation {
  constructor({ elements }) {
    this.elements = elements;
    this.wrapper = document.body;
    this.animationsParallaxes = [];
    this.wh = window.innerHeight;
    this.scroll = {
      ease: 0.07,
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
    };

    this.createObserver();
    this.createAnimations();
    this.addEvents();
    window.requestAnimationFrame(() => {
      this.update(this);
    });
  }

  createObserver() {
    this.observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        // eslint-disable-line
        window.requestAnimationFrame((_) => {
          this.scroll.limit = this.wrapper.clientHeight - window.innerHeight;
        });
      }
    });

    this.observer.observe(this.wrapper);
  }

  createAnimations() {
    this.elements.forEach((element) => {
      this.animationsParallaxes.push(new ParallaxItem({ element }));
    });
  }

  addEvents() {
    window.addEventListener("scroll", this.onScroll.bind(this));
  }

  onScroll() {
    this.scroll.target = window.scrollY || 0;
  }

  onResize() {
    if (!this.wrapper) return;
    window.requestAnimationFrame((_) => {
      this.wh = window.innerHeight;
      this.scroll.limit = this.wrapper.clientHeight - this.wh;
      this.animationsParallaxes.forEach((animation) => {
        animation.onResize && animation.onResize(this.scroll.target);
      });
    });
  }

  update() {
    //  this.scroll.target = clamp(0, this.scroll.target, this.scroll.limit);

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    this.scroll.current = Math.floor(this.scroll.current);

    if (this.scroll.current < 0.1) {
      this.scroll.current = 0;
    }

    this.animationsParallaxes.forEach((animation) => {
      animation.update && animation.update(this.scroll, this.wh);
    });

    this.scroll.last = this.scroll.current;

    window.requestAnimationFrame(() => {
      this.update();
    });
  }
}
