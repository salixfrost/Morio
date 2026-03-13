// ============================================
// BLOB HOVER INTERACTION
// ============================================

const CONFIG = {
  hoverSpeedMultiplier: 5
};

export function setupBlobInteraction(elements) {
  // Wait for animations to be registered
  requestAnimationFrame(() => {
    const animations = elements.blob.getAnimations();

    elements.blob.addEventListener('mouseenter', () => {
      animations.forEach(anim => {
        anim.playbackRate = CONFIG.hoverSpeedMultiplier;
      });
    });

    elements.blob.addEventListener('mouseleave', () => {
      animations.forEach(anim => {
        anim.playbackRate = 1;
      });
    });
  });
}
