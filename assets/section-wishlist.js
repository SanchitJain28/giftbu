const Wishlist = (() => {
  const KEY = "gs_wishlist";

  function get() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function has(id) {
    return get().some((i) => i.id === String(id));
  }

  function add(product) {
    const items = get();
    if (!has(product.id)) {
      items.push({ ...product, id: String(product.id) });
      save(items);
    }
  }

  function remove(id) {
    save(get().filter((i) => i.id !== String(id)));
  }

  function toggle(product) {
    has(product.id) ? remove(product.id) : add(product);
    document.dispatchEvent(new CustomEvent("wishlist:updated"));
  }

  function updateCounts() {
    const count = get().length;
    document.querySelectorAll(".gs-wishlist-count").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function initButtons() {
    document
      .querySelectorAll(".gs-wishlist-btn[data-product-id]")
      .forEach((btn) => {
        const id = String(btn.dataset.productId);
        if (has(id)) btn.classList.add("is-wishlisted");

        // avoid double-binding
        if (btn.dataset.wishlistBound) return;
        btn.dataset.wishlistBound = "1";

        btn.addEventListener("click", () => {
          const product = {
            id,
            title: btn.dataset.productTitle,
            image: btn.dataset.productImage,
            url: btn.dataset.productUrl,
            price: btn.dataset.productPrice,
          };
          toggle(product);
          btn.classList.toggle("is-wishlisted", has(id));
        });
      });
  }

  document.addEventListener("wishlist:updated", updateCounts);
  document.addEventListener("DOMContentLoaded", () => {
    initButtons();
    updateCounts();
  });

  return { get, has, add, remove, toggle, initButtons, updateCounts };
})();

window.Wishlist = Wishlist;
