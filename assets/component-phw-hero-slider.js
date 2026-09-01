class PhwHeroSlider extends HTMLElement {
  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('[data-phw-slide]'));
    this.dots = Array.from(this.querySelectorAll('[data-phw-dot]'));
    this.index = 0;
    this.querySelector('[data-phw-prev]')?.addEventListener('click', () => this.show(this.index - 1, true));
    this.querySelector('[data-phw-next]')?.addEventListener('click', () => this.show(this.index + 1, true));
    this.dots.forEach((dot, index) => dot.addEventListener('click', () => this.show(index, true)));
    this.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') this.show(this.index - 1, true);
      if (event.key === 'ArrowRight') this.show(this.index + 1, true);
    });
    this.addEventListener('shopify:block:select', (event) => {
      const selected = this.slides.indexOf(event.target);
      if (selected >= 0) this.show(selected, true);
    });
    this.startAutoplay();
  }
  disconnectedCallback() { window.clearInterval(this.autoplayTimer); }
  show(nextIndex, restart = false) {
    if (this.slides.length < 2) return;
    this.index = (nextIndex + this.slides.length) % this.slides.length;
    this.slides.forEach((slide, index) => {
      const active = index === this.index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    this.dots.forEach((dot, index) => {
      const active = index === this.index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
    if (restart) this.startAutoplay();
  }
  startAutoplay() {
    window.clearInterval(this.autoplayTimer);
    const delay = Number(this.dataset.autoplay);
    if (!delay || this.slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.autoplayTimer = window.setInterval(() => this.show(this.index + 1), delay);
  }
}
if (!customElements.get('phw-hero-slider')) customElements.define('phw-hero-slider', PhwHeroSlider);
