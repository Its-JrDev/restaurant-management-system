function PasswordToggle(opts) {
  const inputId = opts.inputId;

  let html =
    '<button type="button" class="password-toggle absolute right-3 top-1/2 -translate-y-1/2 ' +
    "flex items-center justify-center w-5 h-5 p-0 " +
    "bg-transparent border-none cursor-pointer text-neutral-400 " +
    'hover:text-neutral-600" data-input="' +
    inputId +
    '" aria-label="Toggle password visibility">';
  html += '<i data-lucide="eye" class="icon-eye w-5 h-5"></i>';
  html += '<i data-lucide="eye-off" class="icon-eye-off w-5 h-5 hidden"></i>';
  html += "</button>";
  return html;
}

function initPasswordToggles() {
  const toggles = document.querySelectorAll(".password-toggle");
  toggles.forEach(function (toggle) {
    const inputId = toggle.dataset.input;
    const input = document.getElementById(inputId);
    if (!input) return;

    toggle.addEventListener("click", function () {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";

      const eyeIcon = toggle.querySelector(".icon-eye");
      const eyeOffIcon = toggle.querySelector(".icon-eye-off");

      if (eyeIcon && eyeOffIcon) {
        eyeIcon.style.display = isPassword ? "none" : "block";
        eyeOffIcon.style.display = isPassword ? "block" : "none";
      }
    });
  });
}

window.PasswordToggle = PasswordToggle;
window.initPasswordToggles = initPasswordToggles;

export default PasswordToggle;
