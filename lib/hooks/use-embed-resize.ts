"use client";

import { useEffect } from "react";

export function useEmbedResize(isEmbed: boolean) {
  useEffect(() => {
    if (!isEmbed) return;

    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "nodeform-resize", height }, "*");
    };

    // Send initial height
    sendHeight();

    // Observe DOM changes
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    // Also listen for mutations (content changes, images loading, etc.)
    const mutationObserver = new MutationObserver(sendHeight);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Fallback: send height periodically for first few seconds
    const intervals = [100, 300, 500, 1000, 2000].map((ms) =>
      setTimeout(sendHeight, ms)
    );

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      intervals.forEach(clearTimeout);
    };
  }, [isEmbed]);
}
