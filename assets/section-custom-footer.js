document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const footerReveal = document.querySelector(".gs-footer .reveal-up");

    if (footerReveal) {
      gsap.from(footerReveal, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".gs-footer",
          start: "top 90%",
        },
      });
    }
  }
});
