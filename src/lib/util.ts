/** Small shared helpers. */

/** SHA-256 hex digest (used to gate private delivery galleries). */
export async function hashText(text: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    /* non-secure context (plain http) — stable fallback hash */
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return `fb_${(h >>> 0).toString(16)}`;
  }
}

/** URL-friendly slug from a title. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "post";

/** "2026-03-14T…" → "Mar 14, 2026" */
export const fmtLongDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/** Build a Stripe Payment Link with the client's email + booking ref prefilled. */
export const stripeUrl = (base: string, email: string, ref: string) => {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}prefilled_email=${encodeURIComponent(email)}&client_reference_id=${encodeURIComponent(ref)}`;
};

/** Download a cross-origin image as a file (falls back to opening it). */
export async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = obj;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(obj), 4000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}
