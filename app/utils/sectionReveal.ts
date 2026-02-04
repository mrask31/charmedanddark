/**
 * Section Reveal System
 * 
 * Uses Intersection Observer to reveal sections when they enter the viewport.
 * Adds 'section-revealed' class to trigger CSS accent reveals.
 */

export function initializeSectionReveals() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  const observerOptions: IntersectionObserverInit = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-revealed');
      }
    });
  }, observerOptions);

  // Observe all major sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Return cleanup function
  return () => {
    sections.forEach(section => {
      sectionObserver.unobserve(section);
    });
  };
}
