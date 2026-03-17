# The Gift Studio — Personalization Feature: Full Implementation Plan

## Confirmed Scope

| Decision | Confirmed |
|---|---|
| Platform | Shopify (stay) |
| Personalization types | Text, Image Upload, or Both (per product) |
| Text fields | Multiple, configurable per product via metafield JSON |
| Image storage | Cloudinary (free tier) |
| Text preview | Live Canvas API overlay (fixed position) |
| ATC gating | Optional — user can skip personalization |
| Font/color selection | Phase 2 (advanced option later) |
| Products | Candles + Gift Boxes (10–15 demo products) |

---

## Metafield Setup (Shopify Admin)

### Metafield 1 — `custom.is_personalizable` (Boolean)
Toggles the entire personalization UI on/off per product.

### Metafield 2 — `custom.personalization_config` (JSON)
Defines which fields appear in the modal for that product.

```json
{
  "fields": [
    { "type": "text", "label": "Name", "maxChars": 20, "placeholder": "e.g. Priya" },
    { "type": "text", "label": "Message", "maxChars": 50, "placeholder": "e.g. Happy Birthday!" },
    { "type": "image", "label": "Upload a Photo" }
  ]
}
```

**Supported field types:** `text` | `image`
Configure this per product. Products with only text get only text fields. Products with both get both.

### Metafield 3 — `custom.preview_image` (File / URL)
Clean product photo (no existing text) used as the canvas base image for live preview.

---

## Demo Product Plan (Candles + Gift Boxes)

### Candles (7 products)

| Product | Personalization Type |
|---|---|
| Luxury Soy Candle — Rose & Oud | Text only (Name on label) |
| Birthday Celebration Candle | Text only (Name + Message) |
| Wedding Favour Candle Set | Text only (Names + Date) |
| Personalised Photo Candle | Image + Text |
| Corporate Logo Candle | Image only |
| Couple Names Pillar Candle | Text only (2 names) |
| Festive Diya Gift Set | None (not personalizable) |

### Gift Boxes (8 products)

| Product | Personalization Type |
|---|---|
| Classic Hamper Box | Text only (To/From message) |
| Premium Corporate Gift Box | Image + Text (logo + message) |
| Birthday Surprise Box | Text only (Name + Message) |
| Wedding Gift Hamper | Text only (Couple names + Date) |
| Self-Care Box | None (not personalizable) |
| Baby Shower Gift Box | Text + Image |
| Diwali Luxury Box | None (not personalizable) |
| Thank You Box | Text only (Message) |

---

## File Structure

```
sections/
  section-personalization-modal.liquid
  section-personalization-modal.css
  section-personalization-modal.js

snippets/
  personalization-trigger.liquid    ← "Personalize Now" button on PDP
  cart-personalization-display.liquid ← shows saved values in cart

assets/
  section-personalization-modal.css
  section-personalization-modal.js
```

---

## Implementation Phases

---

### Phase 1 — PDP Trigger Button

**File:** `snippets/personalization-trigger.liquid`

- Check `product.metafields.custom.is_personalizable`
- If true, render "Personalize Now" button
- Button is visually distinct (gold accent, icon)
- Standard ATC button remains visible but no gating (optional flow)

---

### Phase 2 — Modal Structure

**File:** `section-personalization-modal.liquid`

**Layout:** Full-screen overlay, two-column split

```
┌─────────────────────────────────────────────────────┐
│  [X]                                                │
│ ┌──────────────────┐  ┌──────────────────────────┐  │
│ │                  │  │  Start Personalizing      │  │
│ │  Canvas Preview  │  │  ─────────────────────── │  │
│ │  (product image  │  │  Progress bar             │  │
│ │   + live text    │  │                           │  │
│ │   overlay)       │  │  [Field 1: text input]    │  │
│ │                  │  │  [Field 2: text input]    │  │
│ │                  │  │  [Field 3: image upload]  │  │
│ │                  │  │                           │  │
│ │                  │  │  Notes / guidelines       │  │
│ │                  │  │                           │  │
│ │                  │  │  [SAVE & REVIEW]          │  │
│ └──────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Fields rendered dynamically** from `personalization_config` JSON metafield.
Each `text` type → `<input type="text">` with maxlength
Each `image` type → `<input type="file" accept="image/*">`

---

### Phase 3 — Live Canvas Preview

**File:** `section-personalization-modal.js`

**Flow:**
1. Modal opens → fetch preview image → `ctx.drawImage()` onto canvas
2. User types in any text field → `canvas clear → redraw image → ctx.fillText()` for each filled field
3. Text renders at fixed position (bottom-center of canvas, consistent across all products)
4. Image upload → user selects file → `FileReader` → draw onto canvas at fixed position
5. Before Cloudinary upload, image is held in memory as base64

**Canvas text defaults:**
```
Font:     "Cormorant Garamond" bold
Color:    #C49A3C (gold accent)
Position: center-bottom, 15% from bottom edge
Size:     auto-scaled to canvas width
```

---

### Phase 4 — Cloudinary Image Upload

**Triggered on:** "Save & Review" click (not on file select)

**Flow:**
1. User selects image → preview shown on canvas immediately (local FileReader, no upload yet)
2. User clicks "Save & Review" → JS uploads to Cloudinary via unsigned upload preset
3. Cloudinary returns a secure URL
4. URL stored in JS state, then passed as line item property on ATC

**Cloudinary config needed:**
- Free account at cloudinary.com
- Create an **unsigned upload preset** (no backend auth needed)
- Store `cloud_name` and `upload_preset` in a global JS variable via Liquid

```liquid
<script>
  window.CloudinaryConfig = {
    cloudName: '{{ settings.cloudinary_cloud_name }}',
    uploadPreset: '{{ settings.cloudinary_upload_preset }}'
  };
</script>
```

These go in **Theme Settings** (customizer), so no hardcoding.

---

### Phase 5 — Save State & ATC

**On "Save & Review" click:**
1. Validate: at least one field filled (soft validation — warn, don't block)
2. Upload image to Cloudinary if present → get URL
3. Store all values in a JS object: `personalizationData = { Name: "Priya", Message: "...", photoUrl: "..." }`
4. Modal closes
5. A "Personalization saved ✓" badge appears near the ATC button
6. User clicks Add to Cart normally

**On ATC form submit:**
JS intercepts form submission and appends hidden inputs:
```
properties[Name]        = "Priya"
properties[Message]     = "Happy Birthday!"
properties[Photo URL]   = "https://res.cloudinary.com/..."
```

These show automatically in Shopify admin order, cart, and email confirmations.

---

### Phase 6 — Cart Display

**File:** `snippets/cart-personalization-display.liquid`

In cart line items loop, render any non-blank `item.properties` key-value pairs:

```
Personalization:
  Name: Priya
  Message: Happy Birthday!
  Photo: [thumbnail image from Cloudinary URL]
```

For the photo, since the URL is stored as a property, render a small `<img>` tag using that URL.

---

### Phase 7 — Progress Bar

Tracks completion across all fields for that product.

```
Progress = (filled fields / total fields) × 100%
```

Updates live on every `input` / `change` event.
Fills green as user completes fields.
Doesn't block saving — purely visual feedback.

---

## Line Item Properties — What Goes to Shopify

| Property Key | Value | Source |
|---|---|---|
| `Personalization: [Label]` | User text | Text input |
| `Personalization: Photo` | Cloudinary URL | Image upload |

All properties appear in:
- Cart page
- Order confirmation email (automatic)
- Shopify Admin → Order detail
- Packing slip

---

## Theme Settings (Shopify Customizer)

Add these to `config/settings_schema.json`:

| Setting | Purpose |
|---|---|
| `cloudinary_cloud_name` | Cloudinary account identifier |
| `cloudinary_upload_preset` | Unsigned upload preset name |

This keeps credentials out of code.

---

## Phase 2 (Advanced — Later)

- Font selector (serif / sans / script)
- Text color picker
- Text size control
- Multiple canvas zones (top + bottom)
- Per-product text position via metafield coordinates
- Preview download / share before ordering

---

## Build Order

```
1.  Metafields setup in Shopify Admin
2.  Theme Settings (Cloudinary config)
3.  Demo products created with metafields
4.  personalization-trigger.liquid (PDP button)
5.  section-personalization-modal.liquid (HTML structure)
6.  section-personalization-modal.css (styling)
7.  section-personalization-modal.js (canvas + upload logic)
8.  cart-personalization-display.liquid (cart rendering)
9.  Wire into product.json template
10. Wire into cart.json template
```

---

## What to Do Before Coding Starts

1. **Create Cloudinary free account** → get `cloud_name` → create unsigned upload preset
2. **Add 10–15 demo products** in Shopify Admin using the product table above
3. **Add metafields** (`is_personalizable`, `personalization_config`, `preview_image`) to each product
4. **Upload clean product photos** (no text) as `preview_image` per product