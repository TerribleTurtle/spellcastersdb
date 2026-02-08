/**
 * Copies text to the clipboard with fallback for non-secure contexts (e.g. mobile local IP dev).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern API first (if available and secure)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard failed, trying fallback", err);
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
    console.error("Fallback clipboard copy failed", err);
    return false;
  }
}
