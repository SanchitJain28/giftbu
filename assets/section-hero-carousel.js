document.addEventListener("DOMContentLoaded", () => {
  // 1. Reveal Animation (GSAP)
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const carousels = document.querySelectorAll(".gs-hero-carousel");
    carousels.forEach((carousel) => {
      gsap.from(carousel, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: carousel,
          start: "top 85%",
        },
      });
    });
  }

  // 2. Vanilla JS Slider Logic
  const carouselWrappers = document.querySelectorAll(
    ".gs-hero-carousel__inner",
  );

  carouselWrappers.forEach((wrapper) => {
    const track = wrapper.querySelector("[data-carousel-track]");
    const slides = wrapper.querySelectorAll(".gs-hero-carousel__slide");
    const dots = wrapper.querySelectorAll(".gs-carousel-dot");

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    // Core function to shift slides
    function updateCarousel(index) {
      if (index >= totalSlides) index = 0;
      if (index < 0) index = totalSlides - 1;

      currentIndex = index;

      // Translate track horizontally strictly using vanilla JS
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Sync active state on pagination dots
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentIndex);
      });
    }

    // Bind click events to pagination dots
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        updateCarousel(index);
      });
    });

    // Touch/Swipe Logic for mobile ease-of-use
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );

    track.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
      },
      { passive: true },
    );

    function handleSwipe() {
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        // Swiped left -> Next slide
        updateCarousel(currentIndex + 1);
      } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swiped right -> Prev slide
        updateCarousel(currentIndex - 1);
      }
    }

    // Optional: Auto-play the carousel every 6 seconds
    setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 6000);
  });
});
