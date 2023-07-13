import { loadCSS } from "../../scripts/lib-franklin.js";

/**
 * Element that allows a user to toggle the current theme.
 * @extends {HTMLElement}
 * @final
 */
const TAG_NAME = "theme-toggle";

const TEMPLATE_DARK_ICON = `
<svg focusable="false" aria-label="Dark Mode" class="icon icon-dark-mode" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
<title>dark mode</title>
<path d="M23.745 21.053c-6.914-0.293-12.458-5.914-12.587-12.869-2.506 1.637-4.158 4.462-4.158 7.663 0 5.048 4.105 9.154 9.187 9.154 3.133 0 5.9-1.563 7.558-3.947zM26.634 17.799c0.759-0.177 1.534 0.419 1.335 1.17-1.382 5.199-6.133 9.031-11.781 9.031-6.731 0-12.187-5.441-12.187-12.154 0-5.735 3.983-10.542 9.34-11.82 0.758-0.181 1.336 0.607 1.141 1.359-0.212 0.815-0.325 1.67-0.325 2.552 0 5.594 4.547 10.128 10.156 10.128 0.799 0 1.576-0.092 2.322-0.266z"></path>
</svg>
`;

const TEMPLATE_LIGHT_ICON = `
<svg focusable="false" aria-label="Light Mode" class="icon icon-light-mode" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
<title>light mode</title>
<path d="M15.5 0c-0.828 0-1.5 0.672-1.5 1.5v2c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5v-2c0-0.828-0.672-1.5-1.5-1.5zM15.5 20.5c2.761 0 5-2.239 5-5s-2.239-5-5-5c-2.761 0-5 2.239-5 5s2.239 5 5 5zM15.5 23.5c4.418 0 8-3.582 8-8s-3.582-8-8-8c-4.418 0-8 3.582-8 8s3.582 8 8 8zM17 27.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5v2c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5v-2zM31 15.5c0 0.828-0.672 1.5-1.5 1.5h-2c-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5h2c0.828 0 1.5 0.672 1.5 1.5zM3.5 17c0.828 0 1.5-0.672 1.5-1.5s-0.672-1.5-1.5-1.5h-2c-0.828 0-1.5 0.672-1.5 1.5s0.672 1.5 1.5 1.5h2zM26.461 4.54c0.586 0.586 0.586 1.536 0 2.121l-1.414 1.414c-0.586 0.586-1.536 0.586-2.121 0s-0.586-1.536 0-2.121l1.414-1.414c0.586-0.586 1.535-0.586 2.121 0zM8.076 25.046c0.586-0.586 0.586-1.535 0-2.121s-1.536-0.586-2.121 0l-1.414 1.414c-0.586 0.586-0.586 1.536 0 2.121s1.536 0.586 2.121 0l1.414-1.414zM26.461 26.46c-0.586 0.586-1.535 0.586-2.121 0l-1.414-1.414c-0.586-0.586-0.586-1.536 0-2.121s1.535-0.586 2.121 0l1.414 1.414c0.586 0.586 0.586 1.536 0 2.121zM5.955 8.075c0.586 0.586 1.536 0.586 2.121 0s0.586-1.536 0-2.121l-1.414-1.414c-0.586-0.586-1.536-0.586-2.121 0s-0.586 1.536 0 2.121l1.414 1.414z"></path>
</svg>
`;

const TEMPLATE_SYSTEM_ICON = `
<svg focusable="false" aria-label="Dark" class="icon icon-system" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
<title>system</title>
<path d="M9.5 25h13c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5h-13c-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5z"></path>
<path d="M26 8c0.552 0 1 0.448 1 1v10c0 0.552-0.448 1-1 1h-20c-0.552 0-1-0.448-1-1v-10c0-0.552 0.448-1 1-1h20zM6 5c-2.209 0-4 1.791-4 4v10c0 2.209 1.791 4 4 4h20c2.209 0 4-1.791 4-4v-10c0-2.209-1.791-4-4-4h-20z"></path>
</svg>
`;

const themes = {
  dark: {
    title: "Dark",
    value: "dark",
    icon: TEMPLATE_DARK_ICON,
  },
  light: {
    title: "Light",
    value: "light",
    icon: TEMPLATE_LIGHT_ICON,
  },
  system: {
    title: "System",
    value: "system",
    icon: TEMPLATE_SYSTEM_ICON,
  },
};

const TEMPLATE = `
<div class="theme-toggle">
    <span class="label">Theme:</span>
    <div class="action">
    <div class="drawer">
            <button data-theme=${themes.dark.value}>
                <span class="icon">${TEMPLATE_DARK_ICON}</span>
                <span class="title">${themes.dark.title}</span>
            </button>
            <button data-theme=${themes.light.value}>
                <span class="icon">${TEMPLATE_LIGHT_ICON}</span>
                <span class="title">${themes.light.title}</span>
            </button>
            <button data-theme=${themes.system.value}>
                <span class="icon">${TEMPLATE_SYSTEM_ICON}</span>
                <span class="title">${themes.system.title}</span>
            </button>
        </div>
        <button class="selected">
            <span class="icon">${TEMPLATE_SYSTEM_ICON}</span>
            <span class="title">${themes.system.title}</span>
            <svg focusable="false" aria-label="Clear" class="icon icon-down-arrow" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <title>Down Arrow</title>
                <path d="M7.79 9.671c-0.867-0.894-2.276-0.894-3.144 0-0.862 0.889-0.862 2.327 0 3.217l8.717 8.988c1.455 1.5 3.817 1.5 5.272 0l8.717-8.988c0.862-0.889 0.862-2.327 0-3.217-0.867-0.894-2.276-0.894-3.144 0l-7.492 7.724c-0.393 0.405-1.043 0.405-1.436 0l-7.492-7.724z"></path>
            </svg>
        </button>
        
    </div>
</div>
`;

class ThemeToggle extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = TEMPLATE;

    this.STORAGE_KEY = "user-color-scheme";
    this.COLOR_MODE_KEY = "--color-mode";
  }

  connectedCallback() {
    this.target = this.querySelector(".action");
    this.toggleSwitch = this.querySelectorAll("[data-theme]");
    this.toggleDrawer = this.querySelector(".selected");
    this.drawer = this.querySelector(".drawer");
    this.selectedTitle = this.toggleDrawer.querySelector(".title");
    this.selectedIcon = this.toggleDrawer.querySelector(".icon");

    if (this.toggleDrawer) {
      this.toggleDrawer.addEventListener("click", () => {
        this.drawer.classList.toggle("is-active");
      });
    }

    if (this.toggleSwitch) {
      // On change, calculate the new setting, toggle state changes and store in storage
      this.toggleSwitch.forEach((button) => {
        button.addEventListener("click", () => {
          const setting = button.getAttribute("data-theme");
          this.applySetting(setting);
          localStorage.setItem(this.STORAGE_KEY, setting);
        });
      });

      this.applySetting();
    }

    document.addEventListener("click", (event) => {
      const isClickInside = this.target.contains(event.target);

      if (!isClickInside) {
        this.close();
      }
    });
  }

  applySetting(passedSetting) {
    // Attempts to load the setting from local storage
    const currentSetting =
      passedSetting || localStorage.getItem(this.STORAGE_KEY);

    if (currentSetting) {
      this.setToggleSwitchStatus(currentSetting);
      this.applyThemeSetting(currentSetting);
    }
    // If no storage setting, we set up media query-based state change
    else {
      // Set the checkbox to on if we're already in dark preference
      //   if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      //     this.setToggleSwitchStatus("dark");
      //   }
      this.selectedIcon.innerHTML = TEMPLATE_SYSTEM_ICON;
      this.selectedTitle.textContent = "System";

      // Listen for changes to the preference and set checkbox state accordingly
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (evt) => {
          this.setToggleSwitchStatus(evt.matches ? "dark" : "light");
        });
    }
  }

  // Sets the correct aria checked role and checked state
  setToggleSwitchStatus(currentSetting) {
    switch (currentSetting) {
      case themes.dark.value:
        this.selectedIcon.innerHTML = themes.dark.icon;
        this.selectedTitle.textContent = themes.dark.title;
        break;
      case themes.light.value:
        this.selectedIcon.innerHTML = themes.light.icon;
        this.selectedTitle.textContent = themes.light.title;
        break;
      default:
        this.selectedIcon.innerHTML = themes.system.icon;
        this.selectedTitle.textContent = themes.system.title;
        break;
    }

    this.close();
  }

  // Apply the current theme
  applyThemeSetting(_override) {
    const browserSetting = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const override = _override === "system" ? browserSetting : _override;
    const currentSetting =
      override || localStorage.getItem(this.STORAGE_KEY) || browserSetting;
    const currentAttribute =
      document.documentElement.getAttribute("data-user-theme");

    if (currentSetting) {
      if (currentSetting !== currentAttribute) {
        document.documentElement.setAttribute(
          "data-user-theme",
          currentSetting
        );
        document.documentElement.style.colorScheme = currentSetting;
      }
    }
  }

  close() {
    this.drawer.classList.remove("is-active");
  }
}

export default function decorate(block) {
  block.innerHTML = "<theme-toggle></theme-toggle>";
}

(async () => {
  customElements.define(TAG_NAME, ThemeToggle);
  loadCSS(`${window.hlx.codeBasePath}/blocks/theme-toggle/theme-toggle.css`);
})();
