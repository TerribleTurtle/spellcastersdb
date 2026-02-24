import { monitoring } from "@/services/monitoring";

/**
 * Copies text to the clipboard with fallback for non-secure contexts (e.g. mobile local IP dev).
 *
 * Uses `navigator.clipboard.writeText` when available, otherwise falls back to
 * a hidden `<textarea>` + `document.execCommand('copy')`.
 *
 * @param text - The string to copy to the clipboard.
 * @returns `true` if the copy succeeded, `false` otherwise.
 *
 * @example
 * ```ts
 * const ok = await copyToClipboard("https://spellcastersdb.com/d/abc123");
 * if (ok) showToast("Link copied!");
 * ```
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern API first (if available and secure)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      monitoring.captureMessage(
        "navigator.clipboard failed, trying fallback",
        "warning",
        { error: err }
      );
    }
  }

  // 2. Fallback: execCommand('copy') via textarea
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure it's not visible but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    return successful;
  } catch (err) {
    monitoring.captureException(err, { operation: "clipboardFallback" });
    return false;
  }
}
