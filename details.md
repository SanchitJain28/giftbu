# Giftbu- Design Documentation

## Color Schema
Primary Background:   #F5EFE6  (warm cream)
Secondary BG:         #EDE0D0  (deeper beige, sections)
Surface/Card:         #FDFAF6  (near white, elevated cards)

Primary Text:         #1A1209  (near black, warm undertone)
Secondary Text:       #6B5744  (warm brown, subtext)

Accent – Gold:        #C49A3C  (buttons, highlights, CTAs)
Accent – Dark:        #2C1A0E  (dark brown, hero CTA like "Download Catalogue")
Accent – Warm Rose:   #D4907A  (subtle pink, hover states, feminine softness)

Border/Divider:       #D9CABB  (muted warm border)
Shadow:               rgba(90, 55, 20, 0.10)
## Development Context

**Project**: Premium corporate & personal gifting eCommerce site
**Brand**: The Gift Studio (or your brand name)
**Base Theme**: Dawn (heavily customized)
**Stack**: Shopify Liquid, CSS, Vanilla JS, GSAP (animations)
**Typography**: Google Fonts — Playfair Display (display) + Jost (body)

---

## Design System

**Aesthetic**: Warm luxury — cream neutrals, gold accents, editorial gifting feel
**Mood**: Premium, warm, celebratory, trustworthy

### Color Tokens
```css
--color-bg-primary:     #F5EFE6;
--color-bg-secondary:   #EDE0D0;
--color-surface:        #FDFAF6;
--color-text-primary:   #1A1209;
--color-text-secondary: #6B5744;
--color-accent-gold:    #C49A3C;
--color-accent-dark:    #2C1A0E;
--color-accent-rose:    #D4907A;
--color-border:         #D9CABB;
--color-shadow:         rgba(90, 55, 20, 0.10);
```

### Typography Scale
```css
font-family: "Cormorant Garamond", serif;
font-optical-sizing: auto;
--text-xs:        0.75rem;
--text-sm:        0.875rem;
--text-base:      1rem;
--text-lg:        1.125rem;
--text-xl:        1.25rem;
--text-2xl:       1.5rem;
--text-3xl:       2rem;
--text-4xl:       2.75rem;
--text-5xl:       3.75rem;
```

### Spacing Scale
```css
--space-1: 4px;   --space-2: 8px;
--space-3: 12px;  --space-4: 16px;
--space-5: 24px;  --space-6: 32px;
--space-7: 48px;  --space-8: 64px;
--space-9: 96px;  --space-10: 128px;
```


---

## Rules

- Every section has its own `.css`, `.js` file in `assets/`
- Every `.liquid` section includes a full Shopify `{% schema %}` block
- JS uses GSAP for scroll-triggered reveals (`ScrollTrigger`) and hero animations
- No jQuery — vanilla JS only
- CSS uses custom properties (tokens above) — no hardcoded values
- All images use Shopify's `image_url` filter with `loading="lazy"`
- Forms use Shopify's native `contact` form action or custom metafield-backed logic
- Accessibility: semantic HTML, `aria-label`, keyboard nav on all interactive elements
- Performance: CSS/JS loaded per-section via `{{ 'file.css' | asset_url | stylesheet_tag }}`

---

## Store Page Structure

| Template | Purpose |
|---|---|
| `index.json` | Homepage — hero, categories, featured products |
| `page.corporate.json` | Corporate gifting — form, catalogue, categories |
| `page.contact.json` | General enquiry |
| `collection.json` | Product grid by occasion/category |
| `product.json` | PDP with gifting options |
| `cart.json` | Cart with gift note field |

---

## GSAP Usage Pattern
```js
// Standard scroll reveal — use across all sections
gsap.registerPlugin(ScrollTrigger);

gsap.from('.reveal-up', {
  y: 40,
  opacity: 0,
  duration: 0.8,
  stagger: 0.15,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.reveal-up',
    start: 'top 85%',
  }
});
```

---

## Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Section file | `section-[name].liquid` | `section-corporate-hero.liquid` |
| CSS asset | `section-[name].css` | `section-corporate-hero.css` |
| JS asset | `section-[name].js` | `section-corporate-hero.js` |
| Snippet | `[component].liquid` | `gift-card.liquid` |
| CSS class | `gs-[block]__[element]` | `gs-hero__title` |
| Schema id | `kebab-case` | `corporate-hero` |

# NOTES WHICH WOULD BE FOLLOWED STRICTLY
1. Don't use padding inline paddings like these
gs-category-bar-{{ section.id }}" class="gs-category-bar-wrapper section-{{ section.id }}-padding
and there should be no style block in liquid file

{%- style -%}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px;
  }

  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }

  /* Dynamic Customizations */
  #gs-category-bar-{{ section.id }} {
    --local-border-color: {{ section.settings.border_color }};
    --local-bg-color: {{ section.settings.bg_color }};
    --local-blob-color: {{ section.settings.blob_color }};
  }
{%- endstyle -%} 

2. Don't use font-sizes variables , you can use color variables , but don't use font-sizes variables like
  --text-xs:   0.75rem;
  --text-sm:   1rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  2rem;
  --text-4xl:  2.75rem;
  --text-5xl:  3.75rem;

3. Don't use unneccasary paddings and margins , the design should not be bulky but rather by compacty

## Product Metafields — PDP Content

### Metafield Definitions
| Name | Namespace & Key | Type |
|---|---|---|
| Product Details | `custom.product_details` | Rich text |
| More Details | `custom.more_details` | Rich text |

### Rendering in PDP
Use `metafield_tag` filter for rich text — never `.value` directly.
```liquid
{% if product.metafields.custom.product_details.value %}
  <div class="gs-pdp-meta">
    <h3 class="gs-pdp-meta__heading">Product Details</h3>
    <div class="gs-pdp-meta__content rte">
      {{ product.metafields.custom.product_details | metafield_tag }}
    </div>
  </div>
{% endif %}

{% if product.metafields.custom.more_details.value %}
  <div class="gs-pdp-meta">
    <h3 class="gs-pdp-meta__heading">More Details</h3>
    <div class="gs-pdp-meta__content rte">
      {{ product.metafields.custom.more_details | metafield_tag }}
    </div>
  </div>
{% endif %}
```

### Placement
Add via `custom_liquid` block in Dawn customizer, placed after the description block in the product section block order.

### Rules
- Rich text type only — gives formatted editor in Shopify Admin
- Fill per product: Admin → Products → scroll to metafields section
- Use Dawn's `rte` class on the content wrapper — handles list, heading, link styles automatically
- No inline styles, no style blocks