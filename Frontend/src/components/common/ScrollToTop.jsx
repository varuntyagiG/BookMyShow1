import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every route change immediately resets the viewport scroll position
 * to the top (0, 0), preventing pages from appearing in the middle when navigating.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If navigating to an in-page anchor hash (e.g. #showtimes), scroll to that element
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Immediately reset window scroll position to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    // Fallback for legacy browsers and documentElement containers
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, hash]);

  return null;
}
