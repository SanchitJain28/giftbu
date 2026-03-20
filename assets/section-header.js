document.addEventListener("DOMContentLoaded", function () {
  // =========================================================================
  // DRAWER
  // =========================================================================
  const btnOpen = document.querySelector(".js-drawer-open");
  const btnClose = document.querySelector(".js-drawer-close");
  const overlay = document.querySelector(".js-drawer-overlay");
  const drawer = document.querySelector(".js-menu-drawer");

  function openDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.add("is-active");
    drawer.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.remove("is-active");
    drawer.setAttribute("aria-hidden", "true");
    overlay.classList.remove("is-active");
    document.body.style.overflow = "";
    // Reset right panel
    deactivateAllPanels();
  }

  if (btnOpen) btnOpen.addEventListener("click", openDrawer);
  if (btnClose) btnClose.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // =========================================================================
  // MEGA MENU — LEFT ITEM → RIGHT PANEL
  // =========================================================================
  const megaItems = document.querySelectorAll(".js-mega-item");
  const subPanels = document.querySelectorAll(".gs-drawer__sub-panel");

  function deactivateAllPanels() {
    megaItems.forEach((i) => i.classList.remove("is-active"));
    subPanels.forEach((p) => p.classList.remove("is-active"));
  }

  megaItems.forEach((item) => {
    const toggleBtn = item.querySelector(".js-mega-toggle");
    const handle = item.dataset.collectionHandle || item.dataset.handle;

    function activate(e) {
      e.preventDefault();
      const alreadyActive = item.classList.contains("is-active");
      deactivateAllPanels();
      if (!alreadyActive) {
        item.classList.add("is-active");
        const panel = document.querySelector(
          `.gs-drawer__sub-panel[data-panel="${handle}"]`,
        );
        if (panel) panel.classList.add("is-active");
      }
    }

    if (toggleBtn) toggleBtn.addEventListener("click", activate);
    // Also activate when hovering the row (desktop-like behaviour inside the drawer)
    item.addEventListener("mouseenter", () => {
      deactivateAllPanels();
      item.classList.add("is-active");
      const panel = document.querySelector(
        `.gs-drawer__sub-panel[data-panel="${handle}"]`,
      );
      if (panel) panel.classList.add("is-active");
    });
  });

  // =========================================================================
  // PREDICTIVE SEARCH
  // =========================================================================
  class GsPredictiveSearch {
    constructor() {
      this.input = document.querySelector(".js-predictive-input");
      this.resultsContainer = document.querySelector(".js-predictive-results");
      this.loader = document.querySelector(".js-predictive-loading");
      this.form = document.querySelector(".gs-search-form");
      if (!this.input || !this.resultsContainer) return;
      this.setupEventListeners();
    }

    setupEventListeners() {
      const debouncedOnChange = this.debounce(
        (event) => this.onChange(event),
        300,
      );
      this.input.addEventListener("input", debouncedOnChange.bind(this));
      document.addEventListener("click", (event) => {
        if (!this.form.contains(event.target)) this.close();
      });
      this.input.addEventListener("focus", () => {
        if (this.input.value.trim().length > 0) this.open();
      });
    }

    debounce(fn, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    }

    onChange(event) {
      const searchTerm = event.target.value.trim();
      if (!searchTerm.length) {
        this.close();
        return;
      }
      this.getSearchResults(searchTerm);
    }

    showLoader() {
      if (this.loader) this.loader.hidden = false;
      this.open();
    }

    hideLoader() {
      if (this.loader) this.loader.hidden = true;
    }

    async getSearchResults(searchTerm) {
      this.showLoader();
      try {
        const response = await fetch(
          `${window.Shopify.routes.root}search/suggest.json?q=${encodeURIComponent(searchTerm)}&resources[type]=product,collection&resources[limit]=5&resources[limit_scope]=each`,
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();
        this.hideLoader();
        this.renderResults(json.resources.results);
      } catch (error) {
        console.error("Predictive Search Error:", error);
        this.hideLoader();
        this.close();
      }
    }

    renderResults(results) {
      this.resultsContainer.innerHTML = "";
      const products = results.products || [];
      const collections = results.collections || [];

      if (products.length === 0 && collections.length === 0) {
        this.resultsContainer.innerHTML = `<div class="gs-predictive__no-results">No results found for "${this.input.value}"</div>`;
        this.open();
        return;
      }

      const fragment = document.createDocumentFragment();

      if (collections.length > 0) {
        const section = document.createElement("div");
        section.className = "gs-predictive__section";
        section.innerHTML = `
          <h3 class="gs-predictive__heading">Collections</h3>
          <ul class="gs-predictive__collection-list">
            ${collections.map((c) => `<li><a href="${c.url}">${c.title}</a></li>`).join("")}
          </ul>`;
        fragment.appendChild(section);
      }

      if (products.length > 0) {
        const section = document.createElement("div");
        section.className = "gs-predictive__section";
        section.innerHTML = `
          <h3 class="gs-predictive__heading">Products</h3>
          <ul class="gs-predictive__product-list">
            ${products
              .map(
                (p) => `
              <li>
                <a href="${p.url}" class="gs-predictive__product-item">
                  <div class="gs-predictive__product-img">
                    <img src="${p.image}" alt="${p.title.replace(/"/g, "&quot;")}">
                  </div>
                  <div class="gs-predictive__product-info">
                    <p class="gs-predictive__product-title">${p.title}</p>
                    <p class="gs-predictive__product-price">${p.price}</p>
                  </div>
                </a>
              </li>`,
              )
              .join("")}
          </ul>`;
        fragment.appendChild(section);
      }

      this.resultsContainer.appendChild(fragment);
      this.open();
    }

    open() {
      this.resultsContainer.classList.add("is-open");
    }
    close() {
      this.resultsContainer.classList.remove("is-open");
    }
  }

  new GsPredictiveSearch();
});
