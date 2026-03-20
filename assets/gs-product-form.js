class GsProductForm extends HTMLElement {
  constructor() {
    super();
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
    // [MODIFIED] Ask for the header section at the same time
    formData.append("sections", "cart-notification-product,section-header");
    formData.append("sections_url", window.location.pathname);

    // Helper to run the success UI logic
    const handleSuccessUI = (parsedState) => {
      if (parsedState.status === 422) {
        console.error("Error adding to cart:", parsedState.description);
        return;
      }

      // [REMOVED] Old manual cart bubble update logic
      // The entire fetch('/cart.js') block has been removed.

      // [ADDED] New, reliable bubble update using Section Rendering API
      const htmlHeader = parsedState.sections["section-header"];
      if (htmlHeader) {
        const parser = new DOMParser();
        const headerDOM = parser.parseFromString(htmlHeader, "text/html");
        const newBubble = headerDOM.getElementById("cart-icon-bubble");
        const currentBubble = document.getElementById("cart-icon-bubble");
        if (newBubble && currentBubble) {
          currentBubble.innerHTML = newBubble.innerHTML;
        }
      }

      // Update and Show Notification Popup (This part remains the same)
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
        // Use requestAnimationFrame to ensure the transition happens
        requestAnimationFrame(() => {
          popup.classList.add("gs-active");
        });

        const closeBtn = popup.querySelector(".gs-cart-notification__close");
        if (closeBtn) {
          closeBtn.addEventListener(
            "click",
            () => popup.classList.remove("gs-active"),
            { once: true },
          );
        }
        setTimeout(() => {
          if (popup.classList.contains("gs-active"))
            popup.classList.remove("gs-active");
        }, 5000);
      }
    };

    // Primary Fetch Request
    fetch(window.Shopify.routes.root + "cart/add.js", {
      method: "POST",
      body: formData,
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then((response) => {
        if (!response.ok)
          return response.text().then((text) => {
            throw new Error(text);
          });
        return response.json();
      })
      .then((parsedState) => {
        handleSuccessUI(parsedState);
      })
      .catch((e) => {
        console.warn(
          "[GS] ATC failed. Retrying without personalization properties...",
          e.message,
        );

        // FALLBACK LOGIC
        const cleanFormData = new FormData(this.form);
        for (let key of Array.from(cleanFormData.keys())) {
          if (key.startsWith("properties[")) {
            cleanFormData.delete(key);
          }
        }
        // [MODIFIED] Also ask for the header in the fallback request
        cleanFormData.append(
          "sections",
          "cart-notification-product,section-header",
        );
        cleanFormData.append("sections_url", window.location.pathname);

        return fetch(window.Shopify.routes.root + "cart/add.js", {
          method: "POST",
          body: cleanFormData,
          headers: { "X-Requested-With": "XMLHttpRequest" },
        })
          .then((res) => {
            if (!res.ok)
              return res.text().then((text) => {
                throw new Error(text);
              });
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
