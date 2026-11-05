# E-commerce coverage — research spec

Status: Proposed (research, not yet a decision)
Date: 2026-11-04 (updated 2026-11-05: legal rules, engineering requirements, quality gates, limits)
Scope: a separate commerce layer on top of the 97 core components, aimed at a large omnichannel retailer (Søstrene Grene as the reference case)

## Why this exists

The core system covers generic UI. A large e-shop needs a second vocabulary: prices, variants, stock, carts, fulfilment. I want that vocabulary to live in its own layer, built only from core primitives and tokens, so the core stays generic and a shop can opt in.

The research below comes from Baymard Institute's free 2025–2026 benchmark articles (US and European sites, manually scored). Baymard's full set is 700+ guidelines behind a paywall; I only used what is public, so treat this as the must-have floor, not the whole picture. Every percentage below is "share of benchmarked sites that get it wrong" and links back to its source at the bottom.

## Why Søstrene Grene is a useful reference

What I could confirm from public sources, and how it shapes the list:

- Webshops in many markets — Ireland was described as the 9th country outside Denmark at launch [S9] → market/language/currency switching is a must-have, not an extra.
- Returns and exchanges can happen in physical stores [S10] → returns info and store-linked fulfilment matter.
- Monthly and seasonal product releases [S10] → "novelty" badges and campaign pages.
- An app with 300+ craft projects and ideas [S9] → inspirational content that links to the products in it.

I couldn't load their live site during this research, so I haven't checked their current UI. Worth a manual look before building.

## How to read the tiers

- **Tier 1 — must-have.** A shop can't run without it, or Baymard shows a large share of sites losing users over it.
- **Tier 2 — high value.** Clear evidence it helps, but a shop can launch without it.
- **Tier 3 — later.** Differentiators or industry-specific.

"Builds on" names core components I believe exist from earlier waves. Check each against `component-registry.json` before building; the registry is the source of truth, not this list.

---

## Part A — Components

### Tier 1: finding products

| Component | Builds on | UX rules that matter |
|---|---|---|
| **ProductCard** | Card, Image, AspectRatio, Link | Combine colour variants into one card with swatches, not one card per colour (42% don't) [S2]. Give access to 3+ images in the list, not just one or two (80% don't) [S2]. One primary link target per card. |
| **Price** | Text | Current price, compare-at/sale price, "from" price, and unit price for anything sold in different amounts (67% don't in lists, 81% on product pages) [S1][S2]. Format with `Intl.NumberFormat` per market. Screen readers must hear "was X, now Y", not two bare numbers. Supports the EU prior price for discounts (see Part B, Legal) as its own prop, separate from any other comparison price. |
| **Swatch / SwatchGroup** | ToggleButton, Tooltip | On mobile show all swatches in a horizontal scroll with visible arrows or a truncated last swatch (73% don't) [S6]. Never colour alone — each swatch needs a text name. |
| **ProductBadge** | Badge | New, Sale, Novelty, Online only. Cap at one or two per card so they keep meaning. |
| **StockStatus** | StatusDot, Text | In stock, low, out, and in-store availability. Icon or text plus colour, never colour alone. |
| **FilterPanel** | Accordion, Checkbox, Slider, Drawer | Allow several values of the same filter at once (14% don't) [S2]. Offer price, rating, colour, size and brand where they apply (51% don't offer all five) [S2]. Sidebar on desktop; a horizontal toolbar only works for roughly 8 filters or fewer [S2]. Drawer on mobile. Show counts per option. |
| **AppliedFilters** | Tag, Button | An overview of applied filters with remove and clear-all, above the list (20% don't on desktop, 66% on mobile) [S2][S6]. Horizontally scrolling or stacked on mobile. |
| **SortSelect** | Select | Price, rating, best-selling and newest at minimum (69% don't offer all four) [S2]. |
| **ProductGrid** | Grid, Pagination, Skeleton | Result count, load-more or pagination, and return users to the same scroll position when they come back from a product page [S2 related]. |
| **SearchAutocomplete** | Combobox, Search | A visible submit button next to the field on mobile (27% don't) [S6]. Suggestions that survive close misspellings (28% don't) [S6]. Product, category and content suggestions in separate groups. |
| **MegaMenu** | NavigationMenu, Popover | 300–500 ms hover delay to stop flicker (62% don't) [S5]. Clickable category headings (31% don't) [S5]. Chunk into about 10 items per group (51% don't) [S5]. Highlight the current scope (96% don't) [S5]. |
| **MobileCategoryNav** | MobileNav, Drawer | Product categories at the first level, not behind "Products" (22% don't) [S5]. A "View all" item at every level (42% don't) [S6]. Highlight current scope here too (94% don't) [S6]. |

### Tier 1: deciding

| Component | Builds on | UX rules that matter |
|---|---|---|
| **ProductGallery** | Carousel, Lightbox, AspectRatio | Thumbnails that show there are more images. Support an "in scale" image so people can judge size (37% don't) [S1] — important for home goods. Zoom through Lightbox. |
| **VariantPicker** | ToggleButton, SegmentedControl, Field | Sizes and options as visible buttons, not a dropdown (57% don't) [S1]. Unavailable options stay visible but marked, so nobody discovers "sold out" after choosing. |
| **QuantityStepper** | NumberInput, IconButton | Plus/minus buttons with an editable field (95% get the cart version wrong) [S3]. Announce the new value. |
| **AddToCart + MiniCart** | Button, Drawer, Toast | Clear confirmation with a live-region announcement; a mini-cart drawer showing what was added, subtotal and next step. |
| **SaveButton (wishlist)** | ToggleButton, IconButton | Works for guests, without forcing sign-up (89% don't) [S1]. |
| **DeliveryEstimate** | Text, Popover | A lowest total-cost or shipping estimate near the buy button (67% don't) [S1]. |
| **ReturnsSnippet** | Text, Link | A return-policy summary or link in the main product content (44% don't) [S1]. |

### Tier 1: buying

| Component | Builds on | UX rules that matter |
|---|---|---|
| **CartLineItem** | Image, QuantityStepper, Price, Button | Variant shown, remove with undo, quantity with buttons [S3]. |
| **OrderSummary** | Card, Price, Accordion | Subtotal, shipping, discounts, total. Collapsible on mobile checkout. |
| **PromoCodeField** | Field, Input, Button | Hidden behind a link, because a visible field sends people off to hunt for codes (35% show it by default) [S4]. |
| **CheckoutSteps** | Stepper, Accordion | If steps are accordions, completed steps collapse into readable summaries (72% don't) [S3]. |
| **AddressForm** | Field, Input, FormLayout, Combobox | One "full name" field (89% use several) [S4]. Address line 2 behind a link (75% don't) [S4]. Billing = shipping by default with billing fields hidden (24% don't) [S4]. Address lookup or validation (54% don't on mobile) [S6]. Proper `autocomplete` attributes. |
| **DeliveryOptions** | Radio, Card, Price | Show a delivery date, not "3–5 business days" (48% don't) [S3]. Cutoff as a countdown (83% don't) [S3]. Every fulfilment option — home delivery, parcel shop, click & collect — in one selector (53% don't) [S3]. |
| **StorePicker** | Dialog, Drawer, Search, StockStatus | Find a store by postcode or opt-in location, show stock per store and opening hours. Serves click & collect and "check store stock" on the product page. |
| **PaymentMethods** | Radio, Card, Field | Card fields, wallets and local methods in one list. Keep entered card details after an error [S4 related]. |

### Tier 1: running a multi-market shop

| Component | Builds on | UX rules that matter |
|---|---|---|
| **MarketSwitcher** | Select, Combobox, Dialog | Country, language and currency together, with the current market always visible. |
| **USPBar / AnnouncementBar** | Text, Link | Free-shipping threshold, returns, store pickup. Static, or user-controlled if it rotates. |

### Tier 2

- **RatingSummary + ReviewList** — merchant replies styled differently from reviews (89% don't reply to negative reviews) [S1]; navigate all reviewer photos across reviews in one overlay (63% don't) [S1]. Builds on Lightbox.
- **ShoppableImage / Hotspots** — inspirational images link to every product shown (64% don't) [S5]. High value for a DIY- and inspiration-led brand.
- **CategoryTiles** — subcategories with clear thumbnails (39% don't) [S5].
- **GiftOption** — gifting visible on the product page (78% don't) and designatable in the cart (68% don't) [S1][S3].
- **QuickAdd / QuickView** — add from the list without leaving it. Shopify's Horizon theme ships this as a product-card setting, which suggests it's an expected pattern [S8].
- **ProductRail** — recently viewed and recommendations, built on Carousel.
- **BackInStockNotify** — email capture on out-of-stock variants.
- **FreeShippingProgress** — threshold meter on ProgressBar. Common pattern, but I found no benchmark data for it here.
- **OrderStatusTimeline** — for the account area.

### Tier 3

Product comparison, bundle builder, gift cards, loyalty and points, size guides, AR or room preview.

---

## Part B — Patterns (rules that cut across components)

1. **Money.** Amounts as `{ amount, currency }` in minor units, formatted per locale. One Price component owns all formatting so no consumer reinvents it.
2. **Stock language.** One shared vocabulary for availability states, used by StockStatus, VariantPicker, StorePicker and CartLineItem.
3. **Forms in checkout.** Mark both required and optional fields explicitly (50% don't) [S3]. Explain why a phone number is needed (47% don't) [S3]. Use adaptive error messages that say exactly what's wrong (93% don't on mobile) [S6]. Hide optional inputs behind links instead of showing radios or dropdowns for them [S3]. Field count matters more than step count: most sites need about 8 fields, the 2024 average was 11.3 [S4].
4. **Guest first.** Guest checkout by default and account creation offered on the confirmation page (56% don't) [S3] — tell people at the start that they can create one at the end.
5. **Carousels.** No autorotation on mobile; 5–7 s per slide on desktop for short slides; pause on hover. 31% of sites with carousels get this wrong; static sections often work better [S5].
6. **Filters over categories.** Product types that share attributes go in one list with a filter, not separate categories (79% overcategorise) [S5]. This is a taxonomy rule, but the components should make the right choice the easy one.
7. **Feedback and live regions.** Add-to-cart, filter changes and quantity changes announce results to screen readers.
8. **Empty and zero states.** No search results, empty cart, empty wishlist, out-of-stock variant — each built from EmptyState with a next step.
9. **Loading.** Skeletons shaped like the real card, so SSR and streaming don't cause layout shift.

### Legal rules that shape components

I'm not a lawyer, and these summaries come from law-firm guidance, not the legal texts themselves. The components can make compliance possible, but they can't guarantee it: the shop supplies the data and the wording.

**EU price reductions (Omnibus Directive, Article 6a of the Price Indication Directive)** [S11]
- When a shop announces a price reduction, as a percentage or as "was/now", the prior price shown must be the lowest price applied in the 30 days before the reduction.
- The prior price must be visible from the start of the promotion and throughout it.
- The prior price is set per sales channel, so online and in-store can differ.
- Ordinary price changes without a promotional announcement are not covered.
- Component impact: Price takes a dedicated `priorPrice` prop and never calculates or guesses it. The label, such as "Lowest price in the last 30 days", is passed in by the app, because wording differs by market and language. Price must not show a strikethrough comparison price under a discount label unless a prior price is supplied.
- Not verified here: the exceptions some member states allow, and Denmark's own implementation. Check both against the legal text before C1 ships Price.

**European Accessibility Act** [S12]
- Applies from 28 June 2025 to e-commerce services offered to EU consumers, including providers based outside the EU.
- Covers every step leading to a purchase, not only the checkout, and explicitly covers identification and payment methods.
- Shops must publish an accessibility statement and keep procedures for staying compliant.
- It aligns with WCAG and EN 301 549. My source doesn't name a WCAG level; the system already targets WCAG 2.1 AA, which I believe is what EN 301 549 references, but that needs checking.
- Component impact: none beyond the system's existing accessibility bar, but the bar now has legal weight, so no commerce component ships with a known accessibility gap. Payment and identification UI inside C3 gets the same bar even when it wraps a third-party form.

---

## Part B2 — Engineering requirements for every commerce component

These apply to all waves and count as acceptance criteria next to the UX rules.

1. **State follows the existing dual-mode pattern.** Interaction state (selected filter values, sort order, selected variant, open menus) works the way `Input` and `Select` already do: uncontrolled by default, controllable through a `value`/`onChange` pair, using the existing `useUncontrolledValue` hook rather than a new mechanism. Shop data — cart contents, search results, stock, prices — always comes in through props, and no component fetches, stores or persists it.

   For components whose state belongs in the URL (FilterPanel, AppliedFilters, SortSelect and ProductGrid pagination), the docs and the first story show controlled mode wired to URL state as the main example. Uncontrolled mode stays available, labelled as for prototypes and demos. A real shop that leaves these uncontrolled loses filters on back and refresh, can't share filtered links, and can't have filtered pages indexed.
2. **Filter state has its own shape, not DataTable's.** Commerce filtering shares the pattern with DataTable's layered filtering (`specs/layered-filtering-spec.md`, shipped): dual mode, the `filters`/`onFiltersChange` naming, the same hook. It does not share the data shape. DataTable stores one string per column and filters rows in the browser. A shop needs several values per filter (Baymard's must-have for combining values) [S2], ranges for price, and counts per option from the search backend. So commerce defines its own shape, supporting multiple values and ranges. FilterPanel never filters data itself: it reports changes and shows the counts the app passes in. DataTable's shape is not changed for commerce. If a shared shape later looks right, that's a Proposed decision, not a quiet change.
3. **URL-friendly.** Filters, sort and pagination expose everything the app needs to keep them in the URL, so lists are shareable, back-button safe and crawlable. Pagination renders real links.
4. **Server rendering.** Every component renders on the server with no browser-only APIs during render, uses stable IDs (`useId`), and hydrates without mismatches. Interactive parts degrade to working links or forms where possible.
5. **Search engines.** ProductCard and ProductGrid render crawlable `<a href>` links. Structured product data (schema.org `Product` and `Offer`) is the app's job; the docs show how to add it next to these components.
6. **Translations.** No built-in English text. Every visible or announced string ("Remove all", "Sort by", "was/now", result counts) is a prop with a sensible default, and plurals go through the app.
7. **Performance.** Images lazy-load below the fold and reserve their space, so there's no layout shift. Large grids (48+ cards) stay smooth. Each component gets a bundle-size budget, proposed in its first PR and checked in CI.
8. **Failure states.** Every component that shows remote data has a loading, empty and error state, built from core Skeleton, EmptyState and Alert.

---

## Part B2a — Core prerequisites, built before C1

Two generic pieces that belong in core rather than commerce, because any app with overlays and announcements needs them. Both start as **Proposed** decisions and are built before Price.

### 1. Overlay coordinator (layer stack)

**Problem:** the core overlays use Radix, which already handles click-outside, Escape and focus return within its own layer stack, and ADR 0027 puts all overlays on one shared layer. But an overlay opened by code, not by a click (add-to-cart opening the mini-cart, a shortcut opening the command palette), doesn't close a menu that is already open, because the user never clicked outside it. That's why a hover mega menu can stay open behind the mini-cart.

**Rules it enforces:**
- Opening an overlay closes the other open overlays at the same level.
- An overlay opened inside another (a Select inside a Drawer, a Popover inside a Dialog) keeps its ancestors open.
- Escape closes only the top layer.
- The app can close all overlays in one call, for example on page change.
- Focus returns to whatever opened the closed layer.

**Scope:** every core overlay registers with it: Popover, Menu, ContextMenu, NavigationMenu, HoverCard, Drawer/BaseSheet, Dialog, AlertDialog, CommandPalette, Lightbox, and the dropdowns inside Select, Combobox and DatePicker. Tooltip and Toast don't take part; they are passive and never close anything. Check this list against the registry.

**Constraints:**
- It works with Radix's own layer handling, never against it. Read how Radix's dismissable layers behave before designing it.
- It's server-render safe.
- Existing consumers get the improved behaviour with no code changes. If that turns out to be impossible, it's a breaking change and needs my approval.

### 2. Shared announcer

**Problem:** components announce their own changes through their own live regions. With several on a page (a filter count, add-to-cart, a quantity change), messages can talk over each other or be dropped.

**What it is:** one polite and one assertive live region for the whole app, with a hook such as `useAnnounce()`. It queues messages, doesn't drop repeats of the same message, and clears after each one so a repeated message is announced again. The message text is always passed in, never hardcoded (Part B2, point 6).

**Scope:** all new commerce components use it. Live regions tied to one place, like DataTable's row count, may stay where they are; the decision record says which kinds stay local. Migrating existing core components is a separate follow-up: audit them, list them in a Proposed decision with a migration plan, and don't migrate them as part of C1.

---

## Part B3 — Quality gates

1. **Shared fixture set.** One set of realistic and hostile test data, used by tests and stories across all commerce components: very long Danish, German and English product names; 40+ colour swatches; missing and broken images; zero, "from" and prior prices; DKK (`1.234,50 kr.`), EUR, GBP and SEK; empty filter results; slow and failed loading.
2. **Independent review.** Each PR is reviewed by a fresh agent session that hasn't seen the build, checking it against this spec's UX rules, Part B2 and the DS rules, before I review it.
3. **Usability testing.** Before calling a wave done, run at least five quick tasks with real people on the demo store (for example "find a red vase under 100 kr."). Baymard is strong secondary research; it doesn't replace watching people use our own components.

---

## Part B4 — State across components and pages (guidance for apps and the demo store)

This isn't built by the design system; it's how a shop should wire the components together, and the demo store follows it. Sort state by who owns it and how long it lives, and keep each kind in exactly one place.

| Kind of state | Examples | Where it lives | What it connects |
|---|---|---|---|
| URL | filters, sort, page, selected colour | the address | back, refresh, shared links, search engines |
| Server data | cart, wishlist, stock | one shared cache in the app, updated instantly and rolled back on failure | header count, mini-cart and cart page always agree |
| Remembered choices | market and currency, chosen store, recently viewed | a cookie, so server-rendered pages are right from the first paint | the chosen store drives product-page stock, the "in stock at my store" filter and click & collect |
| Across tabs | cart changed in another tab | refetch on focus, or sync between tabs | no stale cart |
| UI layers | menus, drawers, dialogs | the overlay coordinator | one thing open at a time |
| Navigation | scroll position, focus | the router plus a small helper | back to the same spot in the list [S2], and the page change is announced |
| Announcements | "added to cart", "24 results" | the shared announcer | messages don't talk over each other |

The chosen store matters most for an omnichannel shop: it is what makes the webshop and the physical stores feel like one shop.

---

## Limits of this layer

- **It's the interface, not the shop.** Payments, stock data, search ranking and the backend are outside it. The components still need to show those systems' failures well (Part B2, point 8).
- **It's React.** The tokens and design decisions carry over to any framework, including Vue and Nuxt. The commerce components themselves don't. That's worth saying plainly when this is used as an example for a shop that runs another framework.

---

## Part C — Page templates

I'd ship these as demo pages on the docs site for a fictional store brand, not as package exports. Pages carry too much business logic to be reusable as-is, and a fictional brand avoids looking like a copy of a real retailer.

### Tier 1

- **Home** — category entry points first, campaigns as static sections rather than a rotating hero [S5].
- **Category landing** — subcategories with thumbnails as the main content, above promotions (38% put promotions first) [S5].
- **Product list and search results** — FilterPanel, AppliedFilters, SortSelect, ProductGrid.
- **Product page** — gallery, price, variants, stock, add to cart, delivery estimate, returns, reviews.
- **Cart** — full page plus the mini-cart drawer.
- **Checkout** — guest, single flow with collapsing step summaries.
- **Order confirmation** — summary, delivery date, and the optional account creation.
- **Not found and no results** — with search and category links.
- **Accessibility statement** — required for EU e-commerce under the EAA [S12].

### Tier 2

- **Account** — orders, addresses, saved items.
- **Store locator and store page** — hours, stock, directions.
- **Inspiration / DIY article** — shoppable images and a "products used" list.
- **Campaign / seasonal landing** — for monthly and seasonal drops.
- **Customer service** — FAQ, returns, delivery.

### Tier 3

Gift cards, newsletter landing, comparison.

---

## Part D — Tokens

Likely new semantic roles, kept small and passed through the existing contrast tests across all five brands in light and dark:

- `color-price-sale`, `color-price-default`
- `color-stock-in`, `color-stock-low`, `color-stock-out`
- badge variants for novelty and sale, only if existing Badge variants can't carry them

---

## Proposed build order

Same credibility-first logic as the core waves: the most-used flow first.

1. **C1 — Find:** Price, ProductCard, Swatch, ProductBadge, StockStatus, FilterPanel, AppliedFilters, SortSelect, ProductGrid, SearchAutocomplete, MegaMenu, MobileCategoryNav
2. **C2 — Decide:** ProductGallery, VariantPicker, QuantityStepper, AddToCart + MiniCart, SaveButton, DeliveryEstimate, ReturnsSnippet
3. **C3 — Buy:** CartLineItem, OrderSummary, PromoCodeField, CheckoutSteps, AddressForm, DeliveryOptions, StorePicker, PaymentMethods
4. **C4 — Markets and pages:** MarketSwitcher, USPBar, Tier 1 page templates on the docs site
5. **C5 — Tier 2**

That is 29 Tier 1 components and 9 Tier 1 page templates.

Before C1: platform P0 from `specs/platform-readiness.md` (public API, compiled build and exports map, which the commerce subpath export needs), then the two core prerequisites in Part B2a.

Each wave starts with one pattern-setting component that I review before the rest are built (Price in C1, reviewed together with the core prerequisites). Each wave ends with the usability check in Part B3.

---

## Decided

- **Packaging (2026-11-04):** subpath export, `@amezquita/design-system/commerce`. One version, one token set, one release pipeline. Rejected: a separate `@amezquita/commerce` package. It would need its own releases and version matching against core, with no second team to justify that. Revisit if a team ever owns commerce on its own schedule.
- **Data contract (2026-11-04):** plain props with no platform types — no Shopify, commercetools or other backend objects in any component's props. Money is `{ amount, currency }` in minor units. Mapping backend data to props is the consuming app's job. This keeps the layer usable with any headless backend and any framework choice. Rejected: shipping adapters for specific platforms inside the package; they would tie releases to those platforms' API changes.
- **Templates (2026-11-04):** page templates are demo pages on the docs site only, not package exports. Pages carry shop-specific logic (data fetching, routing, business rules) that doesn't reuse as-is; the components are the reusable part. Rejected: exporting templates from the package.

- **Demo brand (2026-11-04):** the demo store reuses demo-warm. No extra brand to design or contrast-check, and its bold, warm look suits retail. The store gets a fictional name, never a real retailer's name or branding. Rejected: a sixth demo brand made just for the store.

## Open decisions

None. C1 is ready to start once the legal points under Price are checked.

---

## Sources

- [S1] Baymard — Product Page UX 2026: 10 Pitfalls and Best Practices — https://baymard.com/research-articles/current-state-ecommerce-product-page-ux
- [S2] Baymard — Product List UX 2025: 8 Common Pitfalls & Best Practices — https://baymard.com/research-articles/current-state-product-list-and-filtering
- [S3] Baymard — Checkout UX 2026: 10 Pitfalls and Best Practices — https://baymard.com/research-articles/current-state-of-checkout-ux
- [S4] Baymard — Checkout Optimization: 5 Ways to Minimize Form Fields — https://baymard.com/research-articles/checkout-flow-average-form-fields
- [S5] Baymard — Homepage and Category Navigation UX 2026 — https://baymard.com/research-articles/ecommerce-navigation-best-practice
- [S6] Baymard — Mobile UX Trends 2026: 10 Best Practices — https://baymard.com/research-articles/mobile-ux-ecommerce
- [S7] Baymard — Cart & Checkout Usability Research (70.19% average cart abandonment) — https://baymard.com/research/checkout-usability
- [S8] Shopify Horizon theme docs — product card settings (quick add) — https://www.mintlify.com/Shopify/horizon/customization/settings
- [S9] Søstrene Grene Ireland webshop launch — https://www.shemazing.net/?p=428370
- [S10] Søstrene Grene UK webshop launch — https://www.a1retailmagazine.com/?p=46171
- [S11] RPC — European Commission guidance on price promotions under the Omnibus Directive — https://rpclegal.com/snapshots/consumer/spring-2022/european-commission-publishes-guidance-on-price-promotions-under-the-omnibus-directive
- [S12] Bird & Bird — A guide to navigating the European Accessibility Act for online retailers — https://www.twobirds.com/en/insights/2025/a-guide-to-navigating-the-european-accessibility-act-for-online-retailers-service-providers-and-plat
- Legal text: Directive 98/6/EC, consolidated 2022-05-28 — https://eur-lex.europa.eu/eli/dir/1998/6/2022-05-28/eng
