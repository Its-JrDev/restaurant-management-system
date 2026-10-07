# Portfolio Demo Documentation Index

Welcome to the documentation for the **Frontend-only Demo** of the Restaurant Management System. This documentation is tailored specifically to explain the architecture, state management, and design decisions of this portfolio version.

## Documentation Map

| Document | What it covers |
|---|---|
| [architecture.md](architecture.md) | High-level overview of the SPA, routing, and data layer |
| [state-management.md](state-management.md) | Explanation of the Pub/Sub store and LocalStorage DB wrapper |
| [ui-ux.md](ui-ux.md) | Overview of responsive logic, theming, and role-based UX |
| [ui/design-system/README.md](ui/design-system/README.md) | Design tokens, color palettes, and typography |
| [ui/feedback-system/README.md](ui/feedback-system/README.md) | Toast, skeleton, and spinner primitives |

## Background

This project was originally built as a full-stack application (Python/FastAPI backend, PostgreSQL database) in a collaborative environment where my role was **Frontend Developer & UI/UX Designer**. 

To make the project easily accessible for my portfolio without requiring reviewers to set up Docker containers or backend environments, I created this standalone demo branch. The entire Python backend has been stripped out, and the data layer has been rewritten to run entirely within the browser's `LocalStorage`.
