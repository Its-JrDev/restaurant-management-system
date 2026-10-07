# Restaurant Management System (Portfolio Demo)

A staff-centered web platform for small and medium restaurants: reservations, table management, ordering, kitchen workflow, payments, inventory, reporting, and system settings.

> **Note:** This project is a **Frontend-only Demo** designed for my portfolio. It is a standalone, backend-less version of a [Collaborative Full-Stack Project](https://github.com/Riwi-Projects-Cohort-5) that I built alongside my teammates. 
> 
> **My Role in the Original Project:** Frontend Developer & UI/UX Designer
>
> In this demo branch, the Python/PostgreSQL backend has been completely removed. The app now runs entirely in the browser using a LocalStorage mock database to showcase the UI, UX, and frontend architecture without requiring complex environment setups.

## Features

- **No Backend Required:** Runs 100% offline using an in-memory/LocalStorage database wrapper.
- **Rich Seed Data:** Pre-populated with a Caribbean-themed menu, users, tables, and active orders.
- **Role-Based Workflows:** Easily switch between `Admin`, `Waiter`, `Chef`, and `Cashier` using the built-in demo Role Switcher in the top bar.
- **Responsive UI:** Fully optimized for mobile, tablet, and desktop views (e.g., bottom-sheet carts, responsive kitchen tabs).
- **Dark Mode Support:** Smooth CSS-driven theme transitions.
- **Zero-Config Deployment:** Ready to be deployed as a static site (Vercel, GitHub Pages, Netlify).

## Tech Stack

| Area | Choice |
|---|---|
| Frontend | Vanilla JS + Vite 8 + Tailwind CSS v4 + Lucide Icons + Chart.js |
| Data Layer | Custom LocalStorage DB wrapper (`src/store/data/db.js`) |
| Routing | Custom Hash-based Router SPA |

## Quick Start (Local Demo)

1. Clone the repository.

2. Install dependencies (requires `pnpm`):
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser at `http://localhost:3000`.

## Initialization & Role Demo Flow

When you first load the application, the `db.js` layer will automatically intercept and initialize the local storage with rich mock data (`src/store/data/initialData.js`). 

1. **Login:** You can bypass actual authentication by selecting a role from the **Demo Role Switcher** located in the top navigation bar.
2. **Waiter Flow:** View tables, create new POS orders, and send them to the kitchen. On mobile, the cart appears as a floating bottom sheet.
3. **Chef Flow:** Navigate to the Kitchen view to see incoming orders. Drag and drop tickets between "Nuevos", "Preparando", and "Listos" tabs.
4. **Cashier Flow:** Go to Payments to settle table bills and print receipts.
5. **Admin Flow:** View the Dashboard for sales analytics, and manage the Inventory or Menu.

## Project Layout

```text
restaurant-management-system/
├── public/           # Assets, favicon, and PWA manifest
├── src/
│   ├── components/   # Reusable UI components
│   ├── store/        # Local state management & DB wrapper
│   ├── styles/       # Tailwind CSS entry points
│   ├── utils/        # Theme & auth utilities
│   └── views/        # Main route views (Dashboard, Kitchen, POS, etc.)
├── index.html        # Entry point
└── README.md
```

## Documentation

For historical reference on the original full-stack architecture, refer to the `docs/` directory. Note that the backend API references have been deprecated for this demo branch to keep the repository lightweight and focused on the frontend portfolio demo.

## License

See [LICENSE](LICENSE) for the project license terms.
