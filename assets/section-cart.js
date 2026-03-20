// assets/section-cart.js

class GSCart {
  constructor() {
    this.cartItemsWrapper = document.getElementById("main-cart-items");
    this.cartFooterWrapper = document.getElementById("main-cart-footer");

    // Fallbacks to standard IDs if dataset is missing
    this.sectionIdItems =
      this.cartItemsWrapper?.dataset.id || "main-cart-items";
    this.sectionIdFooter =
      this.cartFooterWrapper?.dataset.id || "main-cart-footer";

    this.init();
  }

  init() {
    // Event delegation for all cart actions
    document.addEventListener("click", this.handleClick.bind(this));

    // Handle manual input typing with a debounce
    const debouncedChange = this.debounce(this.handleChange.bind(this), 300);
    document.addEventListener("input", (e) => {
      if (e.target.classList.contains("gs-cart-qty__input")) {
        debouncedChange(e);
      }
    });
  }

  handleClick(e) {
    // 1. Quantity Buttons (+ / -)
    const qtyBtn = e.target.closest(".gs-cart-qty__btn");
    if (qtyBtn) {
      e.preventDefault();
      this.handleQuantity(qtyBtn);
      return;
    }

    // 2. Remove Item Button
    const removeBtn = e.target.closest(".gs-action-remove");
    if (removeBtn) {
      e.preventDefault();
      const line = removeBtn.dataset.line;
      this.updateCart(line, 0);
    }
  }

  handleQuantity(btn) {
    const line = btn.dataset.line;
    const action = btn.dataset.action;
    const input = document.querySelector(
      `.gs-cart-qty__input[data-line="${line}"]`,
    );

    if (!input) return;

    let currentQty = parseInt(input.value) || 0;
    let newQty =
      action === "plus" ? currentQty + 1 : Math.max(0, currentQty - 1);

    input.value = newQty;
    this.updateCart(line, newQty);
  }

  handleChange(e) {
    const line = e.target.dataset.line;
    const newQty = parseInt(e.target.value) || 0;
    this.updateCart(line, newQty);
  }

  async updateCart(line, quantity) {
    this.toggleLoading(line, true);

    try {
      const routes = window.Shopify?.routes?.root || "/";
      const response = await fetch(`${routes}cart/change.js`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          line: line,
          quantity: quantity,
          // THE ONLY CHANGE IS HERE: "header" becomes "section-header"
          sections: `${this.sectionIdItems},${this.sectionIdFooter},section-header`,
          sections_url: window.location.pathname,
        }),
      });

      const parsedState = await response.json();

      if (parsedState.errors) {
        console.error("Cart Error:", parsedState.errors);
        return;
      }

      this.renderDOM(parsedState);
    } catch (error) {
      console.error("Failed to update cart", error);
    } finally {
      this.toggleLoading(line, false);
    }
  }

  // And this function now needs to look for the correct key in the response
  renderDOM(state) {
    // Get the HTML strings from the API response
    const htmlItems = state.sections[this.sectionIdItems];
    const htmlFooter = state.sections[this.sectionIdFooter];
    // THE ONLY CHANGE IS HERE: state.sections.header becomes state.sections['section-header']
    const htmlHeader = state.sections["section-header"];

    // ... (rest of the renderDOM function is correct and stays the same) ...
    if (htmlItems) {
      const parsedHtml = new DOMParser().parseFromString(
        htmlItems,
        "text/html",
      );
      const targetElement = document
        .getElementById("main-cart-items")
        .querySelector(".js-contents");
      const sourceElement = parsedHtml
        .getElementById("main-cart-items")
        .querySelector(".js-contents");
      if (targetElement && sourceElement)
        targetElement.innerHTML = sourceElement.innerHTML;
    }

    if (htmlFooter) {
      const parsedHtml = new DOMParser().parseFromString(
        htmlFooter,
        "text/html",
      );
      const targetElement = document
        .getElementById("main-cart-footer")
        .querySelector(".js-contents");
      const sourceElement = parsedHtml
        .getElementById("main-cart-footer")
        .querySelector(".js-contents");
      if (targetElement && sourceElement)
        targetElement.innerHTML = sourceElement.innerHTML;
    }

    if (htmlHeader) {
      const parser = new DOMParser();
      const headerDOM = parser.parseFromString(htmlHeader, "text/html");
      const newBubble = headerDOM.getElementById("cart-icon-bubble");
      const currentBubble = document.getElementById("cart-icon-bubble");

      if (newBubble && currentBubble) {
        currentBubble.innerHTML = newBubble.innerHTML;
      }
    }

    const isEmpty = state.item_count === 0;
    document
      .querySelector(".gs-cart-container")
      ?.classList.toggle("is-empty", isEmpty);
    document
      .getElementById("main-cart-footer")
      ?.classList.toggle("is-empty", isEmpty);

    if (window.Wishlist && typeof window.Wishlist.initButtons === "function") {
      window.Wishlist.initButtons();
    }
  }

  toggleLoading(line, isLoading) {
    const spinner = document.querySelector(
      `#CartItem-${line} .loading__spinner`,
    );
    if (spinner) spinner.classList.toggle("hidden", !isLoading);

    const wrapper = document.getElementById("main-cart-items");
    if (wrapper) {
      wrapper.style.pointerEvents = isLoading ? "none" : "auto";
      wrapper.style.opacity = isLoading ? "0.6" : "1";
    }
  }

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new GSCart();
});
