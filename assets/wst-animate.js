/**
 * WST animation engine
 * ------------------------------------------------------------------
 * Reveals [data-wst-animate] elements when they scroll into view by
 * adding the .wst-inview class. All visual behavior lives in
 * wst-engine.css; this file only toggles state.
 *
 * - One shared IntersectionObserver for every widget.
 * - Elements are unobserved after reveal (animate once).
 * - Falls back to instantly visible when IntersectionObserver is
 *   unavailable.
 * - Re-initializes on Shopify theme editor events so animations
 *   survive section and block re-renders.
 * - Reduced motion is handled entirely in CSS: without the
 *   no-preference media query the elements are never hidden, so this
 *   script adding a class has no visible effect for those users.
 */
(() => {
  'use strict';

  let observer = null;

  const reveal = (el) => el.classList.add('wst-inview');

  const getObserver = () => {
    if (observer) return observer;
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    return observer;
  };

  const init = (root) => {
    const scope = root || document;
    const targets = scope.querySelectorAll('[data-wst-animate]:not(.wst-inview)');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(reveal);
      return;
    }

    const io = getObserver();
    targets.forEach((el) => io.observe(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  /* Shopify theme editor: re-run when sections or blocks re-render. */
  document.addEventListener('shopify:section:load', (event) => init(event.target));
  document.addEventListener('shopify:block:select', (event) => init(event.target));
})();
