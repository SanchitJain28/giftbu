document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll(".gs-best-sellers-wrapper");

    sections.forEach((section) => {
      const header = section.querySelector(".reveal-up");
      const items = section.querySelectorAll(".gs-best-sellers-item-reveal");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
        },
      });

      if (header) {
        tl.from(header, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }

      // Elegant stagger up for the grid items
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
          "-=0.2",
        );
      }
    });
  }
});
