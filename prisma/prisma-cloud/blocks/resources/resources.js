import { html } from "../../scripts/scripts.js";
import "../card-carousel/card-carousel.js";

const FEED_URL =
  store.env === "prod"
    ? `https://www.paloaltonetworks.com/blog/prisma-cloud/feed/`
    : `${window.hlx.codeBasePath}/assets/fallback.xml`;

async function getXMLFeed(url) {
  return fetch(url)
    .then((response) => response.text())
    .then((data) => {
      sessionStorage.setItem("blog", data);
      return data;
    })
    .catch((e) => {
      console.error(e);
    });
}

async function renderXMLAsCards(url) {
  const xml = sessionStorage.getItem("blog") || (await getXMLFeed(url));

  if (xml) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xml, "application/xml");
    const items = dom.getElementsByTagName("item");
    let cards = "";
    for (let i = 0; i < items.length; i++) {
      const title = items[i].getElementsByTagName("title");
      const link = items[i].getElementsByTagName("link");

      cards += `
    <li class="splide__slide">
        <a href="${link[0].textContent}" class="card">
            <h5 class="title">
                <span class="eyebrow"></span>
                ${title[0].textContent}
            </h5>
        </a>
    </li>
    `;
    }

    const carouselList = document.querySelector(
      ".carousel-container .splide__list"
    );
    carouselList.innerHTML = cards;

    store.emit("blog:loaded");
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
