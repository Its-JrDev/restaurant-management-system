# Architecture Overview

This project is a **Single Page Application (SPA)** built with Vanilla JavaScript. It intentionally avoids heavy frontend frameworks (like React or Vue) to demonstrate strong fundamentals in DOM manipulation, state management, and event-driven architecture.

## Tech Stack

- **JavaScript:** ES6+ Vanilla JS (No frameworks)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide Icons
- **Charts:** Chart.js
- **Build Tool:** Vite 8

## Core Concepts

### 1. Hash-Based Routing
The application uses a custom lightweight router (`src/main.js`) based on the `window.location.hash`. 
- When the hash changes (e.g., `#dashboard` to `#kitchen`), the router dynamically unmounts the previous view and mounts the requested view.
- Views are modular. Each view exports a `render()` function that returns an HTML string, and an `init()` function that attaches event listeners once the HTML is injected into the DOM.

### 2. Mock Data Layer (Backend-less)
Because this is a portfolio demo, the real backend API was replaced with a **LocalStorage Wrapper** (`src/store/data/db.js`).
- On initial load, if the database is empty, it intercepts and seeds the application with rich Caribbean-themed data (`src/store/data/initialData.js`).
- All `fetch` calls to the API were replaced with direct synchronous calls to the `db.js` CRUD methods.

### 3. Component Structure
Although this is Vanilla JS, the UI is broken down into reusable components (found in `src/components/`). 
Functions return template literal HTML strings which are then safely injected and hydrated with event listeners. This mimics a component-based architecture without the overhead of a Virtual DOM.
