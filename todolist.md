# 17th March 
// ALL TASKS DONE

# 18th March 
//ALL TASKS DONE

# 19th March 
2. remove any glictes from the cart page
3. enchance the collection page

# 20th March
1. Change the UI of the persolization modal



---Some Prompt context-------------------------

 1. price bar (footer) not updating when removing items 
    2. location not working properly (currently it is hard coded) 
        <button class="gs-location-badge js-location-open" aria-label="Set delivery location">
        <span class="gs-location-badge__flag">🇮🇳</span>
        <span class="gs-location-badge__text">
          <span class="gs-location-badge__label js-location-label">Choose location</span>
        </span>
      </button>
      /JS CONTEXT

      location is currently implemented in the header but not in cart
      const PINCODE_JSON_URL =
    "https://cdn.shopify.com/s/files/1/0757/5928/8493/files/pincode-city.json?v=1773820916";

  const locationOpen = document.querySelectorAll(".js-location-open");
  const locationClose = document.querySelector(".js-location-close");
  const locationOverlay = document.querySelector(".js-location-overlay");
  const locationModal = document.querySelector(".js-location-modal");
  const locationApply = document.querySelector(".js-location-apply");
  const locationPincode = document.querySelector(".js-location-pincode");
  const locationLabel = document.querySelector(".js-location-label");
  const locationError = document.querySelector(".js-location-error");

  let pincodeMap = null;

  async function loadPincodeMap() {
    if (pincodeMap) return pincodeMap;
    const res = await fetch(PINCODE_JSON_URL);
    pincodeMap = await res.json();
    return pincodeMap;
  }

  function openLocationModal() {
    locationModal.classList.add("is-active");
    locationOverlay.classList.add("is-active");
    document.body.style.overflow = "hidden";
    locationPincode.focus();
  }

  function closeLocationModal() {
    locationModal.classList.remove("is-active");
    locationOverlay.classList.remove("is-active");
    document.body.style.overflow = "";
    locationError.hidden = true;
  }

  function updateBadge(city, pincode) {
    locationLabel.textContent = `${city} · ${pincode}`;
  }

  function initLocationBadge() {
    const saved = localStorage.getItem("gs_delivery_location");
    if (saved) {
      const { city, pincode } = JSON.parse(saved);
      updateBadge(city, pincode);
    } else if (!sessionStorage.getItem("gs_location_dismissed")) {
      openLocationModal();
    }
  }

  locationOpen.forEach((btn) =>
    btn.addEventListener("click", openLocationModal),
  );
  locationClose.addEventListener("click", closeLocationModal);
  locationOverlay.addEventListener("click", closeLocationModal);

  locationApply.addEventListener("click", async () => {
    const pin = locationPincode.value.trim();
    if (!/^\d{6}$/.test(pin)) {
      locationError.hidden = false;
      return;
    }
    locationError.hidden = true;
    locationApply.textContent = "Checking...";

    const map = await loadPincodeMap();
    const city = map[pin];

    if (!city) {
      locationError.textContent = "Pincode not found. Please try another.";
      locationError.hidden = false;
      locationApply.textContent = "APPLY";
      return;
    }

    localStorage.setItem(
      "gs_delivery_location",
      JSON.stringify({ city, pincode: pin }),
    );
    updateBadge(city, pin);
    locationApply.textContent = "APPLY";
    closeLocationModal();
  });

  locationPincode.addEventListener("keydown", (e) => {
    if (e.key === "Enter") locationApply.click();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLocationModal();
  });

  // Dismiss tracking so modal doesn't re-open this session after manual close
  locationClose.addEventListener("click", () => {
    sessionStorage.setItem("gs_location_dismissed", "1");
  });
  locationOverlay.addEventListener("click", () => {
    sessionStorage.setItem("gs_location_dismissed", "1");
  });

  initLocationBadge();
    3. no variant display in cart line items 
    4. wishlist button not working in cart
    /WISHLIST CONTEXT
    const Wishlist = (() => {
  const KEY = "gs_wishlist";

  function get() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function has(id) {
    return get().some((i) => i.id === String(id));
  }

  function add(product) {
    const items = get();
    if (!has(product.id)) {
      items.push({ ...product, id: String(product.id) });
      save(items);
    }
  }

  function remove(id) {
    save(get().filter((i) => i.id !== String(id)));
  }

  function toggle(product) {
    has(product.id) ? remove(product.id) : add(product);
    document.dispatchEvent(new CustomEvent("wishlist:updated"));
  }

  function updateCounts() {
    const count = get().length;
    document.querySelectorAll(".gs-wishlist-count").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function initButtons() {
    document
      .querySelectorAll(".gs-wishlist-btn[data-product-id]")
      .forEach((btn) => {
        const id = String(btn.dataset.productId);
        if (has(id)) btn.classList.add("is-wishlisted");

        // avoid double-binding
        if (btn.dataset.wishlistBound) return;
        btn.dataset.wishlistBound = "1";

        btn.addEventListener("click", () => {
          const product = {
            id,
            title: btn.dataset.productTitle,
            image: btn.dataset.productImage,
            url: btn.dataset.productUrl,
            price: btn.dataset.productPrice,
          };
          toggle(product);
          btn.classList.toggle("is-wishlisted", has(id));
        });
      });
  }

  document.addEventListener("wishlist:updated", updateCounts);
  document.addEventListener("DOMContentLoaded", () => {
    initButtons();
    updateCounts();
  });

  return { get, has, add, remove, toggle, initButtons, updateCounts };
})();

window.Wishlist = Wishlist;

    5. quantity selector not working properly , quantity not increasing
    6. cart bubble of the header is not updating when product quantity is updated or product is removed