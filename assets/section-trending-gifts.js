document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Fade in the section title
    gsap.from(".reveal-trending-title", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".gs-trending-gifts",
        start: "top 85%",
      },
    });

    // Stagger the cards sliding up
    gsap.from(".reveal-trending-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15, // Left-to-right staggered reveal
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".gs-trending-gifts__grid",
        start: "top 85%",
      },
    });
  }
});
