document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Slide the image in from the left
    gsap.from(".gs-build-box__image-col.reveal-left", {
      x: -60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".gs-build-box",
        start: "top 80%",
      },
    });

    // 2. Slide the text and blob in from the right slightly after the image
    gsap.from(".gs-build-box__text-col.reveal-right", {
      x: 60,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".gs-build-box",
        start: "top 80%",
      },
    });
  }
});
