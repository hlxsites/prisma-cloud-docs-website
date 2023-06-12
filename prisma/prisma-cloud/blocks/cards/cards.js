export default function decorate(block) {
  [...block.children].forEach((child) => {
    child.classList.add('cards-item');

    const ytLink = child.querySelector('a[href^="https://www.youtube.com/watch?v="]');
    if (ytLink) {
      const { searchParams } = new URL(ytLink.getAttribute('href'));
      const id = searchParams.get('v');
      child.innerHTML = /* html */`
        <div class="yt-container">
          <img class="yt-preview" alt="video preview" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" loading="lazy"/>
          <button aria-label="Play" class="yt-button">
            <svg height="100%" viewBox="0 0 68 48" width="100%">
                <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path>
            </svg>
          </button>
        </div>
        <iframe class="yt-player" width="340" height="200" allow="autoplay"></iframe>
      `;

      // Load iframe on play
      child.querySelector('button').onclick = () => {
        const iframe = child.querySelector('iframe');
        iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
        iframe.classList.add('is-playing');
        iframe.previousElementSibling.remove();
      };
    } else {
      const heading = child.querySelector('h4');
      if (heading) {
        heading.after(document.createElement('hr'));
      }

      let text = child.querySelector('p:not(.button-container)');
      if (!text) {
        text = document.createElement('p');
        child.children[0].lastElementChild.before(text);
      }

      text.classList.add('cards-item-text');
    }
  });
}
