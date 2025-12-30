"use client";

import { useEffect } from "react";

export function ScrollbarHider() {
  useEffect(() => {
    // Inject aggressive scrollbar-hiding styles
    const styleId = "scrollbar-hider-styles";

    // Remove existing style if present
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      /* Hide all scrollbars - Maximum priority */
      * {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }

      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        background: transparent !important;
      }

      *::-webkit-scrollbar-track {
        display: none !important;
        background: transparent !important;
      }

      *::-webkit-scrollbar-thumb {
        display: none !important;
        background: transparent !important;
      }

      html, body {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;

    // Append to head with high priority
    document.head.appendChild(style);

    // Also force hide on body
    document.body.style.setProperty("scrollbar-width", "none", "important");
    document.body.style.setProperty("-ms-overflow-style", "none", "important");

    return () => {
      // Cleanup
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  return null;
}
