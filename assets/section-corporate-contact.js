document.addEventListener("DOMContentLoaded", () => {
  // Ensure GSAP and ScrollTrigger are loaded in your theme.liquid
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Setup standard reveal animation for the columns
    const revealElements = document.querySelectorAll(
      ".gs-corporate-contact .reveal-up",
    );

    if (revealElements.length > 0) {
      gsap.from(revealElements, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2, // Left side fades in, then right side form
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".gs-corporate-contact",
          start: "top 80%",
        },
      });
    }
  } else {
    console.warn(
      "GSAP or ScrollTrigger not loaded for section-corporate-contact.js",
    );
  }
});
