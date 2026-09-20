/**
 * Login View Component
 * Route: /login
 *
 * Renders the authentication page with:
 * - Brand panel (sun scene SVG)
 * - Login form with email/password
 * - Responsive layout (mobile/tablet/desktop)
 *
 * Router Integration:
 *   // In your router configuration:
 *   import { LoginView } from './views/auth/Login.js';
 *
 *   const routes = {
 *     '/login': LoginView,
 *     // ... other routes
 *   };
 *
 *   // Router mounts view to #app container:
 *   function navigate(path) {
 *     const view = routes[path];
 *     if (view) {
 *       document.getElementById('app').innerHTML = view.render();
 *       view.init();
 *     }
 *   }
 */

import { createIcons, Eye, EyeOff, Sun, Moon } from "lucide";
import * as authStore from "../../store/auth.js";
import { getHomeRoute } from "../../utils/routeGuard.js";
import { toast } from "../../components/ui/ToastManager.js";
import { getLogoPath, getScenePath, toggleTheme, isDark } from "../../utils/theme.js";
import "../../components/forms/InputField.js";
import "../../components/forms/CheckboxField.js";
import "../../components/forms/SubmitButton.js";
import "../../components/forms/PasswordToggle.js";

export function render(container) {
  container.innerHTML = `
    <div class="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-brand-100" id="loginPage">

      <button id="themeToggleBtn" type="button"
              class="absolute top-4 right-4 z-50
                     w-10 h-10 rounded-full
                     border border-brand-300 bg-white/80 backdrop-blur-sm
                     text-brand-600 hover:bg-brand-100 hover:border-brand-400 hover:text-brand-700
                     flex items-center justify-center
                     transition-colors duration-200
                     cursor-pointer"
              aria-label="Cambiar tema">
        <i data-lucide="${isDark() ? "sun" : "moon"}" class="w-[18px] h-[18px]"></i>
      </button>

      <div class="grid w-full min-h-full lg:h-full
                  lg:grid-cols-[2fr_1fr]">

      <!-- ═══════════════════════════════════════════
           BRAND PANEL — Scene SVG (Sun/Moon)
           ═══════════════════════════════════════════ -->
      <aside class="relative overflow-hidden
                    max-lg:absolute max-lg:inset-0 max-lg:z-0
                    max-md:hidden" aria-hidden="true">
        <img src="${getScenePath()}" alt="" class="absolute inset-0 w-full h-full object-cover object-bottom" draggable="false">
        <img src="${getLogoPath("logo-02")}" alt="El Fogón" class="absolute z-10 top-60 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-[798px] object-contain max-lg:hidden" draggable="false">
      </aside>

      <!-- ═══════════════════════════════════════════
           FORM PANEL
           ═══════════════════════════════════════════ -->
      <main class="flex flex-col items-center justify-start lg:justify-center z-10
                  bg-brand-100 min-h-full w-full
                  p-4 sm:p-6 md:p-8 lg:p-12
                  md:max-lg:bg-transparent">

        <div class="my-auto flex flex-col items-center w-full max-w-[380px] md:max-lg:max-w-[440px] py-4 sm:py-6">

          <!-- Tablet: dual logos -->
          <div class="hidden md:max-lg:flex items-center gap-4 mb-6">
            <img src="${getLogoPath("logo-01")}" alt="El Fogón" class="h-auto w-[130px] object-contain" draggable="false">
            <img src="${getLogoPath("logo-03")}" alt="El Fogón" class="h-auto w-[240px] object-contain" draggable="false">
          </div>

          <form class="login-form flex flex-col gap-5 sm:gap-6 w-full
                       md:max-lg:bg-brand-100/95 md:max-lg:backdrop-blur-md md:max-lg:rounded-xl md:max-lg:p-8 md:max-lg:shadow-xl" id="loginForm" novalidate>

            <!-- Header -->
            <header class="flex flex-col items-center gap-3 text-center">
              <img class="logo h-20 sm:h-24 lg:h-28 w-auto pb-1 object-contain hidden lg:block"
                   src="${getLogoPath("logo-01")}" alt="El Fogón" draggable="false">
              <img class="logo h-20 sm:h-24 w-auto pb-1 object-contain md:hidden"
                   src="${getLogoPath("logo-00")}" alt="El Fogón" draggable="false">
              <div class="flex flex-col gap-1.5">
                <h1 class="text-xl sm:text-2xl font-semibold leading-snug text-neutral-900">Good to see you again</h1>
                <p class="text-xs sm:text-sm font-normal leading-normal text-neutral-600">Sign in to manage tables, orders, and reservations.</p>
              </div>
            </header>

            <!-- Body -->
            <div id="login-error" class="hidden rounded-md bg-error-50 border border-error-200 p-3">
              <p class="text-sm text-error-700"></p>
            </div>
            <div class="flex flex-col gap-4 sm:gap-5" id="formBody"></div>

            <!-- Footer -->
            <div class="flex flex-col gap-4 sm:gap-5">
              <div class="flex items-center justify-between gap-3 flex-wrap text-xs sm:text-sm">
                <div id="checkboxContainer"></div>
                <a href="#" class="text-label font-medium text-primary-600 no-underline whitespace-nowrap
                                   hover:text-primary-700 hover:underline">Forgot your password?</a>
              </div>
              <div id="submitContainer"></div>
            </div>

            <!-- Bottom CTA -->
            <footer class="flex items-center justify-center gap-1 text-xs sm:text-sm font-normal text-neutral-600 pt-1">
              <span>Don't have an account?</span>
              <a href="#" class="font-semibold text-primary-600 no-underline hover:text-primary-700 hover:underline">Contact Us</a>
            </footer>

          </form>

          <!-- 1-Click Demo Logins -->
          <div class="mt-6 w-full">
            <p class="text-xs font-semibold text-neutral-500 text-center uppercase tracking-wider hidden md:block mb-2.5">Demo Accounts</p>
            <button type="button" id="demoAccountsToggleBtn" class="w-full md:hidden flex items-center justify-center gap-2 p-3 rounded-lg border border-brand-300 bg-white text-sm font-semibold text-brand-600 cursor-pointer hover:bg-brand-50 shadow-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Show Demo Accounts</span>
            </button>

            <!-- Bottom sheet on mobile / Normal grid on desktop -->
            <div id="demoAccountsContainer" class="max-md:fixed max-md:inset-0 max-md:bg-black/50 max-md:z-[100] max-md:hidden max-md:items-end transition-opacity md:block">
              <div class="max-md:bg-brand-50 max-md:w-full max-md:p-6 max-md:rounded-t-3xl max-md:shadow-[0_-8px_30px_rgba(0,0,0,0.12)] max-md:transform max-md:transition-transform max-md:translate-y-full" id="demoAccountsSheet">
                <div class="flex items-center justify-between md:hidden mb-4">
                  <h3 class="text-base font-bold text-neutral-900">Demo Accounts</h3>
                  <button type="button" id="demoAccountsCloseBtn" class="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-brand-200 rounded-full bg-brand-100">✕</button>
                </div>
                <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button type="button" class="demo-login-btn flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border border-brand-300 bg-white hover:bg-brand-50 hover:border-brand-400 transition-colors" data-email="admin@elfogon.com">
                    <span class="text-xs sm:text-sm font-semibold text-neutral-900">Admin</span>
                    <span class="text-[10px] sm:text-[11px] text-neutral-500">admin@elfogon.com</span>
                    <span class="text-[10px] sm:text-[11px] font-mono text-brand-600 mt-0.5">pwd: password123</span>
                  </button>
                  <button type="button" class="demo-login-btn flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border border-brand-300 bg-white hover:bg-brand-50 hover:border-brand-400 transition-colors" data-email="chef1@elfogon.com">
                    <span class="text-xs sm:text-sm font-semibold text-neutral-900">Chef</span>
                    <span class="text-[10px] sm:text-[11px] text-neutral-500">chef1@elfogon.com</span>
                    <span class="text-[10px] sm:text-[11px] font-mono text-brand-600 mt-0.5">pwd: password123</span>
                  </button>
                  <button type="button" class="demo-login-btn flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border border-brand-300 bg-white hover:bg-brand-50 hover:border-brand-400 transition-colors" data-email="waiter1@elfogon.com">
                    <span class="text-xs sm:text-sm font-semibold text-neutral-900">Waiter</span>
                    <span class="text-[10px] sm:text-[11px] text-neutral-500">waiter1@elfogon.com</span>
                    <span class="text-[10px] sm:text-[11px] font-mono text-brand-600 mt-0.5">pwd: password123</span>
                  </button>
                  <button type="button" class="demo-login-btn flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border border-brand-300 bg-white hover:bg-brand-50 hover:border-brand-400 transition-colors" data-email="cashier1@elfogon.com">
                    <span class="text-xs sm:text-sm font-semibold text-neutral-900">Cashier</span>
                    <span class="text-[10px] sm:text-[11px] text-neutral-500">cashier1@elfogon.com</span>
                    <span class="text-[10px] sm:text-[11px] font-mono text-brand-600 mt-0.5">pwd: password123</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
    </div>
  `;
}

/**
 * Initialize Login view interactivity
 * Call after render() to bind events
 */
export function init() {
  const formBody = document.getElementById("formBody");
  const checkboxContainer = document.getElementById("checkboxContainer");
  const submitContainer = document.getElementById("submitContainer");

  if (!formBody || !checkboxContainer || !submitContainer) return;

  // Email input
  formBody.innerHTML += InputField({
    id: "email",
    label: "Email address",
    type: "email",
    placeholder: "you@elfogon.com",
    error: "Please enter a valid email address",
    required: true,
    autocomplete: "email",
  });

  // Password input with toggle
  formBody.innerHTML += `
    <div class="field flex flex-col gap-1">
      <label class="text-label font-medium leading-loose text-neutral-900" for="password">Password</label>
      <div class="relative flex items-center">
        <input
          class="field-input w-full h-11 px-3 pr-10 text-sm font-normal leading-normal text-neutral-900
                 bg-brand-50 border border-brand-300 rounded-md outline-none
                 transition-colors duration-100
                 placeholder:text-neutral-400
                 focus:border-brand-500 focus:shadow-[var(--ring-brand)]
                 hover:not-focus:border-brand-400
                 error:border-error-600 error:shadow-[var(--ring-error)]"
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          autocomplete="current-password"
          required
        >
        ${PasswordToggle({ inputId: "password" })}
      </div>
    </div>
  `;

  // Checkbox
  checkboxContainer.innerHTML = CheckboxField({
    id: "keepSignedIn",
    label: "Keep me signed in",
  });

  // Submit button
  submitContainer.innerHTML = SubmitButton({
    text: "Sign In",
    id: "signInBtn",
  });

  // Initialize components
  initInputField("email");
  initCheckboxField("keepSignedIn");
  initSubmitButton("signInBtn", { loadingText: "Signing in..." });
  initPasswordToggles();

  // Initialize Lucide icons
  if (typeof window.createIcons === "function") {
    window.createIcons();
  } else {
    createIcons({
      icons: {
        Eye,
        EyeOff,
        Sun,
        Moon,
      },
    });
  }

  // Theme toggle button
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      toggleTheme();
      const newDark = isDark();
      themeBtn.innerHTML = `<i data-lucide="${newDark ? "sun" : "moon"}" class="w-[18px] h-[18px]"></i>`;
      if (typeof window.createIcons === "function") {
        window.createIcons();
      } else {
        createIcons({
          nodes: themeBtn.querySelectorAll("[data-lucide]"),
          icons: { Sun, Moon },
        });
      }
      window.dispatchEvent(
        new CustomEvent("themechange", { detail: { theme: newDark ? "dark" : "light" } })
      );

      // Update scene and logos
      const sceneImg = document.querySelector("#loginPage img[src*='-scene.svg']");
      if (sceneImg) sceneImg.src = getScenePath();

      const panelLogo = document.querySelector("#loginPage img[src*='logo-02']");
      if (panelLogo) panelLogo.src = getLogoPath("logo-02");

      const tabletLogos = document.querySelectorAll("#loginPage .hidden.md\\:max-lg\\:flex img");
      if (tabletLogos.length >= 2) {
        tabletLogos[0].src = getLogoPath("logo-01");
        tabletLogos[1].src = getLogoPath("logo-03");
      }

      const desktopLogo = document.querySelector("#loginPage .hidden.lg\\:block.logo");
      if (desktopLogo) desktopLogo.src = getLogoPath("logo-01");

      const mobileLogo = document.querySelector("#loginPage .md\\:hidden.logo");
      if (mobileLogo) mobileLogo.src = getLogoPath("logo-00");
    });
  }

  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("login-error");
  const errorText = errorBox ? errorBox.querySelector("p") : null;

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const signInBtn = document.getElementById("signInBtn");

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const emailErr = document.getElementById("emailError");
        if (emailInput) emailInput.classList.add("error");
        if (emailErr) {
          emailErr.classList.remove("hidden");
          emailErr.classList.add("flex");
        }
        return;
      }

      if (!password) return;

      if (signInBtn) {
        signInBtn.disabled = true;
        signInBtn.textContent = "Signing in...";
      }

      const keepSignedInInput = document.getElementById("keepSignedIn");
      const keepSignedIn = keepSignedInInput ? keepSignedInInput.checked : false;

      const result = await authStore.login(email, password, keepSignedIn);

      if (result.success) {
        toast.success("Welcome back!", "Logged in as " + (result.user.role || "admin"));
        window.location.hash = "#" + getHomeRoute(result.user.role);
      } else {
        if (signInBtn) {
          signInBtn.disabled = false;
          signInBtn.textContent = "Sign In";
        }
        if (errorText) errorText.textContent = result.error || "Invalid credentials";
        if (errorBox) errorBox.classList.remove("hidden");
      }
    });
  }

  const demoBtns = document.querySelectorAll(".demo-login-btn");
  demoBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      if (emailInput) emailInput.value = btn.dataset.email;
      if (passwordInput) passwordInput.value = "password123"; // Dummy password
      
      if (form) {
        form.dispatchEvent(new Event("submit"));
      }
    });
  });

  // Mobile Bottom Sheet Logic
  const demoToggleBtn = document.getElementById("demoAccountsToggleBtn");
  const demoContainer = document.getElementById("demoAccountsContainer");
  const demoSheet = document.getElementById("demoAccountsSheet");
  const demoCloseBtn = document.getElementById("demoAccountsCloseBtn");

  function openSheet() {
    if (demoContainer) {
      demoContainer.classList.remove("max-md:hidden");
      demoContainer.classList.add("max-md:flex");
      // Small delay for CSS transition
      setTimeout(() => {
        if (demoSheet) {
          demoSheet.classList.remove("max-md:translate-y-full");
          demoSheet.classList.add("max-md:translate-y-0");
        }
      }, 10);
    }
  }

  function closeSheet() {
    if (demoSheet) {
      demoSheet.classList.remove("max-md:translate-y-0");
      demoSheet.classList.add("max-md:translate-y-full");
    }
    setTimeout(() => {
      if (demoContainer) {
        demoContainer.classList.add("max-md:hidden");
        demoContainer.classList.remove("max-md:flex");
      }
    }, 300); // match transition duration
  }

  if (demoToggleBtn) demoToggleBtn.addEventListener("click", openSheet);
  if (demoCloseBtn) demoCloseBtn.addEventListener("click", closeSheet);
  if (demoContainer) {
    demoContainer.addEventListener("click", (e) => {
      if (e.target === demoContainer) closeSheet();
    });
  }
}

/**
 * Cleanup Login view
 * Call before navigating away to remove event listeners
 */
export function destroy() {
  // Cleanup if needed
}

// Default export for router
export default { render, init, destroy };
