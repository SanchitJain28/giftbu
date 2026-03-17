document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll(".gs-celebrations-wrapper");

    sections.forEach((section) => {
      const header = section.querySelector(".reveal-up");
      const items = section.querySelectorAll(".gs-celebrations-item-reveal");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
        },
      });

      // Reveal Header Left-to-Right slightly
      if (header) {
        tl.from(header, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }

      // Stagger items up
      if (items.length > 0) {
        tl.from(
          items,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.2)", // Nice subtle bounce
          },
          "-=0.2",
        ); // Overlaps timeline slightly so it feels faster
      }
    });
  }
});
