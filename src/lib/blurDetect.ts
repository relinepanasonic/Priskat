/**
 * Fast, zero-cost client-side blur detector using Laplacian Variance (focus measure).
 * Works on both local camera/gallery Files and remote HTTPS image URLs (with CORS).
 *
 * Typical scores at 400px analysis size:
 *   - Motion-blurred / out-of-focus photos: 5 – 60
 *   - Normal / sharp event photos:         80 – 1200+
 */

export const BLUR_THRESHOLD = 65;

export type BlurResult = {
  score: number;
  blurry: boolean;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

/** Computes Laplacian variance on a downscaled grayscale copy of the image. */
export async function measureSharpness(
  source: Blob | File | string,
  threshold = BLUR_THRESHOLD,
): Promise<BlurResult> {
  let objectUrl: string | null = null;
  try {
    const url = typeof source === "string" ? source : (objectUrl = URL.createObjectURL(source));
    const img = await loadImage(url);

    const maxDim = 400;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const w = Math.max(16, Math.round((img.naturalWidth || 1) * scale));
    const h = Math.max(16, Math.round((img.naturalHeight || 1) * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { score: 999, blurry: false };

    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    // Grayscale luminance array
    const gray = new Float32Array(w * h);
    for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
      gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
    }

    // 3x3 Laplacian kernel [0, 1, 0, 1, -4, 1, 0, 1, 0] across center region (skip 8% border)
    const padX = Math.max(1, Math.floor(w * 0.08));
    const padY = Math.max(1, Math.floor(h * 0.08));
    let sum = 0;
    let sumSq = 0;
    let count = 0;

    for (let y = padY; y < h - padY; y++) {
      const row = y * w;
      for (let x = padX; x < w - padX; x++) {
        const idx = row + x;
        const lap =
          gray[idx - w] +
          gray[idx + w] +
          gray[idx - 1] +
          gray[idx + 1] -
          4 * gray[idx];
        sum += lap;
        sumSq += lap * lap;
        count++;
      }
    }

    if (count === 0) return { score: 999, blurry: false };
    const mean = sum / count;
    const variance = Math.max(0, sumSq / count - mean * mean);
    const score = Math.round(variance);

    return { score, blurry: score < threshold };
  } catch {
    // Never falsely flag a photo as blurry if canvas/CORS fails
    return { score: 999, blurry: false };
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
