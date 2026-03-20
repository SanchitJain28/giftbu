
document.addEventListener("DOMContentLoaded", () => {

  const refreshCartBubble = () => {
    console.log("running")
    fetch(`${window.Shopify?.routes?.root || "/"}cart.js`)
      .then((response) => response.json())
      .then((cart) => {
        const bubbleWrapper = document.getElementById("cart-icon-bubble");
        if (!bubbleWrapper) return;

        // Create a temporary span to check against
        let newBubbleHTML = "";
        if (cart.item_count > 0) {
          newBubbleHTML = `<span class="gs-cart-count">${cart.item_count}</span>`;
        } else {
          newBubbleHTML = `<span class="gs-cart-count" hidden>0</span>`;
        }

        // Only update the DOM if the content has actually changed
        // This prevents a brief "flash" or unnecessary DOM manipulation.
        if (bubbleWrapper.innerHTML.trim() !== newBubbleHTML) {
          bubbleWrapper.innerHTML = newBubbleHTML;
        }
      })
      .catch((e) => {
        console.error("Could not refresh cart bubble:", e);
      });
  };

  refreshCartBubble();

  window.addEventListener("pageshow", (event) => {
    // The `persisted` property is true if the page was restored from the back/forward cache.
    if (event.persisted) {
      refreshCartBubble();
    }
  });
});
