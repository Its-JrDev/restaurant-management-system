# Skeleton Loading System

## Architecture

| Layer | File | Role |
|-------|------|------|
| Primitive | `components/ui/Skeleton.js` | `Skeleton(opts)` — single placeholder element |
| Orchestrator | `utils/withLoading.js` | `withLoading()`, `renderWithSkeleton()`, all `Skeletons.*` builders |

Skeletons use Tailwind `animate-pulse` (opacity pulse) on `bg-brand-200` (`#f8d7ae`).

## Skeleton Primitive

```js
Skeleton({ variant, width, height, size, lines, class })
```

| Variant | Output | Key props |
|---------|--------|-----------|
| `"text"` (default) | `<div class="h-4 rounded bg-brand-200 animate-pulse">` | `width`, `lines` (multi-line wraps in `flex flex-col gap-2`, last line 60%) |
| `"circle"` | `<div class="rounded-full bg-brand-200 animate-pulse">` | `size` (default 40px) |
| `"rect"` | `<div class="rounded-lg bg-brand-200 animate-pulse">` | `width`, `height` |

All output `aria-hidden="true"`.

**Note:** `rect` variant hardcodes `rounded-lg`. For pill-shaped elements (category tabs, badges), use raw HTML instead of `Skeleton({ variant: "rect" })`.

## withLoading() — Page-Level Skeletons

```js
withLoading(view, skeletonHtml, delay)
```

Wraps a view object `{ render, init, destroy }`. On `render(el)`:
1. Sets `el.innerHTML = skeletonHtml` immediately
2. After `delay` ms, calls original `render(el)` + `createIcons()` + `init()`
3. `destroy()` clears the timer + calls original `destroy()`

**Standard export pattern:**
```js
export default withLoading(MyView, Skeletons.mySkeleton(), delay);
```

## renderWithSkeleton() — Sub-View Skeletons

```js
renderWithSkeleton(el, skeletonHtml, renderFn, delay)
```

For navigation within an already-loaded view (clicking "New Order", "View Detail", etc.):
1. Sets `el.innerHTML = skeletonHtml` immediately
2. After `delay` ms, calls `renderFn()` + `createIcons()`

No lifecycle management — the router replaces the container on next navigation.

## Delay Values

| Context | Delay | Rationale |
|---------|-------|-----------|
| List views (withLoading) | 600–1000ms | Matches perceived data fetch time |
| Sub-views (renderWithSkeleton) | 400ms | Quick transition, no network call |

**Per-view delays:**

| View | Delay |
|------|-------|
| Dashboard | 1000ms |
| Reports | 1000ms |
| Settings | 600ms |
| All others (menu, inventory, orders, payments, reservations, tables, kitchen) | 800ms |
| All sub-views | 400ms |

## Tier 1 Helpers (Atomic Building Blocks)

Defined in `withLoading.js`, not exported:

| Helper | Signature | Output |
|--------|-----------|--------|
| `_pill(w)` | `(width)` | `rounded-full` rect — for tab/pill buttons |
| `_searchBar()` | `()` | Search icon circle + text bar in bordered container |
| `_badge(w)` | `(width)` | Small `rounded-full` rect — for count badges |
| `_btn(w)` | `(width)` | `rounded-lg` rect — for buttons |
| `_inputField(labelW)` | `(labelWidth)` | Label text + input rect stacked |

## Tier 2 Helpers (Mid-Level Composites)

| Helper | Signature | Output |
|--------|-----------|--------|
| `_pageHeader(opts)` | `({ titleW, badgeW, rightBtns })` | Back button + title + optional badge/right buttons |
| `_sectionCard(titleW, body, opts)` | `(titleWidth, bodyHtml, { headerRight })` | White card with `bg-brand-50` header bar + content |
| `_infoCardGrid(items, cols)` | `(cardCount, columns)` | Grid of centered stat/info cards |
| `_dataTable(opts)` | `({ columns, rows, thead })` | Full table with `table-fixed`, zebra rows, typed columns |
| `_actionBar(opts)` | `({ left, right, footer })` | Button row with optional footer styling |
| `_tabRow(widths)` | `(widthArray)` | Row of `rounded-full` pill buttons |
| `_keyValueRow(labelW, valueW)` | `(labelWidth, valueWidth)` | Single key-value row |

**`_dataTable` column types:**

| Type | Output |
|------|--------|
| `"text"` | `Skeleton({ variant: "text", width })` |
| `"badge"` | `Skeleton({ variant: "rect", width: 56, height: 24, class: "rounded-full" })` |
| `"actions"` | Two small rect buttons |
| `"progress"` | Container with inner `bg-brand-300` bar |
| `"circle-text"` | Circle + text side by side |

## All Skeleton Builders (17 total)

### Top-Level View Skeletons

| Builder | View | What it renders |
|---------|------|-----------------|
| `Skeletons.dashboard()` | Dashboard | Welcome banner, page header, 4 stat cards, chart + status cards, recent orders table (7 cols, 5 rows) |
| `Skeletons.menuCards(count)` | Menu | Header + Add Product, filter row (search + 2 selects + clear), auto-fill card grid |
| `Skeletons.inventoryTable()` | Inventory | Header + badge + Add Item, 4 tabs, search bar, full table (7 cols) |
| `Skeletons.ordersTable()` | Orders/POS | Header + New Order, 3 tabs, table (8 cols, 6 rows) |
| `Skeletons.paymentsTable()` | Payments | Header + 2 buttons, 5 tabs, search + date filter, table (9 cols) |
| `Skeletons.reservationsTable()` | Reservations | Header, 5 tab pills, search + date filter, table (8 cols) |
| `Skeletons.reports()` | Reports | Header, date range section card, 3 stat cards, chart area (240px), top products table |
| `Skeletons.tables()` | Tables | Header, 4 tabs, legend dots, area section with 6 table cards |
| `Skeletons.kitchen()` | Kitchen | Title + urgent legend, 3-column kanban (New/Preparing/Ready), each with 3 cards |
| `Skeletons.settings()` | Settings | Header, profile section (2 inputs + 2-col grid), tax/currency (3-col grid), action bar |

### Sub-View Skeletons

| Builder | View | What it renders |
|---------|------|-----------------|
| `Skeletons.menuDetail()` | Menu detail | Header, card (image + name + badge + description + 2-col grid), action bar |
| `Skeletons.menuForm()` | Menu create/edit | Header, section card (5 inputs + checkbox), action bar |
| `Skeletons.inventoryDetail()` | Inventory detail | Header, 4 info cards, stock bar, action bar, movements table |
| `Skeletons.inventoryForm()` | Inventory create/edit | Header, section card (name + unit + 2-col grid + checkbox), action bar |
| `Skeletons.orderDetail()` | Order detail | Header, 3x2 info grid, 5-step stepper, items table, notes, action bar |
| `Skeletons.newOrder()` | New order (POS) | Back + title, 2-col: left (8 category pills + 8-item grid), right (cart: header + items + totals + 2 buttons) |
| `Skeletons.paymentDetail()` | Payment detail | Header, 4x2 info grid, items table, action bar |
| `Skeletons.newPayment()` | New payment | Header, section card (4 inputs), action bar |
| `Skeletons.paymentConfig()` | Payment config | Header, section card (4 toggle rows) |
| `Skeletons.reservationDetail()` | Reservation detail | Header + badge + 2 buttons, 4-col info grid, details section card |
| `Skeletons.newReservation()` | New reservation | Header, section card (2-col form: 6 inputs + textarea), footer action bar |
| `Skeletons.tablesDetail()` | Table detail | Back + name + status badge, 3 `bg-brand-50` info cards (centered), neutral center block |
| `Skeletons.tablesManageAreas()` | Manage areas | Header, 2-col: left (2 expandable area cards), right (2 sidebar cards) |

## Integration Pattern

Every view with sub-views follows the same state management:

```js
let subView = "list";
let selectedId = null;

function render(el) {
  if (subView === "detail" && selectedId) {
    renderWithSkeleton(el, Skeletons.xxxDetail(), () => renderDetail(el, selectedId), 400);
  } else if (subView === "create") {
    renderWithSkeleton(el, Skeletons.xxxForm(), () => renderForm(el, null), 400);
  } else {
    renderList(el);  // No skeleton for list re-renders
  }
}
```

**Navigation handlers** call `renderWithSkeleton` for detail/form transitions. **Mutations** (save/rename/delete) call `render*()` directly — no skeleton for action feedback.
