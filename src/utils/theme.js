const THEME_KEY = "fogon-theme";

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
  const metaThemeColor = document.getElementById("metaThemeColor");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme === "dark" ? "#0d1b2a" : "#fcedd7");
  }
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}

export function isDark() {
  return getTheme() === "dark";
}

export function initTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute("data-theme", theme);
}

export function getLogoPath(basename) {
  const suffix = isDark() ? "-night" : "";
  return `/logos/${basename}${suffix}.png`;
}

export function getScenePath() {
  return isDark() ? "/logos/moon-scene.svg" : "/logos/sun-scene.svg";
}
