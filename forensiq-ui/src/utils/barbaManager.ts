import barba from '@barba/core';
import gsap from 'gsap';

export function initBarba(onRouteChange?: (nextNamespace: string) => void) {
  try {
    barba.init({
      sync: true,
      transitions: [
        {
          name: 'forensic-fade-transition',
          leave(data: any) {
            return gsap.to(data.current.container, {
              opacity: 0,
              y: -15,
              duration: 0.35,
              ease: 'power2.inOut',
            });
          },
          enter(data: any) {
            if (onRouteChange && data.next.namespace) {
              onRouteChange(data.next.namespace);
            }
            return gsap.from(data.next.container, {
              opacity: 0,
              y: 20,
              duration: 0.45,
              ease: 'power3.out',
            });
          },
        },
      ],
    });
  } catch (err) {
    // Graceful fallback if container already initialized in hot reload
    console.warn('Barba initialization note:', err);
  }
}
