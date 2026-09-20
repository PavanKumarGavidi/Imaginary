import { supabase } from "./supabase";

/**
 * Image pipeline.
 *
 * Every upload (team portrait, gallery frame, site photo) is downscaled to a
 * max edge of ~1100px and re-encoded as JPEG. In cloud mode the result is
 * pushed to the Supabase Storage bucket `photos` and a public URL is returned
 * (run the Storage section of supabase/schema.sql once to create the bucket).
 * Without cloud — or if the bucket isn't set up yet — we fall back to the
 * data-URL so the site never breaks.
 */

export interface ProcessedImage {
  blob: Blob;
  dataUrl: string;
}

export type PhotoFolder = "team" | "gallery" | "photos" | "deliveries" | "journal";

/** Downscale + re-encode an image file. Rejects for non-images / >6 MB. */
export function readAndResize(file: File, maxDim = 1100): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("That file isn't an image — PNG or JPG works best."));
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      reject(new Error("Keep uploads under 6 MB — the darkroom will trim it anyway."));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process the image in this browser."));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve({ blob, dataUrl });
          else resolve({ blob: new Blob([dataUrl], { type: "image/jpeg" }), dataUrl });
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file couldn't be read as an image."));
    };
    img.src = url;
  });
}

export interface StoredImage {
  url: string;
  /** 'cloud' = Supabase Storage URL · 'local' = embedded data URL */
  source: "cloud" | "local";
}

/** Process + store an upload. Returns a public URL in cloud mode, a data URL otherwise. */
export async function storeImage(file: File, folder: PhotoFolder = "photos"): Promise<StoredImage> {
  const { blob, dataUrl } = await readAndResize(file);

  if (supabase) {
    try {
      const path = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await supabase.storage.from("photos").upload(path, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (!error) {
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        return { url: data.publicUrl, source: "cloud" };
      }
      // eslint-disable-next-line no-console
      console.warn("Storage upload failed — embedding the image instead:", error.message);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Storage upload failed — embedding the image instead:", e);
    }
  }

  return { url: dataUrl, source: "local" };
}
