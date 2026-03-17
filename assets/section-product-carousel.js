document.addEventListener("DOMContentLoaded", () => {
  // 1. GSAP Reveal Animation
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll(".gs-product-carousel-wrapper");

    sections.forEach((section) => {
      const elementsToReveal = section.querySelectorAll(".reveal-up");

      if (elementsToReveal.length > 0) {
        gsap.from(elementsToReveal, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          },
        });
      }
    });
  }

  // 2. Vanilla JS Carousel Logic with Infinite Rewind
  const carousels = document.querySelectorAll(".gs-product-carousel");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const prevBtn = carousel.querySelector(".gs-carousel-prev");
    const nextBtn = carousel.querySelector(".gs-carousel-next");

    // Check if the schema setting for infinite loop is enabled
    const isInfinite = carousel.dataset.infinite === "true";

    if (!track) return;

    // Calculate how much to scroll based on 1 item + gap width
    const getScrollAmount = () => {
      const firstItem = track.querySelector(".gs-product-carousel__item");
      if (!firstItem) return 300;

      const itemWidth = firstItem.offsetWidth;
      const gap =
        parseInt(window.getComputedStyle(track).getPropertyValue("gap")) || 0;
      return itemWidth + gap;
    };

    // Click Events for Infinite or Standard boundaries
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (isInfinite && track.scrollLeft <= 5) {
          // Rewind to the end smoothly
          track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
        } else {
          track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (isInfinite && track.scrollLeft >= maxScroll - 5) {
          // Rewind to the start smoothly
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
        }
      });
    }

    // Smart logic to hide arrows if scrolled to the edges (ONLY if infinite is false)
    const handleButtonStates = () => {
      if (!prevBtn || !nextBtn) return;

      // If infinite loop is enabled, arrows are never disabled
      if (isInfinite) {
        prevBtn.classList.remove("is-disabled");
        nextBtn.classList.remove("is-disabled");
        return;
      }

      const scrollLeft = track.scrollLeft;
      const maxScroll = track.scrollWidth - track.clientWidth;

      if (scrollLeft <= 0) {
        prevBtn.classList.add("is-disabled");
      } else {
        prevBtn.classList.remove("is-disabled");
      }

      // Buffer of 2px to account for rounding errors on high DPI screens
      if (scrollLeft >= maxScroll - 2) {
        nextBtn.classList.add("is-disabled");
      } else {
        nextBtn.classList.remove("is-disabled");
      }
    };

    // Listeners to update arrow visibility
    track.addEventListener("scroll", handleButtonStates, { passive: true });
    window.addEventListener("resize", handleButtonStates, { passive: true });

    // Initial UI check
    setTimeout(handleButtonStates, 100);
  });
});
