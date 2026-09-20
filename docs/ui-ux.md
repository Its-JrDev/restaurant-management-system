# UI / UX Design Decisions

As the **Frontend Developer and UI/UX Designer** for this project, I focused on creating an interface that is highly intuitive for restaurant staff working in fast-paced environments.

## 1. Role-Based Interfaces
Restaurants have distinct roles with vastly different needs. The UI completely morphs based on the logged-in role:
- **Waiter:** Needs large touch targets for POS ordering and a persistent cart.
- **Chef:** Needs a Kanban-style board to track ticket times and drag-and-drop orders.
- **Cashier:** Needs split-billing capabilities and clear numerical totals.
- **Admin:** Needs high-level analytical charts and dense data tables.

*For the demo, a floating **Role Switcher** is included in the top navigation bar to seamlessly hot-swap between these roles and explore the UX of each.*

## 2. Responsive Design (Mobile First)
Staff often use tablets or phones on the floor. The app utilizes Tailwind CSS utility classes to achieve a fully fluid responsive layout.

**Key Mobile Adaptations:**
- **POS Cart Bottom Sheet:** On desktop, the cart is a persistent right-hand sidebar. On mobile, it intelligently collapses into a floating bottom bar that swipes up into a full-screen sheet to save screen real estate.
- **Kitchen Tabs:** The 3-column Kanban board for the Kitchen works great on large screens, but on mobile, it gracefully degrades into a swipeable horizontal tab view (`Nuevos` / `Preparando` / `Listos`).
- **Overflow Tables:** Dense data tables are wrapped in horizontal scroll containers to prevent layout breakage on narrow devices.

## 3. Theming & Accessibility
- **Dark Mode / Light Mode:** The application fully supports theme switching. I implemented a CSS custom property approach where the theme toggle simply swaps the `data-theme` attribute on the `<html>` tag. Smooth CSS transitions (`transition-colors duration-300`) ensure the switch is seamless and pleasant to the eyes.
- **Feedback System:** A custom Toast notification system (`ToastManager.js`) provides immediate, non-blocking feedback for destructive or successful actions (e.g., "Order sent to kitchen").

## 4. Visual Identity
The demo embraces a vibrant, modern Caribbean theme to give it character, utilizing a carefully selected color palette integrated directly into the `tailwind.config` equivalent structure. Lucide icons are used consistently for high legibility across all screen sizes.
