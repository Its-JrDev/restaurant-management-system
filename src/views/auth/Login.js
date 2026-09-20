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
    <div class="relative w-full min-h-screen overflow-hidden" id="loginPage">

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

      <div class="grid w-full min-h-screen
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
      <main class="flex flex-col items-center justify-center z-10
                  bg-brand-100 lg:p-12
                  md:max-lg:bg-transparent md:max-lg:p-8
                  max-md:min-h-screen max-md:px-6 max-md:py-8">

        <!-- Tablet: dual logos -->
        <div class="hidden md:max-lg:flex items-center gap-4 mb-8">
          <img src="${getLogoPath("logo-01")}" alt="El Fogón" class="h-auto w-[147px] object-contain" draggable="false">
          <img src="${getLogoPath("logo-03")}" alt="El Fogón" class="h-auto w-[277px] object-contain" draggable="false">
        </div>

        <form class="login-form flex flex-col gap-8 w-full max-w-[380px]
                     md:max-lg:bg-brand-100 md:max-lg:backdrop-blur-md md:max-lg:rounded-xl md:max-lg:p-10 md:max-lg:max-w-[440px] md:max-lg:shadow-xl" id="loginForm" novalidate>

          <!-- Header -->
          <header class="flex flex-col items-center gap-5">
            <img class="logo h-[220px] w-auto pb-8 object-contain hidden lg:block"
                 src="${getLogoPath("logo-01")}" alt="El Fogón" draggable="false">
            <img class="logo h-[300px] w-auto pb-8 object-contain md:hidden"
                 src="${getLogoPath("logo-00")}" alt="El Fogón" draggable="false">
            <div class="flex flex-col gap-3">
              <h1 class="text-heading font-semibold leading-snug text-neutral-900">Good to see you again</h1>
              <p class="text-sm font-normal leading-normal text-neutral-600">Sign in to manage tables, orders, and reservations.</p>
            </div>
          </header>

          <!-- Body -->
          <div id="login-error" class="hidden rounded-md bg-error-50 border border-error-200 p-3">
            <p class="text-sm text-error-700"></p>
          </div>
          <div class="flex flex-col gap-6" id="formBody"></div>

          <!-- Footer -->
          <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between gap-4 flex-wrap max-md:gap-3">
              <div id="checkboxContainer"></div>
              <a href="#" class="text-label font-medium leading-loose text-primary-600 no-underline whitespace-nowrap
                                 hover:text-primary-700 hover:underline">Forgot your password?</a>
            </div>
            <div id="submitContainer"></div>
          </div>

          <!-- Bottom CTA -->
          <footer class="flex items-center justify-center gap-1 text-sm font-normal leading-normal text-neutral-600">
            <span>Don't have an account?</span>
            <a href="#" class="font-semibold text-primary-600 no-underline hover:text-primary-700 hover:underline">Contact Us</a>
          </footer>

        </form>
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
          class="field-input w-[380px] h-11 px-3 pr-10 text-sm font-normal leading-normal text-neutral-900
                 bg-brand-50 border border-brand-300 rounded-md outline-none
                 transition-colors duration-100
                 placeholder:text-neutral-400
                 focus:border-brand-500 focus:shadow-[var(--ring-brand)]
                 hover:not-focus:border-brand-400
                 error:border-error-600 error:shadow-[var(--ring-error)]
                 max-md:w-full"
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
  createIcons({
    icons: {
      Eye,
      EyeOff,
      Sun,
      Moon,
    },
  });

  // Theme toggle button
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      toggleTheme();
      const newDark = isDark();
      themeBtn.innerHTML = `<i data-lucide="${newDark ? "sun" : "moon"}" class="w-[18px] h-[18px]"></i>`;
      createIcons({ icons: { Sun, Moon } });
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

      const username = email.split("@")[0];
      const result = await authStore.login(username, password);

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
