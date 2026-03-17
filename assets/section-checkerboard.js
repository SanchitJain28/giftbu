document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const pairs = document.querySelectorAll(".gs-cb-pair.reveal-checkerboard");

    pairs.forEach((pair, index) => {
      gsap.from(pair, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: pair,
          start: "top 85%",
        },
      });
    });
  }
});
