document.addEventListener("DOMContentLoaded", () => {
  const stickyBars = document.querySelectorAll(".gs-sticky-atc");

  stickyBars.forEach((stickyBar) => {
    // 1. Locate the native Dawn Add to Cart button
    const mainAddToCartBtn = document.querySelector(
      '.product-form__submit[name="add"]',
    );

    if (mainAddToCartBtn) {
      // 2. Observer: Detect when the original button is scrolled out of view (above the viewport)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
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

    // 3. Bind Primary Button (Triggers the actual form add-to-cart)
    const stickyAddBtn = stickyBar.querySelector(".gs-sticky-btn--primary");
    if (stickyAddBtn && mainAddToCartBtn) {
      stickyAddBtn.addEventListener("click", () => {
        mainAddToCartBtn.click();
      });
    }

    // 4. Bind Secondary Button (Scrolls user smoothly to top of the page to customize/select options)
    const stickySpecialBtn = stickyBar.querySelector(
      ".gs-sticky-btn--secondary",
    );
    if (stickySpecialBtn) {
      stickySpecialBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
});
