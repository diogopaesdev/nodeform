"use client";

import { useEffect } from "react";

export function useEmbedResize(isEmbed: boolean) {
  useEffect(() => {
    if (!isEmbed) return;

    const sendHeight = () => {
      // Measure the body, not documentElement: the root element is always at
      // least as tall as the viewport (initial containing block), so
      // documentElement.scrollHeight would inflate the iframe to a full screen
      // and leave blank space below shorter questions.
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: "surveyflow-resize", height }, "*");
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
