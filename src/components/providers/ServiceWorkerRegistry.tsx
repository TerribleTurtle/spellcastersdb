"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV !== "development"
    ) {
      try {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          // Log to console rather than throwing a rejection to avoid Sentry noise
          // Many older Android devices and crawlers (GoogleOther) don't fully support SW
          console.warn(
            "Service worker registration failed or was rejected:",
            err
          );
        });
      } catch (err) {
        console.warn("Service worker manual registration threw:", err);
      }
    }
  }, []);

  return null;
}
