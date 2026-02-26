"use client";

import { useEffect } from "react";

/**
 * Runtime accessibility auditing via @axe-core/react.
 * Only active in development mode — completely tree-shaken from production builds.
 *
 * Logs WCAG violations directly to the browser console with full details
 * including the offending element, the violated rule, and the impact severity.
 */
export function AxeDevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const initAxe = async () => {
      const React = await import("react");
      const ReactDOM = await import("react-dom");
      const axe = await import("@axe-core/react");

      // Delay 1s to let the initial render settle before scanning
      const INIT_DELAY = 1000;
      axe.default(React.default, ReactDOM.default, INIT_DELAY);
    };

    initAxe();
  }, []);

  return null;
}
