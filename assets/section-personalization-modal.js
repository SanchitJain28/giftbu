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
  const resetBtn = document.querySelector(".gs-pers-modal__reset-btn");

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
    // console.log("[TGS DEBUG] showLoader() called");
    if (loader) loader.hidden = false;
  }

  function hideLoader() {
    // console.log("[TGS DEBUG] hideLoader() called");
    if (loader) loader.hidden = true;
  }

  /* ── Build Cloudinary fetch URL ───────────────────── */
  function buildCloudinaryUrl() {
    if (!cfg.cloudName || !cfg.previewImageUrl) {
      console.warn("[TGS] Missing cloudName or previewImageUrl");
      return cfg.previewImageUrl;
    }

    const absoluteUrl = cfg.previewImageUrl.startsWith("//")
      ? "https:" + cfg.previewImageUrl
      : cfg.previewImageUrl;

    const baseUrl = `https://res.cloudinary.com/${cfg.cloudName}/image/fetch`;
    const configFields = cfg.personalizationConfig?.fields || [];

    const layers = configFields
      .map((field, idx) => {
        const domField = fields[idx];
        if (!domField) return null;

        if (field.type === "text") {
          const val = domField.value.trim();
          if (!val) return null;

          const font = (field.fontFamily || "Arial").replace(/ /g, "%20");
          const color = (field.textColor || "C49A3C").replace("#", "");
          const weight =
            field.fontWeight && field.fontWeight !== "normal"
              ? `_${field.fontWeight}`
              : "";
          const italic = field.fontStyle === "italic" ? "_italic" : "";
          const decoration =
            field.textDecoration && field.textDecoration !== "none"
              ? `_${field.textDecoration}`
              : "";
          const align =
            field.textAlign && field.textAlign !== "left"
              ? `_text_align_${field.textAlign}`
              : "";
          const lspacing = field.letterSpacing
            ? `_letter_spacing_${field.letterSpacing}`
            : "";
          const linespace = field.lineSpacing
            ? `_line_spacing_${field.lineSpacing}`
            : "";

          const textStyle = `${font}_${field.fontSize || 60}${weight}${italic}${decoration}${align}${lspacing}${linespace}`;
          const encoded = encodeURIComponent(
            val.toUpperCase().replace(/,/g, "%2C"),
          );

          return [
            `co_rgb:${color}`,
            `l_text:${textStyle}:${encoded}`,
            `fl_relative`,
            `g_north_west`,
            `x_${(field.xPercent / 100).toFixed(2)}`,
            `y_${(field.yPercent / 100).toFixed(2)}`,
          ].join(",");
        }

        if (field.type === "image") {
          const uploadData = uploadedFileMap[domField.id];
          if (!uploadData || !uploadData.public_id) return null;

          const publicId = uploadData.public_id.replace(/\//g, ":");
          const width = field.widthPercent || 30;

          return [
            `l_${publicId}`,
            `c_scale`,
            `w_${(width / 100).toFixed(2)}`,
            `fl_relative`,
            `g_north_west`,
            `x_${(field.xPercent / 100).toFixed(2)}`,
            `y_${(field.yPercent / 100).toFixed(2)}`,
          ].join(",");
        }

        return null;
      })
      .filter(Boolean)
      .join("/");

    // console.log("[TGS] Transformation layers:", layers);
    if (!layers) return absoluteUrl;

    const finalUrl = `${baseUrl}/${layers}/f_auto,q_auto/${encodeURIComponent(absoluteUrl)}`;
    console.log("[TGS] Final Cloudinary URL:", finalUrl);
    return finalUrl;
  }

  /* ── Update preview ───────────────────────────────── */
   function updatePreview() {
    //  console.log("[TGS DEBUG] --- updatePreview() Started ---");
     const previewImg = getPreviewImg();

     if (!previewImg) {
       console.error("[TGS DEBUG] #gs-pers-preview-img not in DOM");
       hideLoader();
       return;
     }

     const anyFilled = fields.some((f) => {
       if (f.dataset.fieldType === "text") return f.value.trim().length > 0;
       if (f.dataset.fieldType === "image")
         return uploadedFileMap[f.id] != null;
       return false;
     });

    //  console.log("[TGS DEBUG] Are any fields filled?", anyFilled);

     if (!anyFilled) {
      //  console.log("[TGS DEBUG] No inputs — resetting to base preview image");
       previewImg.src = cfg.previewImageUrl || "";

       hideLoader();

       const thumbWrap = document.getElementById("gs-pers-gallery-thumb-wrap");
       if (thumbWrap) thumbWrap.setAttribute("hidden", "");
       return;
     }

    //  console.log(
    //    "[TGS DEBUG] Inputs exist. Calling showLoader() and building URL...",
    //  );
     showLoader();

     let url;
     try {
       url = buildCloudinaryUrl();
      //  console.log("[TGS DEBUG] URL built successfully:", url);
     } catch (err) {
       console.error("[TGS DEBUG] Error building Cloudinary URL:", err);
       hideLoader();
       return;
     }

     const tempImg = new Image();

     // Safety timeout just in case Cloudinary hangs
     const loadTimeout = setTimeout(() => {
       console.warn(
         "[TGS DEBUG] Preview image load TIMED OUT after 10 seconds.",
       );
       hideLoader();
     }, 10000);

     tempImg.onload = () => {
      //  console.log(
      //    "[TGS DEBUG] tempImg.onload FIRED - image loaded from Cloudinary",
      //  );
       clearTimeout(loadTimeout);
       const pi = getPreviewImg();
       if (pi) pi.src = url;
       hideLoader();

       // Feed the image into the product media gallery placeholders
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
       console.error(
         "[TGS DEBUG] tempImg.onerror FIRED - failed to load URL:",
         url,
       );
       clearTimeout(loadTimeout);
       const pi = getPreviewImg();
       if (pi) pi.src = cfg.previewImageUrl || "";
       hideLoader();
     };

    //  console.log(
    //    "[TGS DEBUG] Setting tempImg.src to trigger browser network request...",
    //  );
     tempImg.src = url;
   }

  /* ── Debounce ─────────────────────────────────────── */
    let previewTimer = null;
    function schedulePreview() {
      // console.log("[TGS DEBUG] schedulePreview() triggered. Waiting 600ms...");
      clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        // console.log("[TGS DEBUG] Debounce finished, executing updatePreview()");
        updatePreview();
      }, 600);
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
      const updateBtn = field.parentElement.querySelector(
        ".gs-pers-modal__update-btn",
      );

      // Trigger on typing (with debounce)
      field.addEventListener("input", () => {
        if (counter) counter.textContent = field.value.length;
        updateProgress();
        schedulePreview();
      });

      // Trigger immediately on UPDATE button click
      if (updateBtn) {
        updateBtn.addEventListener("click", () => {
          updateProgress();
          clearTimeout(previewTimer); // cancel typing delay
          updatePreview(); // update immediately
        });
      }
    }

    if (field.dataset.fieldType === "image") {
      const uploadText = document.getElementById("gs-upload-text-" + idx);
      field.addEventListener("change", async (e) => {
        const file = e.target.files[0];

        // Handle case where user cancels the file picker dialog
        if (!file) {
          if (uploadText) uploadText.textContent = "No file chosen";
          delete uploadedFileMap[field.id];
          updateProgress();
          schedulePreview();
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert("Image must be under 5MB.");
          field.value = "";
          return;
        }

        if (uploadText) uploadText.textContent = "Uploading…";
        showLoader();

        try {
          console.log("[TGS] Uploading image to Cloudinary…");
          const data = await uploadToCloudinary(file);
          uploadedFileMap[field.id] = {
            public_id: data.public_id,
            secure_url: data.secure_url,
          };
          console.log("[TGS] Image uploaded:", data.secure_url);
          if (uploadText) uploadText.textContent = file.name;
          updateProgress();
          schedulePreview(); // Triggers the preview, which manages hiding the loader
        } catch (err) {
          console.error("[TGS] Upload error:", err);
          if (uploadText) uploadText.textContent = "Upload failed — try again";
          hideLoader(); // Only manually hide here if upload completely fails
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
    return data;
  }

  /* ── Save & Review ────────────────────────────────── */
  saveBtn.addEventListener("click", async () => {
    console.log("[TGS] Save clicked — isSaved:", isSaved);

    if (isSaved) {
      closeModal();
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
      let rawLabel = f.dataset.fieldLabel ? f.dataset.fieldLabel.trim() : "";
      let label =
        rawLabel !== ""
          ? rawLabel
          : f.dataset.fieldType === "image"
            ? "Uploaded Photo"
            : "Custom Text";

      if (f.dataset.fieldType === "text" && f.value.trim()) {
        savedData[label] = f.value.trim();
      }
      if (f.dataset.fieldType === "image" && uploadedFileMap[f.id]) {
        savedData[label] = uploadedFileMap[f.id].secure_url;
      }
    });

    // --- Save preview image safely ---
    try {
      const generatedPreviewUrl = buildCloudinaryUrl();
      if (
        generatedPreviewUrl &&
        generatedPreviewUrl !== cfg.previewImageUrl &&
        generatedPreviewUrl.length < 1000
      ) {
        savedData["_Preview_Image"] = generatedPreviewUrl;
      } else if (generatedPreviewUrl && generatedPreviewUrl.length >= 1000) {
        console.warn(
          "[TGS] Preview URL too long for Shopify properties. Skipping _Preview_Image.",
        );
      }
    } catch (e) {
      console.error("[TGS] Could not save preview image to cart properties", e);
    }

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

    // Change button text in case they open the modal again
    saveTxt.textContent = "Close & Review";
    saveBtn.classList.remove("is-loading");

    // 1. Inject the hidden inputs into the main form
    injectPropertiesToForm();

    // 2. Show the success badge under the trigger button
    showSavedBadge();

    // 3. Switch the main product gallery to the personalized image
    const persThumbBtn = document.getElementById("gs-pers-gallery-thumb-btn");
    if (persThumbBtn) persThumbBtn.click();

    // 4. Close the modal, letting the user click the main ATC button
    closeModal();
  });

  /* ── Inject line item properties into Main Form ───── */
  function injectPropertiesToForm() {
    const atcForm = document.querySelector('gs-product-form form') || document.querySelector('form[data-type="add-to-cart-form"]');
    
    console.log("[TGS] Injecting properties to form:", !!atcForm);

    if (!atcForm) {
      console.error("[TGS] ATC form not found. Cannot inject properties.");
      return;
    }

    // First, clear out any old properties in case they edited their personalization
    const oldInputs = atcForm.querySelectorAll('input[name^="properties["]');
    oldInputs.forEach(input => input.remove());

    // Now, inject the fresh properties
    Object.entries(savedData).forEach(([label, value]) => {
      let input = document.createElement("input");
      input.type = "hidden";
      input.name = `properties[${label}]`;
      input.value = value;
      atcForm.appendChild(input);
      console.log("[TGS] Property injected —", label, ":", value);
    });
  }

  /* ── Apply line item properties ───────────────────── */
  function applyToCart() {
    //? get our custom form or get the default form
    const atcForm = document.querySelector('gs-product-form form') || document.querySelector('form[data-type="add-to-cart-form"]');
    
    console.log(
      "[TGS] applyToCart — form found:",
      !!atcForm,
      "| savedData:",
      savedData,
    );

    if (!atcForm) {
      console.error("[TGS] ATC form not found. Check if gs-product-form exists in the DOM.");
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
    
    // Target the actual submit button inside your form
    const atcBtn = atcForm.querySelector('button[type="submit"][name="add"]');
    console.log("[TGS] ATC button found:", !!atcBtn);
    
    // Trigger the click, which your gs-product-form JS will intercept for the AJAX add!
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

  /* ── Reset Everything ─────────────────────────────── */
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      // console.log("[TGS DEBUG] Reset All clicked!");
      
      // CRITICAL: Kill any pending delayed previews from rapid typing
      clearTimeout(previewTimer);

      // 1. Clear all fields
      fields.forEach((f) => {
        if (f.dataset.fieldType === "text") {
          f.value = "";
          const counter = document.getElementById(
            "gs-counter-" + f.id.split("-").pop(),
          );
          if (counter) counter.textContent = "0";
        }
        if (f.dataset.fieldType === "image") {
          f.value = "";
          const uploadText = document.getElementById(
            "gs-upload-text-" + f.id.split("-").pop(),
          );
          if (uploadText) uploadText.textContent = "No file chosen";
        }
      });

      // 2. Clear stored data states
      uploadedFileMap = {};
      savedData = {};
      isSaved = false;

      // 3. Reset CTA Button
      if (saveTxt) saveTxt.textContent = "SAVE & REVIEW";
      if (saveBtn) saveBtn.classList.remove("is-loading");

      // 4. Reset progress and preview back to default
      updateProgress();
      // console.log("[TGS DEBUG] Forcing updatePreview() after reset");
      updatePreview();
      
      // console.log("[TGS DEBUG] Forcing hideLoader() after reset");
      hideLoader(); 
    });
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
