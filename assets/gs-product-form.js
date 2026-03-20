class GsProductForm extends HTMLElement {
  constructor() {
    super();
    //? get the form element
    this.form = this.querySelector("form");
    this.form.querySelector("[name=id]").disabled = false;
    this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    const submitButton = this.querySelector('[type="submit"]');
    if (submitButton.classList.contains("loading")) return;

    submitButton.classList.add("loading");
    const spinner = submitButton.querySelector(".loading__spinner");
    if (spinner) spinner.classList.remove("hidden");

    const formData = new FormData(this.form);
    formData.append("sections", "cart-notification-product");
    formData.append("sections_url", window.location.pathname);

    // Helper to safely parse Shopify responses
    const safeParseResponse = async (res) => {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return res.json();
      } else {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
    };

    // Helper to run the success UI logic
    const handleSuccessUI = (parsedState) => {
      if (parsedState.status === 422) {
        console.error("Error adding to cart:", parsedState.description);
        return;
      }

      // Update Cart Bubble
      fetch(window.Shopify.routes.root + "cart.js")
        .then(safeParseResponse)
        .then((cartData) => {
          const cartIconLink = document.querySelector(".gs-icon-cart");
          if (cartIconLink) {
            let countSpan = cartIconLink.querySelector(".gs-cart-count");
            if (cartData.item_count > 0) {
              if (!countSpan) {
                countSpan = document.createElement("span");
                countSpan.className = "gs-cart-count";
                cartIconLink.appendChild(countSpan);
              }
              countSpan.textContent = cartData.item_count;
            } else {
              if (countSpan) countSpan.remove();
            }
          }
        })
        .catch((err) => console.error("Error fetching cart data:", err));

      // Update and Show Notification Popup
      let notificationWrapper = document.getElementById(
        "gs-cart-notification-wrapper",
      );
      if (!notificationWrapper) {
        notificationWrapper = document.createElement("div");
        notificationWrapper.id = "gs-cart-notification-wrapper";
        document.body.appendChild(notificationWrapper);
      }

      notificationWrapper.innerHTML =
        parsedState.sections["cart-notification-product"];
      const popup = document.getElementById("gs-cart-notification");

      if (popup) {
        void popup.offsetWidth;
        popup.classList.add("gs-active");
        const closeBtn = popup.querySelector(".gs-cart-notification__close");
        if (closeBtn) {
          closeBtn.addEventListener("click", () =>
            popup.classList.remove("gs-active"),
          );
        }
        setTimeout(() => {
          if (popup.classList.contains("gs-active"))
            popup.classList.remove("gs-active");
        }, 5000);
      }

      if (window.publish && window.PUB_SUB_EVENTS) {
        window.publish(window.PUB_SUB_EVENTS.cartUpdate, {
          source: "product-form",
        });
      }
    };

    // Primary Fetch Request
    fetch(window.Shopify.routes.root + "cart/add.js", {
      method: "POST",
      body: formData,
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        return response.json();
      })
      .then((parsedState) => {
        handleSuccessUI(parsedState);
      })
      .catch((e) => {
        console.warn(
          "[TGS] ATC with properties failed. Retrying without personalization properties...",
          e.message,
        );

        // FALLBACK: Strip out the personalization properties and try adding the normal item
        const cleanFormData = new FormData(this.form);
        for (let key of Array.from(cleanFormData.keys())) {
          if (key.startsWith("properties[")) {
            cleanFormData.delete(key);
          }
        }
        cleanFormData.append("sections", "cart-notification-product");
        cleanFormData.append("sections_url", window.location.pathname);

        return fetch(window.Shopify.routes.root + "cart/add.js", {
          method: "POST",
          body: cleanFormData,
          headers: { "X-Requested-With": "XMLHttpRequest" },
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          })
          .then((parsedState) => handleSuccessUI(parsedState))
          .catch((fallbackError) =>
            console.error("Fallback ATC also failed:", fallbackError),
          );
      })
      .finally(() => {
        submitButton.classList.remove("loading");
        if (spinner) spinner.classList.add("hidden");
      });
  }
}

customElements.define("gs-product-form", GsProductForm);
