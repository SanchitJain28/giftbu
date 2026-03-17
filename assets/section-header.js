document.addEventListener("DOMContentLoaded", function () {
  const btnOpen = document.querySelector(".js-drawer-open");
  const btnClose = document.querySelector(".js-drawer-close");
  const overlay = document.querySelector(".js-drawer-overlay");
  const drawer = document.querySelector(".js-menu-drawer");

  function toggleDrawer(forceOpen) {
    if (!drawer || !overlay) return;

    const shouldOpen =
      typeof forceOpen === "boolean"
        ? forceOpen
        : !drawer.classList.contains("is-active");

    if (shouldOpen) {
      drawer.classList.add("is-active");
      overlay.classList.add("is-active");
      document.body.style.overflow = "hidden";
    } else {
      drawer.classList.remove("is-active");
      overlay.classList.remove("is-active");
      document.body.style.overflow = "";
    }
  }

  if (btnOpen) btnOpen.addEventListener("click", () => toggleDrawer(true));
  if (btnClose) btnClose.addEventListener("click", () => toggleDrawer(false));
  if (overlay) overlay.addEventListener("click", () => toggleDrawer(false));

  // ACCORDION SUBMENU LOGIC
  const toggleButtons = document.querySelectorAll(".js-toggle-submenu");
  toggleButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const parentLi = this.closest("li");
      if (parentLi) {
        parentLi.classList.toggle("is-expanded");
      }
    });
  });

  // =========================================================================
  // 2. PREDICTIVE SEARCH LOGIC
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
      // Use a debounced function to limit API calls while typing
      const debouncedOnChange = this.debounce((event) => {
        this.onChange(event);
      }, 300);

      this.input.addEventListener("input", debouncedOnChange.bind(this));

      // Close the dropdown when clicking anywhere else on the page
      document.addEventListener("click", (event) => {
        if (!this.form.contains(event.target)) {
          this.close();
        }
      });

      // Re-open if clicking back into the input and it has content
      this.input.addEventListener("focus", () => {
        if (this.input.value.trim().length > 0) {
          this.open();
        }
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
      this.resultsContainer.innerHTML = ""; // Clear old results

      const products = results.products || [];
      const collections = results.collections || [];

      if (products.length === 0 && collections.length === 0) {
        this.resultsContainer.innerHTML = `<div class="gs-predictive__no-results">No results found for "${this.input.value}"</div>`;
        this.open();
        return;
      }

      const fragment = document.createDocumentFragment();

      // Render Collections
      if (collections.length > 0) {
        const section = document.createElement("div");
        section.className = "gs-predictive__section";
        section.innerHTML = `
          <h3 class="gs-predictive__heading">Collections</h3>
          <ul class="gs-predictive__collection-list">
            ${collections
              .map(
                (collection) => `
              <li><a href="${collection.url}">${collection.title}</a></li>
            `,
              )
              .join("")}
          </ul>
        `;
        fragment.appendChild(section);
      }

      // Render Products
      if (products.length > 0) {
        const section = document.createElement("div");
        section.className = "gs-predictive__section";
        section.innerHTML = `
          <h3 class="gs-predictive__heading">Products</h3>
          <ul class="gs-predictive__product-list">
            ${products
              .map(
                (product) => `
              <li>
                <a href="${product.url}" class="gs-predictive__product-item">
                  <div class="gs-predictive__product-img">
                    <img src="${product.image}" alt="${product.title.replace(/"/g, "&quot;")}">
                  </div>
                  <div class="gs-predictive__product-info">
                    <p class="gs-predictive__product-title">${product.title}</p>
                    <p class="gs-predictive__product-price">${product.price}</p>
                  </div>
                </a>
              </li>
            `,
              )
              .join("")}
          </ul>
        `;
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

  // Initialize the search class
  new GsPredictiveSearch();
});
