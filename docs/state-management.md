# State Management & Data Layer

Since this SPA is built without frameworks like Redux or Vuex, it utilizes a custom **Pub/Sub (Publish-Subscribe)** pattern combined with a local database wrapper to manage state across views.

## 1. The Pub/Sub Store (`src/store/index.js`)

At the core of the state management is a simple event emitter.

- **`subscribe(event, callback)`**: Components can listen for specific state changes (e.g., `cartUpdated`).
- **`emit(event, data)`**: Stores broadcast changes after a successful update.

This decouples the views from the data logic. For example, when the `PosView` adds an item to the cart, it calls a method in `posData.js`. The store updates the database and emits `cartUpdated`. The `CartPanel` component, which is subscribed to that event, automatically re-renders.

## 2. LocalStorage Database Wrapper (`src/store/data/db.js`)

To simulate a real backend environment, I built a LocalStorage engine that acts like a NoSQL database.

### Core Capabilities:
- **`getCollection(name)`**: Retrieves an entire table (e.g., users, products).
- **`insertItem(collection, item)`**: Auto-generates IDs and timestamps.
- **`updateItem(collection, id, updates)`**: Merges partial updates with existing records.
- **`deleteItem(collection, id)`**: Removes a record.

### Seed Data
If the user opens the demo for the first time, `db.js` pulls from `initialData.js`. This file contains hundreds of lines of hyper-realistic mock data, including:
- Complex nested menu categories (Appetizers, Mains, Drinks).
- Pre-existing table reservations.
- Active orders sitting in the Kitchen queue.

## 3. Domain Stores

The business logic is split into domain-specific stores (`auth.js`, `menu.js`, `posData.js`, `kitchen.js`).
These stores abstract the `db.js` operations so the UI only has to call clean, semantic functions like `addCartItem(product)` or `updateOrderStatus(orderId, 'ready')`.
