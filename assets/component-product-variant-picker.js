function initVariantCarousels() {
  const carousels = document.querySelectorAll(".gs-variant-carousel");

  carousels.forEach((carousel) => {
    if (carousel.dataset.initialized === "true") return;
    carousel.dataset.initialized = "true";

    const track = carousel.querySelector(".gs-variant-track");
    const prevBtn = carousel.querySelector(".gs-variant-nav--prev");
    const nextBtn = carousel.querySelector(".gs-variant-nav--next");

    if (!track || !prevBtn || !nextBtn) return;

    const updateArrows = () => {
      // Use math.ceil to account for sub-pixel rendering in browsers
      if (Math.ceil(track.scrollWidth) > Math.ceil(track.clientWidth) + 2) {
        prevBtn.classList.add("is-visible");
        nextBtn.classList.add("is-visible");

        // Disable left arrow if at start
        prevBtn.style.opacity = track.scrollLeft <= 0 ? "0.3" : "1";
        prevBtn.style.pointerEvents = track.scrollLeft <= 0 ? "none" : "auto";

        // Disable right arrow if at end
        const maxScroll = track.scrollWidth - track.clientWidth;
        nextBtn.style.opacity =
          Math.ceil(track.scrollLeft) >= maxScroll - 2 ? "0.3" : "1";
        nextBtn.style.pointerEvents =
          Math.ceil(track.scrollLeft) >= maxScroll - 2 ? "none" : "auto";
      } else {
        prevBtn.classList.remove("is-visible");
        nextBtn.classList.remove("is-visible");
      }
    };

    // --- Arrow Click Logic ---
    const scrollAmount = 152; // Card width (140) + gap (12)

    nextBtn.addEventListener("click", () => {
      if (typeof gsap !== "undefined") {
        gsap.to(track, {
          scrollLeft: track.scrollLeft + scrollAmount,
          duration: 0.4,
          ease: "power2.out",
          onComplete: updateArrows,
        });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: "smooth" });
        setTimeout(updateArrows, 400);
      }
    });

    prevBtn.addEventListener("click", () => {
      if (typeof gsap !== "undefined") {
        gsap.to(track, {
          scrollLeft: track.scrollLeft - scrollAmount,
          duration: 0.4,
          ease: "power2.out",
          onComplete: updateArrows,
        });
      } else {
        track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        setTimeout(updateArrows, 400);
      }
    });

    // --- Mouse Drag Logic (For Desktop Trackpad/Mouse) ---
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener("mousedown", (e) => {
      isDown = true;
      track.classList.add("active");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener("mouseleave", () => {
      isDown = false;
      track.classList.remove("active");
    });

    track.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("active");
      updateArrows();
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault(); // Prevents image dragging
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Mobile uses native CSS smooth scrolling & touch events.
    // Just listen to the scroll event to update arrows.
    track.addEventListener("scroll", () => requestAnimationFrame(updateArrows));
    window.addEventListener("resize", updateArrows);

    // Initial check
    setTimeout(updateArrows, 150);
  });
}

// 1. Run initially
document.addEventListener("DOMContentLoaded", initVariantCarousels);

// 2. Observer for Dawn Ajax reloads
const variantContainerObserver = new MutationObserver((mutations) => {
  let shouldReinit = false;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) shouldReinit = true;
  });
  if (shouldReinit) initVariantCarousels();
});

document.addEventListener("DOMContentLoaded", () => {
  const variantSelectsContainer = document.querySelector("variant-selects");
  if (variantSelectsContainer) {
    variantContainerObserver.observe(variantSelectsContainer, {
      childList: true,
      subtree: true,
    });
  }
});
