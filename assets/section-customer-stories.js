document.addEventListener("DOMContentLoaded", () => {
  // Reveal Animations
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll(".gs-stories-wrapper");

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

  // Vanilla JS Touch Drag Logic for Carousel (Enhances mobile experience)
  const tracks = document.querySelectorAll("[data-carousel-track]");

  tracks.forEach((track) => {
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener("mousedown", (e) => {
      isDown = true;
      track.style.cursor = "grabbing";
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener("mouseleave", () => {
      isDown = false;
      track.style.cursor = "grab";
    });

    track.addEventListener("mouseup", () => {
      isDown = false;
      track.style.cursor = "grab";
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      track.scrollLeft = scrollLeft - walk;
    });
  });
});
