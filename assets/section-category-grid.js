document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Stagger the 5 image blocks sliding up
    gsap.from(".gs-category-grid__item", {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1, // Images appear one after the other left-to-right
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".gs-category-grid",
        start: "top 85%", // Triggers when section is 15% from the bottom of screen
      },
    });

    // 2. Fade in the heading text and lines slightly after the images
    gsap.from(".gs-category-grid__heading-wrapper", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 0.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".gs-category-grid",
        start: "top 85%",
      },
    });
  }
});
