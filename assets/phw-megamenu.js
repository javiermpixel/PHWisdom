(() => {
  function setup(root = document) {
    root.querySelectorAll('.phw-shop-disclosure').forEach(details => {
      if (details.dataset.phwReady) return;
      details.dataset.phwReady = 'true';
      const summary = details.querySelector('summary');
      const controller = new AbortController();
      const { signal } = controller;
      let closeTimer;
      let pointerInside = false;
      const supportsHover = () => details.classList.contains('phw-shop-desktop') &&
        matchMedia('(min-width: 990px) and (hover: hover) and (pointer: fine)').matches;
      details.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch' || !supportsHover()) return;
        pointerInside = true;
        clearTimeout(closeTimer);
        details.open = true;
      });
      details.addEventListener('pointerleave', event => {
        if (event.pointerType === 'touch' || !supportsHover()) return;
        pointerInside = false;
        // Allow the pointer to cross the space between Shop and the full-width panel.
        closeTimer = setTimeout(() => {
          if (!details.contains(document.activeElement)) details.open = false;
        }, 250);
      });
      details.addEventListener('toggle', () => {
        summary.setAttribute('aria-expanded', String(details.open));
        details.querySelectorAll('.phw-shop-product-list').forEach(updateControls);
      });
      summary.setAttribute('aria-expanded', String(details.open));
      details.addEventListener('keydown', event => {
        if (event.key === 'Escape' && details.open) {
          event.preventDefault(); event.stopPropagation();
          details.open = false; summary.focus();
        }
      });
      document.addEventListener('click', event => {
        if (!details.contains(event.target)) details.open = false;
      }, { signal });
      details.addEventListener('focusout', () => {
        requestAnimationFrame(() => {
          if (!pointerInside && !details.contains(document.activeElement)) details.open = false;
        });
      });
      details.querySelectorAll('[data-phw-scroll]').forEach(button => {
        button.addEventListener('click', () => {
          const track = button.closest('.phw-shop-products').querySelector('.phw-shop-product-list');
          track.scrollBy({ left: Number(button.dataset.phwScroll) * 165 * Math.max(1, Math.floor(track.clientWidth / 165)), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        });
      });
      const observer = new ResizeObserver(() => details.querySelectorAll('.phw-shop-product-list').forEach(updateControls));
      details.querySelectorAll('.phw-shop-product-list').forEach(track => {
        track.addEventListener('scroll', () => updateControls(track), { passive: true });
        observer.observe(track);
      });
      document.addEventListener('shopify:section:unload', event => {
        if (event.target.contains(details)) { clearTimeout(closeTimer); controller.abort(); observer.disconnect(); }
      }, { signal });
    });
  }
  function updateControls(track) {
    const parent = track.closest('.phw-shop-products');
    parent.querySelector('[data-phw-scroll="-1"]').disabled = track.scrollLeft <= 1;
    parent.querySelector('[data-phw-scroll="1"]').disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  }
  setup();
  document.addEventListener('shopify:section:load', event => setup(event.target));
  document.addEventListener('shopify:block:select', event => {
    const details = event.target.closest('.phw-shop-disclosure');
    if (details) details.open = true;
  });
})();
