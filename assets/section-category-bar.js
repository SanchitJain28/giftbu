document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const categoryBars = document.querySelectorAll(".gs-category-bar");

    categoryBars.forEach((bar) => {
      const items = bar.querySelectorAll(".gs-category-item-reveal");
      const dividers = bar.querySelectorAll(".gs-category-bar__divider");

      // We override the standard single .reveal-up to do a nice stagger
      // of the items and dividers inside the bar based on the reference image
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bar,
          start: "top 85%",
        },
      });

      // Animate the main wrapper box
      tl.from(bar, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        // Stagger in the icons and text
        .from(
          items,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "back.out(1.2)",
          },
          "-=0.3",
        )
        // Fade in the dividers
        .from(
          dividers,
          {
            opacity: 0,
            scaleY: 0,
            duration: 0.4,
            stagger: 0.08,
            ease: "power1.inOut",
          },
          "-=0.6",
        );
    });
  }
});
