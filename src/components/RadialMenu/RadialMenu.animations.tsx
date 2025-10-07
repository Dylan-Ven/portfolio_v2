import gsap from "gsap";

/**
 * Animate menu items opening in the top-half circle
 */
export function animateMenuOpen(buttons: HTMLButtonElement[]) {
  const radius = 120; // distance from main button
  const buttonsCount = buttons.length;
  const startAngle = Math.PI; // 180° → leftmost
  const endAngle = 2 * Math.PI;         // 0° → rightmost
  const step = (endAngle - startAngle) / (buttonsCount - 1);

  buttons.forEach((btn, i) => {
    const angle = startAngle + i * step;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    gsap.to(btn, { x, y, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)", delay: i * 0.05 });
  });
}

/**
 * Animate menu items collapsing back to center
 */
export function animateMenuClose(buttons: HTMLButtonElement[]) {
  buttons.forEach((btn, i) => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      scale: 0.5,
      opacity: 0,
      duration: 0.3,
      ease: "back.in(1.7)",
      delay: i * 0.05
    });
  });
}

/**
 * Animate main button pop when component mounts
 */
export function animateMainButton(mainBtn: HTMLButtonElement, open: boolean) {
  gsap.to(mainBtn, {
    y: open ? 0 : 60, // move up when open, down when closed
    scale: 1,
    duration: 0.4,
    ease: open ? "back.out(1.7)" : "back.in(1.7)",
  });
}

/**
 * Set initial state of main button
 **/
export function setInitialMainButton(mainBtn: HTMLButtonElement) {
  gsap.set(mainBtn, { y: 60, scale: 1 });
}
