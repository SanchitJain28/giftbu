document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gs-media-gallery");
  if (!gallery) return;

  const thumbnailItems = gallery.querySelectorAll(".gs-thumbnail-list__item");
  const mainItems = gallery.querySelectorAll(".gs-main-list__item");

  // Thumbnail Click Handling
  thumbnailItems.forEach((item) => {
    const btn = item.querySelector(".gs-thumbnail-btn");

    btn.addEventListener("click", () => {
      const targetId = item.getAttribute("data-target");

      // 1. Reset active states
      gallery
        .querySelectorAll(".gs-thumbnail-btn.is-active")
        .forEach((t) => t.classList.remove("is-active"));
      gallery
        .querySelectorAll(".gs-main-list__item.is-active")
        .forEach((m) => m.classList.remove("is-active"));

      // 2. Set new active states
      btn.classList.add("is-active");
      const targetMain = document.getElementById(targetId);

      if (targetMain) {
        targetMain.classList.add("is-active");
      }
    });
  });

  // Variant change integration
  // Listens to standard inputs/selects on product form to swap image automatically
  const variantSelectors = document.querySelectorAll(
    "variant-selects select, variant-radios input",
  );

  variantSelectors.forEach((selector) => {
    selector.addEventListener("change", () => {
      // Small timeout to allow Shopify's variant URL to update the form's variant-id
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const variantId = urlParams.get("variant");
        if (!variantId) return;

        // Fetching variant info from the embedded JSON in DOM (standard in Dawn)
        const productJsonEl = document.querySelector(
          '[type="application/json"][data-product-json]',
        );
        if (productJsonEl) {
          try {
            const productData = JSON.parse(productJsonEl.textContent);
            const activeVariant = productData.variants.find(
              (v) => v.id == variantId,
            );

            if (activeVariant && activeVariant.featured_media) {
              const mediaId = activeVariant.featured_media.id;
              const targetThumb = gallery.querySelector(
                `.gs-thumbnail-list__item[data-target="GsSlide-${gallery.id.split("-")[1]}-${mediaId}"] .gs-thumbnail-btn`,
              );

              if (targetThumb) targetThumb.click();
            }
          } catch (e) {
            console.warn(
              "Giftbu: Could not parse product JSON for variant image switching.",
            );
          }
        }
      }, 50);
    });
  });
});
