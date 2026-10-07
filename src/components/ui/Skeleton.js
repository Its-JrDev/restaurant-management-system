/**
 * Skeleton — placeholder loading element with pulse animation.
 *
 * Variants:
 *   Skeleton({ variant: "text", width: "100%", lines: 3 })
 *   Skeleton({ variant: "circle", size: 40 })
 *   Skeleton({ variant: "rect", width: "100%", height: 200 })
 *
 * All variants accept: class, width, height
 */
function Skeleton(opts = {}) {
  const variant = opts.variant || "text";
  const cls = opts.class || "";

  if (variant === "circle") {
    const size = opts.size || 40;
    return `<div class="rounded-full bg-brand-200 animate-pulse ${cls}" style="width:${size}px;height:${size}px;" aria-hidden="true"></div>`;
  }

  if (variant === "rect") {
    const w = opts.width || "100%";
    const h = opts.height || 200;
    return `<div class="rounded-lg bg-brand-200 animate-pulse ${cls}" style="width:${w};height:${h}px;" aria-hidden="true"></div>`;
  }

  // text (default)
  const lines = opts.lines || 1;
  const w = opts.width || "100%";
  if (lines === 1) {
    return `<div class="h-4 rounded bg-brand-200 animate-pulse ${cls}" style="width:${w};" aria-hidden="true"></div>`;
  }
  const items = [];
  for (let i = 0; i < lines; i++) {
    const lineW = i === lines - 1 ? "60%" : w;
    items.push(
      `<div class="h-4 rounded bg-brand-200 animate-pulse ${cls}" style="width:${lineW};" aria-hidden="true"></div>`
    );
  }
  return `<div class="flex flex-col gap-2">${items.join("")}</div>`;
}

Skeleton.html = Skeleton;

window.Skeleton = Skeleton;

export default Skeleton;
