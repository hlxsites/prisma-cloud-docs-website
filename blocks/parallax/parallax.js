/* eslint-disable max-classes-per-file */
import {
  clamp, html, isMobile, lerp, mapRange,
} from '../../scripts/scripts.js';

const getOffset = (element, scroll = 0) => {
  const box = element.getBoundingClientRect();

  return {
    bottom: box.bottom,
    height: box.height,
    left: box.left,
    top: box.top + scroll,
    width: box.width,
  };
};
class ParallaxItem {
  constructor({ element }) {
    this.element = element.querySelector('div');

    this.disableOnMobile = true;
    this.ease = 0.12;
    this.desktopAmount = parseInt(element.getAttribute('data-amount'), 10) || 0;
    this.parallax = {
      current: -this.amount || 0,
      target: -this.amount || 0,
      previous: -this.amount || 0,
    };

    this.onResize();
  }

  onResize(scrollY = 0) {
    this.amount = this.desktopAmount;
    // Wait a tick
    setTimeout(() => {
      this.offset = getOffset(this.element, scrollY);
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
          -this.amount,
        ),
      );

      this.parallax.previous = lerp(
        this.parallax.previous || -this.amount,
        targetParallax,
        this.ease,
      );

      this.element.style.transform = `translate3d(0, ${this.parallax.previous}px, 0)`;
    } else {
      this.element.style.transform = `translate3d(0, -${this.amount}px, 0)`;
    }
  }
}

class Animation {
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
      // eslint-disable-next-line no-unused-vars
      for (const entry of entries) {
        // eslint-disable-line
        window.requestAnimationFrame(() => {
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
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    this.scroll.target = window.scrollY || 0;
  }

  onResize() {
    if (!this.wrapper) return;
    window.requestAnimationFrame(() => {
      this.wh = window.innerHeight;
      this.scroll.limit = this.wrapper.clientHeight - this.wh;
      this.animationsParallaxes.forEach((animation) => {
        if (animation.onResize) {
          animation.onResize(this.scroll.target);
        }
      });
    });
  }

  update() {
    //  this.scroll.target = clamp(0, this.scroll.target, this.scroll.limit);

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    );
    this.scroll.current = Math.floor(this.scroll.current);

    if (this.scroll.current < 0.1) {
      this.scroll.current = 0;
    }

    this.animationsParallaxes.forEach((animation) => {
      if (animation.update) {
        animation.update(this.scroll, this.wh);
      }
    });

    this.scroll.last = this.scroll.current;

    window.requestAnimationFrame(() => {
      this.update();
    });
  }
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

  const elements = block.querySelectorAll('.parallax__layer');
  if (elements && !isMobile()) {
    // eslint-disable-next-line no-unused-vars
    const animations = new Animation({ elements });
  }
}
