document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll(".gs-spoil-wrapper");

    sections.forEach((section) => {
      const header = section.querySelector(".reveal-up");
      const items = section.querySelectorAll(".gs-spoil-item-reveal");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
        },
      });

      // Reveal Header
      if (header) {
        tl.from(header, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }

      // Stagger up the cards in the grid sequentially
      if (items.length > 0) {
        tl.from(
          items,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.3",
        );
      }
    });
  }
});
