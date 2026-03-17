document.addEventListener("DOMContentLoaded", () => {
  const stickyBar = document.getElementById("GsStickyATC");
  if (!stickyBar) return;

  // Find the original main "Add to Cart" button in the Dawn product form
  const mainAddToCartBtn = document.querySelector(
    '.product-form__submit[name="add"]',
  );

  if (mainAddToCartBtn) {
    // Watch the main button. When it scrolls out of view, show the sticky bar.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If the original button is scrolled PAST (boundingClientRect.top < 0)
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            stickyBar.classList.add("is-visible");
          } else {
            stickyBar.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "0px",
      },
    );

    observer.observe(mainAddToCartBtn);
  }

  // Bind Sticky "Add to Cart" to trigger the original form submission
  const stickyAddBtn = document.getElementById("GsStickyAddBtn");
  if (stickyAddBtn && mainAddToCartBtn) {
    stickyAddBtn.addEventListener("click", () => {
      mainAddToCartBtn.click();
    });
  }

  // Bind "Make It Extra Special" button
  const stickySpecialBtn = document.getElementById("GsStickySpecialBtn");
  if (stickySpecialBtn) {
    stickySpecialBtn.addEventListener("click", () => {
      // Smoothly scrolls back to the top where the customization options are
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
