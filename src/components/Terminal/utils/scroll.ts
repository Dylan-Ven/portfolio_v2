/**
 * Smooth-scroll helper for the terminal content pane.
 */

export const smoothScrollToBottom = (element: HTMLElement): void => {
  const targetScroll = element.scrollHeight;
  const startScroll = element.scrollTop;
  const distance = targetScroll - startScroll - element.clientHeight;

  if (distance <= 0) return;

  const duration = 300;
  const startTime = performance.now();

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    element.scrollTop = startScroll + distance * easeProgress;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};
