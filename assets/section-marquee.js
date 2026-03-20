document.addEventListener("DOMContentLoaded", () => {
  //?Ensure GSAP is loaded , if not return early

  if (typeof gsap === "undefined") {
    console.warn("GSAP is required for the marquee section.");
    return;
  }

  //? get the section through query selector
  const marquees = document.querySelectorAll(".gs-marquee-section");

  marquees.forEach((section) => {
    //? get the track
    const track = section.querySelector(".gs-marquee__track");
    //?early return if not dfound
    if (!track) return;

    // We hardcoded 4 duplicated blocks in the liquid loop.
    // Moving the track exactly 1 block's width (25% of total width) guarantees a seamless visual snap.
    const singleBlockPercentage = 100 / 4;

    const speed = parseInt(section.dataset.speed, 10) || 20;
    const direction = section.dataset.direction;

    // GSAP seamless loop setup
    if (direction === "right") {
      gsap.fromTo(
        track,
        { xPercent: -singleBlockPercentage },
        {
          xPercent: 0,
          ease: "none",
          duration: speed,
          repeat: -1,
        },
      );
    } else {
      gsap.fromTo(
        track,
        { xPercent: 0 },
        {
          xPercent: -singleBlockPercentage,
          ease: "none",
          duration: speed,
          repeat: -1,
        },
      );
    }
  });
});
