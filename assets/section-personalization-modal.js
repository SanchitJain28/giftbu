/* global TGSPersonalization */

(function () {
  "use strict";

  const cfg = window.TGSPersonalization;

  if (!cfg) {
    console.error(
      "[TGS] window.TGSPersonalization is undefined — check snippet script block",
    );
    return;
  }

  /* ── DOM refs ─────────────────────────────────────── */
  const modal = document.getElementById("gs-pers-modal");
  const backdrop = document.getElementById("gs-pers-backdrop");
  const closeBtn = document.getElementById("gs-pers-close");
  const progressBar = document.getElementById("gs-pers-progress");
  const progressLbl = document.getElementById("gs-pers-progress-label");
  const saveBtn = document.getElementById("gs-pers-save");
  const saveTxt = document.getElementById("gs-pers-save-text");
  const previewWrap = document.querySelector(".gs-pers-modal__preview");
  const canvas = document.getElementById("gs-pers-canvas");

  if (!modal) {
    console.error(
      "[TGS] #gs-pers-modal not found in DOM — is the snippet rendering?",
    );
    return;
  }

  /* ── Replace canvas with <img> ───────────────────── */
  if (canvas) {
    const img = document.createElement("img");
    img.id = "gs-pers-preview-img";
    img.alt = "Personalisation preview";
    img.className = "gs-pers-modal__canvas";
    img.src = cfg.previewImageUrl || "";
    canvas.replaceWith(img);
    console.log("[TGS] Canvas replaced with img, src:", img.src);
  } else {
    console.warn("[TGS] #gs-pers-canvas not found — img may already exist");
  }

  function getPreviewImg() {
    return document.getElementById("gs-pers-preview-img");
  }

  /* ── Fields ───────────────────────────────────────── */
  const fields = Array.from(document.querySelectorAll("[data-field-type]"));
  const totalFields = fields.length;
  console.log(
    "[TGS] Fields found:",
    totalFields,
    fields.map((f) => f.dataset.fieldLabel),
  );

  /* ── State ────────────────────────────────────────── */
  let savedData = {};
  let isSaved = false;
  let uploadedFileMap = {};

  /* ── Loader ───────────────────────────────────────── */
  const loader = document.createElement("div");
  loader.className = "gs-pers-modal__loader";
  loader.hidden = true;
  loader.innerHTML = `
    <div class="gs-pers-modal__loader-inner">
      <svg class="gs-pers-modal__loader-ring" viewBox="0 0 50 50" width="40" height="40" aria-hidden="true">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="3"
          stroke-dasharray="100 26" stroke-linecap="round"/>
      </svg>
      <span class="gs-pers-modal__loader-text">Personalising your gift…</span>
    </div>
  `;
  if (previewWrap) {
    previewWrap.appendChild(loader);
    console.log("[TGS] Loader appended to previewWrap");
  } else {
    console.warn("[TGS] previewWrap not found — loader not appended");
  }

  function showLoader() {
    loader.hidden = false;
    const img = getPreviewImg();
    if (img) img.style.opacity = "0.3";
  }

  function hideLoader() {
    loader.hidden = true;
    const img = getPreviewImg();
    if (img) img.style.opacity = "1";
  }

  /* ── Build Cloudinary fetch URL ───────────────────── */
  function buildCloudinaryUrl(textValues) {
    if (!cfg.cloudName || !cfg.previewImageUrl) {
      console.warn("[TGS] Missing cloudName or previewImageUrl");
      return cfg.previewImageUrl;
    }

    const absoluteUrl = cfg.previewImageUrl.startsWith("//")
      ? "https:" + cfg.previewImageUrl
      : cfg.previewImageUrl;

    const baseUrl = `https://res.cloudinary.com/${cfg.cloudName}/image/fetch`;
    const config = cfg.personalizationConfig || {};

    const color = config.textColor || "C49A3C";
    const fontSize = config.fontSize || 60;
    const fontFamily = (config.fontFamily || "Arial").replace(/ /g, "%20");
    const xPercent = config.xPercent ?? 50;
    const yPercent = config.yPercent ?? 80;

    const weight =
      config.fontWeight && config.fontWeight !== "normal"
        ? `_${config.fontWeight}`
        : "";
    const italic = config.fontStyle === "italic" ? "_italic" : "";
    const decoration =
      config.textDecoration && config.textDecoration !== "none"
        ? `_${config.textDecoration}`
        : "";
    const align =
      config.textAlign && config.textAlign !== "left"
        ? `_text_align_${config.textAlign}`
        : "";
    const lspacing = config.letterSpacing
      ? `_letter_spacing_${config.letterSpacing}`
      : "";
    const linespacing = config.lineSpacing
      ? `_line_spacing_${config.lineSpacing}`
      : "";

    const layers = textValues
      .filter((t) => t.trim().length > 0)
      .map((text, i) => {
        const encoded = encodeURIComponent(
          text.toUpperCase().replace(/,/g, "%2C"),
        );
        const size = Math.max(20, fontSize - i * 8);
        const textStyle = `${fontFamily}_${size}${weight}${italic}${decoration}${align}${lspacing}${linespacing}`;

        return [
          `co_rgb:${color}`,
          `l_text:${textStyle}:${encoded}`,
          `fl_relative`,
          `g_north_west`,
          `x_${(xPercent / 100).toFixed(2)}`,
          `y_${((yPercent + i * 8) / 100).toFixed(2)}`,
        ].join(",");
      })
      .join("/");

    console.log("[TGS] Transformation layers:", layers);

    if (!layers) return absoluteUrl;

    const finalUrl = `${baseUrl}/${layers}/f_auto,q_auto/${encodeURIComponent(absoluteUrl)}`;
    console.log("[TGS] Final Cloudinary URL:", finalUrl);
    return finalUrl;
  }

  /* ── Update preview ───────────────────────────────── */
  function updatePreview() {
    const previewImg = getPreviewImg();
    console.log("[TGS] updatePreview — previewImg found:", !!previewImg);

    if (!previewImg) {
      console.error("[TGS] #gs-pers-preview-img not in DOM");
      return;
    }

    const textValues = fields
      .filter((f) => f.dataset.fieldType === "text")
      .map((f) => f.value.trim());

    console.log("[TGS] Text values:", textValues);

    const hasText = textValues.some((t) => t.length > 0);

    if (!hasText) {
      previewImg.src = cfg.previewImageUrl || "";
      console.log("[TGS] No text — reset to base preview image");

      const thumbWrap = document.getElementById("gs-pers-gallery-thumb-wrap");
      if (thumbWrap) thumbWrap.setAttribute("hidden", "");
      return;
    }

    showLoader();

    const url = buildCloudinaryUrl(textValues);
    const tempImg = new Image();

    tempImg.onload = () => {
      console.log("[TGS] Cloudinary image loaded successfully:", url);
      const pi = getPreviewImg();
      if (pi) pi.src = url;
      hideLoader();

      // ✨ Feed the image into the product media gallery placeholders
      const thumbWrap = document.getElementById("gs-pers-gallery-thumb-wrap");
      const thumbImg = document.getElementById("gs-pers-gallery-thumb-img");
      const mainSlide = document.getElementById("GsSlide-pers-preview");
      const mainImg = document.getElementById("gs-pers-gallery-main-img");

      if (thumbWrap && thumbImg && mainSlide && mainImg) {
        thumbImg.src = url;
        mainImg.src = url;
        thumbWrap.removeAttribute("hidden");
      }
    };

    tempImg.onerror = () => {
      console.error("[TGS] Cloudinary image failed to load:", url);
      console.error(
        "[TGS] Possible causes: fetch not enabled in Cloudinary, cdn.shopify.com not whitelisted, or invalid URL",
      );
      const pi = getPreviewImg();
      if (pi) pi.src = cfg.previewImageUrl || "";
      hideLoader();
    };

    tempImg.src = url;
  }

  /* ── Debounce ─────────────────────────────────────── */
  let previewTimer = null;
  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 600);
  }

  /* ── Progress ─────────────────────────────────────── */
  function updateProgress() {
    const filled = fields.filter((f) => {
      if (f.dataset.fieldType === "text") return f.value.trim().length > 0;
      if (f.dataset.fieldType === "image") return uploadedFileMap[f.id] != null;
      return false;
    }).length;

    const pct = totalFields > 0 ? Math.round((filled / totalFields) * 100) : 0;
    if (progressBar) progressBar.style.width = pct + "%";
    if (progressLbl) progressLbl.textContent = pct + "% complete";
  }

  /* ── Field events ─────────────────────────────────── */
  fields.forEach((field, idx) => {
    if (field.dataset.fieldType === "text") {
      const counter = document.getElementById("gs-counter-" + idx);
      field.addEventListener("input", () => {
        if (counter) counter.textContent = field.value.length;
        updateProgress();
        schedulePreview();
      });
    }

    if (field.dataset.fieldType === "image") {
      const uploadText = document.getElementById("gs-upload-text-" + idx);
      field.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          alert("Image must be under 5MB.");
          field.value = "";
          return;
        }

        if (uploadText) uploadText.textContent = "Uploading…";
        showLoader();

        try {
          console.log("[TGS] Uploading image to Cloudinary…");
          const url = await uploadToCloudinary(file);
          uploadedFileMap[field.id] = url;
          console.log("[TGS] Image uploaded:", url);
          if (uploadText) uploadText.textContent = file.name;
          updateProgress();
        } catch (err) {
          console.error("[TGS] Upload error:", err);
          if (uploadText) uploadText.textContent = "Upload failed — try again";
        } finally {
          hideLoader();
        }
      });
    }
  });

  /* ── Cloudinary file upload ───────────────────────── */
  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cfg.uploadPreset);

    console.log(
      "[TGS] Uploading to cloud:",
      cfg.cloudName,
      "| preset:",
      cfg.uploadPreset,
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`,
      { method: "POST", body: formData },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  }

  /* ── Save & Review ────────────────────────────────── */
  saveBtn.addEventListener("click", async () => {
    console.log("[TGS] Save clicked — isSaved:", isSaved);

    if (isSaved) {
      applyToCart();
      return;
    }

    const anyFilled = fields.some((f) => {
      if (f.dataset.fieldType === "text") return f.value.trim().length > 0;
      if (f.dataset.fieldType === "image") return uploadedFileMap[f.id] != null;
      return false;
    });

    if (!anyFilled) {
      alert("Please fill at least one personalisation field.");
      return;
    }

    saveBtn.classList.add("is-loading");
    saveTxt.textContent = "Saving…";

    savedData = {};
    fields.forEach((f) => {
      if (f.dataset.fieldType === "text" && f.value.trim()) {
        savedData[f.dataset.fieldLabel] = f.value.trim();
      }
      if (f.dataset.fieldType === "image" && uploadedFileMap[f.id]) {
        savedData[f.dataset.fieldLabel] = uploadedFileMap[f.id];
      }
    });

    console.log("[TGS] savedData:", savedData);

    clearTimeout(previewTimer);
    updatePreview();

    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (loader.hidden) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        resolve();
      }, 3000);
    });

    isSaved = true;
    saveTxt.textContent = "Add to Cart →";
    saveBtn.classList.remove("is-loading");
    showSavedBadge();

     const persThumbBtn = document.getElementById("gs-pers-gallery-thumb-btn");
     if (persThumbBtn) persThumbBtn.click();
  });

  /* ── Apply line item properties ───────────────────── */
  function applyToCart() {
    const atcForm = document.querySelector('form[action="/cart/add"]');
    console.log(
      "[TGS] applyToCart — form found:",
      !!atcForm,
      "| savedData:",
      savedData,
    );

    if (!atcForm) {
      console.error("[TGS] ATC form not found");
      return;
    }

    Object.entries(savedData).forEach(([label, value]) => {
      let input = atcForm.querySelector(`input[name="properties[${label}]"]`);
      if (!input) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = `properties[${label}]`;
        atcForm.appendChild(input);
      }
      input.value = value;
      console.log("[TGS] Property set —", label, ":", value);
    });

    closeModal();
    const atcBtn = atcForm.querySelector('[name="add"]');
    console.log("[TGS] ATC button found:", !!atcBtn);
    if (atcBtn) atcBtn.click();
  }

  /* ── Saved badge ──────────────────────────────────── */
  function showSavedBadge() {
    closeModal();
    let badge = document.getElementById("gs-pers-badge");
    if (!badge) {
      badge = document.createElement("p");
      badge.id = "gs-pers-badge";
      badge.style.cssText = [
        "font-size:var(--text-sm)",
        "color:var(--color-accent-gold)",
        "margin-top:var(--space-2)",
        "display:flex",
        "align-items:center",
        "gap:6px",
      ].join(";");
      const trigger = document.getElementById("gs-pers-trigger");
      if (trigger) trigger.insertAdjacentElement("afterend", badge);
    }
    badge.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6.5" stroke="currentColor"/>
        <path d="M4 7L6.5 9.5L10 5" stroke="currentColor" stroke-width="1.2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Personalisation saved
    `;
  }

  /* ── Open / Close ─────────────────────────────────── */
  function openModal() {
    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    updateProgress();
    closeBtn.focus();
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  backdrop.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) closeModal();
  });

  const triggerBtn = document.getElementById("gs-pers-trigger");
  console.log("[TGS] Trigger button found:", !!triggerBtn);
  if (triggerBtn) triggerBtn.addEventListener("click", openModal);

  console.log("[TGS] Init complete");
})();
