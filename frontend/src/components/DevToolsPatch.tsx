'use client';
import { useEffect } from 'react';

export default function DevToolsPatch() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const injectHideStyle = (shadowRoot: ShadowRoot) => {
      if (shadowRoot.querySelector('style[data-patch]')) return;
      const style = document.createElement('style');
      style.setAttribute('data-patch', '1');
      style.textContent = `
        .preference-section:has(label[id="hide-dev-tools"]) {
          display: none !important;
        }
      `;
      shadowRoot.appendChild(style);
    };

    const scanShadowRoots = () => {
      document.querySelectorAll('*').forEach((el) => {
        const sr = (el as Element & { shadowRoot?: ShadowRoot }).shadowRoot;
        if (sr) injectHideStyle(sr);
      });
    };

    const observer = new MutationObserver(scanShadowRoots);
    observer.observe(document.body, { childList: true, subtree: true });
    scanShadowRoots();

    return () => observer.disconnect();
  }, []);

  return null;
}
