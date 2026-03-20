// assets/utility-location.js

// Using an IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope.
(() => {
  // =========================================================================
  // GLOBAL LOCATION PICKER
  // =========================================================================
  const PINCODE_JSON_URL =
    "https://cdn.shopify.com/s/files/1/0757/5928/8493/files/pincode-city.json?v=1773820916";

  const locationOpenTriggers = document.querySelectorAll(".js-location-open");
  const locationClose = document.querySelector(".js-location-close");
  const locationOverlay = document.querySelector(".js-location-overlay");
  const locationModal = document.querySelector(".js-location-modal");
  const locationApply = document.querySelector(".js-location-apply");
  const locationPincode = document.querySelector(".js-location-pincode");
  const locationLabels = document.querySelectorAll(".js-location-label"); // Finds ALL labels
  const locationError = document.querySelector(".js-location-error");

  // Prevent script from running if essential modal elements are missing
  if (!locationModal || !locationOpenTriggers.length) {
    return;
  }

  let pincodeMap = null;

  async function loadPincodeMap() {
    if (pincodeMap) return pincodeMap;
    try {
      const res = await fetch(PINCODE_JSON_URL);
      pincodeMap = await res.json();
      return pincodeMap;
    } catch (e) {
      console.error("Failed to load pincode map.", e);
      return null;
    }
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
    locationLabels.forEach((label) => {
      // Different labels might have different text structures
      if (label.closest(".gs-cart-location")) {
        label.textContent = `${city} - ${pincode}`;
      } else {
        label.textContent = `${city} · ${pincode}`;
      }
    });
  }

  function initLocationBadge() {
    const saved = localStorage.getItem("gs_delivery_location");
    if (saved) {
      try {
        const { city, pincode } = JSON.parse(saved);
        updateBadge(city, pincode);
      } catch (e) {
        /* Saved data might be corrupt, ignore */
      }
    } else if (!sessionStorage.getItem("gs_location_dismissed")) {
      // Optional: Delay modal pop-up slightly on first visit
      // setTimeout(openLocationModal, 1500);
    }
  }

  locationOpenTriggers.forEach((btn) =>
    btn.addEventListener("click", openLocationModal),
  );

  locationClose?.addEventListener("click", () => {
    sessionStorage.setItem("gs_location_dismissed", "1");
    closeLocationModal();
  });

  locationOverlay?.addEventListener("click", () => {
    sessionStorage.setItem("gs_location_dismissed", "1");
    closeLocationModal();
  });

  locationApply?.addEventListener("click", async () => {
    const pin = locationPincode.value.trim();
    if (!/^\d{6}$/.test(pin)) {
      locationError.hidden = false;
      return;
    }
    locationError.hidden = true;
    locationApply.disabled = true;
    locationApply.textContent = "Checking...";

    const map = await loadPincodeMap();
    const city = map ? map[pin] : null;

    if (!city) {
      locationError.textContent = "Pincode not found. Please try another.";
      locationError.hidden = false;
      locationApply.disabled = false;
      locationApply.textContent = "APPLY";
      return;
    }

    localStorage.setItem(
      "gs_delivery_location",
      JSON.stringify({ city, pincode: pin }),
    );
    updateBadge(city, pin);
    locationApply.disabled = false;
    locationApply.textContent = "APPLY";
    closeLocationModal();
  });

  locationPincode?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") locationApply.click();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && locationModal.classList.contains("is-active")) {
      closeLocationModal();
    }
  });

  initLocationBadge();
})();
