document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const collectionSections = document.querySelectorAll(
      ".gs-featured-collections",
    );

    collectionSections.forEach((section) => {
      const items = section.querySelectorAll(".gs-fc-item-reveal");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
        },
      });

      tl.from(items, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05, 
        ease: "power2.out", 
      });
    });
  }
});
