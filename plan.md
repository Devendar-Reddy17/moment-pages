# MomentPages — MVP Completion Plan

## Status: Complete (except E2E tests)

---

## Phase 1: Fabric.js Canvas Editor

- [x] **1. Install Fabric.js + create FabricCanvas wrapper**
  - `npm install fabric`
  - Create `src/components/editor/FabricCanvas.tsx`
  - Initialize canvas with default size (1080×1920)
  - Support: selection, move, resize, rotate handles
  - Render within the editor center panel with responsive scaling

- [x] **2. Sync Fabric.js ↔ Zustand editorStore**
  - On fabric object change → update editorStore element
  - On editorStore element change → update fabric object
  - Selection events → set selectedElementId in store
  - Deselection → clear selectedElementId
  - Use custom properties on fabric objects to store element IDs

- [x] **3. Element addition (LeftPanel → Canvas)**
  - Text: add fabric.IText with default styling
  - Shape: add fabric.Rect / fabric.Circle / fabric.Triangle
  - Image: file picker → upload → add fabric.Image
  - Form elements: add fabric.Group with placeholder visual + metadata
  - Each addition creates element in store + fabric object on canvas

- [x] **4. RightPanel property editor ↔ Canvas (two-way binding)**
  - Position (x, y) — input fields update object coords
  - Size (width, height) — input fields update object scale
  - Rotation — slider/input updates object angle
  - Opacity — slider updates object opacity
  - Font family, size, weight, color — for text elements
  - Fill/stroke color — for shapes
  - Layer order (bring forward, send back)

- [x] **5. Undo/redo with Fabric.js**
  - On each meaningful change: serialize canvas to JSON, push to history
  - Undo: pop from history, deserialize to canvas
  - Redo: push to redo stack on undo, pop on redo
  - Debounce rapid changes (group drag events)
  - Max 50 history states (already configured in store)

- [x] **6. Zoom, pan, grid, snap-to-grid**
  - Zoom: scroll wheel + toolbar buttons (50%–200%)
  - Pan: hold space + drag, or middle mouse button
  - Grid: toggle SVG/canvas overlay (configurable spacing)
  - Snap: snap object edges/centers to grid lines when within threshold

---

## Phase 2: UI Foundation

- [x] **7. Install shadcn/ui components**
  - Components needed: button, input, select, card, dialog, tabs, sheet, label, textarea, switch, slider, badge, separator, dropdown-menu, popover, toast
  - Run `npx shadcn@latest add <component>` for each

- [x] **8. Refactor pages/components to use shadcn/ui**
  - Marketing landing page (buttons, cards)
  - Create page (cards, select)
  - Editor Toolbar (buttons, dropdown-menu, popover)
  - Editor LeftPanel (buttons, tabs, sheet)
  - Editor RightPanel (input, slider, select, label)
  - Management dashboard (tabs, card, badge, button)
  - Public page (input, button for password gate)

---

## Phase 3: Functional Gaps

- [x] **9. VideoElement.tsx (public page renderer)**
  - `<video>` tag with controls, poster, and responsive sizing
  - Support autoplay (muted), loop options from element properties

- [x] **10. Stripe checkout redirect (publish flow)**
  - Editor publish button → call `POST /api/v1/projects/{id}/checkout`
  - Receive `stripeCheckoutUrl` → `window.location.href = url`
  - Handle `?payment=success` and `?payment=cancelled` query params
  - Show success toast + management link on return

- [x] **11. Bucket4j rate limiting (backend)**
  - Create `RateLimitFilter` (servlet filter or Spring interceptor)
  - Public endpoints (`/api/v1/public/**`): 60 requests/minute per IP
  - Management endpoints (`/api/v1/projects/**`): 120 requests/minute per token
  - AI endpoints (`/api/v1/ai/**`): 10 requests/minute per token
  - Return 429 with `Retry-After` header on limit exceeded

- [x] **12. Media upload UI in editor**
  - Drag-and-drop zone in LeftPanel media tab
  - File picker button as alternative
  - Show upload progress indicator
  - On complete: place image/video/audio element on canvas at center
  - Validate file type and size before upload (use existing hook)

- [x] **13. Audio recording UI**
  - Record button in LeftPanel audio section
  - Show recording indicator with duration timer
  - Pause/resume support
  - On stop: upload blob → place audio element on canvas
  - Waveform visualization during recording (optional stretch)

- [x] **14. AI text generation UI**
  - "Generate with AI" button in LeftPanel → opens dialog/modal
  - Form: tone selector, recipient name, additional context
  - Call `POST /api/v1/ai/generate-text`
  - Display 2 suggestions with title/body/CTA preview
  - "Use this" button inserts text element(s) on canvas

---

## Phase 4: Polish

- [x] **15. OG meta + share preview**
  - Generate dynamic OG image using `next/og` (ImageResponse)
  - Route: `/api/og?slug={slug}` → renders title + event type styled card
  - Set `<meta property="og:image">` in public page head
  - Include Twitter card meta tags

- [ ] **16. End-to-end test (Playwright — skipped for now)**
  - Create project → get management token + editor URL
  - Add elements in editor → verify auto-save
  - Publish → Stripe checkout → verify public slug generated
  - Visit public page → verify elements render
  - Submit form response → verify in management dashboard
  - View analytics → verify counts
  - Archive → verify page shows archived message

---

## Dependency Order

```
Phase 1 (Fabric.js) → Phase 2 (shadcn/ui) → Phase 3 (gaps) → Phase 4 (polish)
                                                    ↑
                                              Can parallelize:
                                              9, 10, 11 are independent
                                              12, 13, 14 depend on Phase 1
```

## Notes

- Fabric.js (Phase 1) is the largest piece of work — roughly 60% of remaining effort
- Phase 2 (shadcn/ui) can partially overlap with Phase 1 since they touch different files
- Phase 3 items 12–14 depend on the Fabric canvas being functional
- Phase 3 items 9–11 can be done independently at any time
- Rate limiting (11) is backend-only, no frontend dependency
