document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("gs-wishlist-grid");
  if (!grid) return;

  function render() {
    const items = window.Wishlist.get();
    grid.innerHTML = "";

    if (!items.length) {
      grid.innerHTML =
        '<p class="gs-wishlist-page__empty">Your wishlist is empty. <a href="/">Shop now</a></p>';
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "gs-wishlist-card";
      card.innerHTML = `
        <a href="${item.url}" class="gs-wishlist-card__img-link">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
        </a>
        <div class="gs-wishlist-card__info">
          <a href="${item.url}" class="gs-wishlist-card__title">${item.title}</a>
          <span class="gs-wishlist-card__price">${item.price}</span>
        </div>
        <button class="gs-wishlist-card__remove" data-id="${item.id}" aria-label="Remove from wishlist">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      card
        .querySelector(".gs-wishlist-card__remove")
        .addEventListener("click", () => {
          window.Wishlist.remove(item.id);
          render();
          window.Wishlist.updateCounts();
        });
      grid.appendChild(card);
    });
  }

  render();
  document.addEventListener("wishlist:updated", render);
});
