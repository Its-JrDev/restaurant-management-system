import { createIcons, CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide";

const TOAST_ICONS = {
  success: "check-circle",
  error: "x-circle",
  warning: "alert-triangle",
  info: "info",
};

const TOAST_COLORS = {
  success: {
    bg: "bg-success-600",
    icon: "text-success-100",
    bar: "bg-success-400",
    text: "text-white",
    textSub: "text-success-100",
    close: "text-success-200 hover:text-white",
  },
  error: {
    bg: "bg-error-600",
    icon: "text-error-100",
    bar: "bg-error-400",
    text: "text-white",
    textSub: "text-error-100",
    close: "text-error-200 hover:text-white",
  },
  warning: {
    bg: "bg-warning-500",
    icon: "text-warning-100",
    bar: "bg-warning-300",
    text: "text-white",
    textSub: "text-warning-100",
    close: "text-warning-200 hover:text-white",
  },
  info: {
    bg: "bg-info-600",
    icon: "text-info-100",
    bar: "bg-info-400",
    text: "text-white",
    textSub: "text-info-100",
    close: "text-info-200 hover:text-white",
  },
};

const ICON_MAP = {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
};

let iconCounter = 0;

export function createToast({
  id,
  type = "info",
  title,
  message,
  _duration = 3000,
  dismissible = true,
}) {
  const colors = TOAST_COLORS[type] || TOAST_COLORS.info;
  const iconName = TOAST_ICONS[type] || "info";
  const role = type === "error" ? "alert" : "status";
  const ariaLive = type === "error" ? "assertive" : "polite";
  const closeId = `toast-close-${iconCounter++}`;

  return {
    html: `
      <div
        data-toast-id="${id}"
        class="pointer-events-auto flex items-center gap-3 w-full max-w-sm h-11 pl-4 pr-2 rounded-lg ${colors.bg} shadow-[0_6px_24px_rgba(0,0,0,0.15)] animate-toast-in"
        role="${role}"
        aria-live="${ariaLive}"
      >
        <i data-lucide="${iconName}" class="w-5 h-5 shrink-0 ${colors.icon}"></i>
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <p class="text-sm font-semibold ${colors.text} truncate">${title}</p>
          ${
            message
              ? `<span class="w-px h-3.5 bg-white/30 shrink-0"></span>
                 <p class="text-xs font-medium ${colors.textSub} truncate">${message}</p>`
              : ""
          }
        </div>
        ${
          dismissible
            ? `<button
                data-toast-dismiss="${id}"
                id="${closeId}"
                class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md ${colors.close} hover:bg-white/10 transition-colors cursor-pointer border-none"
                aria-label="Dismiss notification"
              >
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>`
            : ""
        }
      </div>
    `,
    init() {
      const el = document.querySelector(`[data-toast-id="${id}"]`);
      if (el) {
        el.style.position = "relative";
        createIcons({
          nodes: el.querySelectorAll("[data-lucide]"),
          icons: ICON_MAP,
        });
      }
    },
  };
}
