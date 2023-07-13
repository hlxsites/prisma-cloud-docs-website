/**
 * Element that adds active classes to its children when the user scrolls to
 * a heading this child points to.
 * @extends {HTMLElement}
 * @final
 */

class ScrollSpy extends HTMLElement {
  constructor() {
    super();
    this.scrollSpy = this.scrollSpy.bind(this);
    this.tocActiveClass = "scroll-spy__active";
    this.tocVisibleClass = "scroll-spy__visible";
  }

  static get observedAttributes() {
    return ["ready"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "ready" && newValue === "true") {
      this.connect();
    }
  }

  connect() {
    this.articleContent = document.querySelector(".article .book-content");

    if (!this.articleContent) {
      return;
    }

    this.headings = this.articleContent.querySelectorAll(
      "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"
    );

    this.observer = new IntersectionObserver(this.scrollSpy, {
      rootMargin: "0px 0px -80% 0px",
    });
    this.headings.forEach((heading) => this.observer.observe(heading));
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  scrollSpy(headings) {
    const links = new Map(
      [...this.querySelectorAll("a")].map((l) => [l.getAttribute("href"), l])
    );
    for (const heading of headings) {
      const href = `#${heading.target.getAttribute("id")}`;
      const link = links.get(href);

      if (link) {
        if (heading.intersectionRatio > 0) {
          link.classList.add(this.tocVisibleClass);
          this.previouslyActiveHeading = heading.target.getAttribute("id");
        } else {
          link.classList.remove(this.tocVisibleClass);
        }
      }

      const firstVisibleLink = this.querySelector(`.${this.tocVisibleClass}`);

      links.forEach((link) => {
        link.classList.remove(this.tocActiveClass, this.tocVisibleClass);
      });

      if (firstVisibleLink) {
        firstVisibleLink.classList.add(this.tocActiveClass);
      }

      if (!firstVisibleLink && this.previouslyActiveHeading) {
        const last = this.querySelector(
          `a[href="#${this.previouslyActiveHeading}"]`
        );
        last.classList.add(this.tocActiveClass);
      }
    }
  }
}

customElements.define("web-scroll-spy", ScrollSpy);
