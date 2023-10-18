import { html } from '../../scripts/scripts.js';
import '../card-carousel/card-carousel.js';

const FEED_URL = `${window.hlx.codeBasePath}/assets/fallback.xml`;
// TODO - Fix
// const FEED_URL = store.env === 'prod'
//  ? 'https://www.paloaltonetworks.com/blog/prisma-cloud/feed/'
//  : `${window.hlx.codeBasePath}/assets/fallback.xml`;

async function getXMLFeed(url) {
  return fetch(url)
    .then((response) => response.text())
    .then((data) => {
      sessionStorage.setItem('blog', data);
      return data;
    })
    .catch((e) => {
      console.error(e);
    });
}

async function renderXMLAsCards(url) {
  const xml = sessionStorage.getItem('blog') || (await getXMLFeed(url));

  if (xml) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xml, 'application/xml');
    const items = dom.getElementsByTagName('item');
    let cards = '';
    for (let i = 0; i < items.length; i += 1) {
      const title = items[i].getElementsByTagName('title');
      const link = items[i].getElementsByTagName('link');
      const pubDate = items[i].getElementsByTagName('pubDate');
      const readTime = items[i].getElementsByTagName('readTime');
      const featuredImage = items[i].getElementsByTagName('featuredImage');
      const background = featuredImage[0].textContent;
      const backgroundStyle = background
        ? `url(${featuredImage[0].textContent}) center center no-repeat`
        : 'url(/assets/card-background.jpg) 0 0 no-repeat';
      const _pubDate = new Date(pubDate?.[0]?.textContent);
      const pubDateToLocale = _pubDate.toLocaleString('default', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      cards += `
    <li class="splide__slide">
        <a href="${link[0].textContent}" class="card ${
  background && 'has-custom-background'
}" style="background: ${backgroundStyle}; background-size: cover;">
            <span class="chip">${readTime[0].textContent} min. read</span>
            <h5 class="title">
                <span class="eyebrow"></span>
                ${title[0].textContent}
                ${pubDate && `<span class='date'>${pubDateToLocale}</span>`}
            </h5>
        </a>
    </li>
    `;
    }

    const carouselList = document.querySelector(
      '.carousel-container .splide__list',
    );
    carouselList.innerHTML = cards;

    store.emit('blog:loaded');
  }
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  block.append(html`
    <div class="carousel-container">
      <card-carousel class="resources"></card-carousel>
    </div>
  `);

  await renderXMLAsCards(FEED_URL);
}
