document.addEventListener("DOMContentLoaded", () => {
  const tabsContainers = document.querySelectorAll(".gs-product-tabs");

  tabsContainers.forEach((container) => {
    const buttons = container.querySelectorAll(".gs-tabs__btn");
    const panels = container.querySelectorAll(".gs-tabs__panel");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // 1. Remove active states
        buttons.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });

        panels.forEach((p) => {
          p.classList.remove("is-active");
        });

        // 2. Set new active tab
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");

        // 3. Show matching panel
        const targetPanelId = btn.getAttribute("aria-controls");
        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) {
          targetPanel.classList.add("is-active");
        }
      });
    });
  });
});
