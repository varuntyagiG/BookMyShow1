import React, { useEffect, useState, useRef } from 'react';

/**
 * Ambient Cinema Cursor Spotlight FX
 * Casts an ultra-subtle, non-intrusive ambient aura tracking the user's cursor
 * over dark sections, giving the website a linear/raycast flagship polish.
 */
export default function CursorSpotlight() {
  const [visible, setVisible] = useState(false);
  const spotlightRef = useRef(null);
  const posRef = useRef({ x: -1000, y: -1000 });
  const rafId = useRef(null);

  useEffect(() => {
    // Avoid running on touch devices without a fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (!visible) setVisible(true);

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(updateSpotlight);
      }
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    const updateSpotlight = () => {
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
      rafId.current = null;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [visible]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        ref={spotlightRef}
        className="absolute -top-[250px] -left-[250px] w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(248, 68, 100, 0.055) 0%, rgba(248, 68, 100, 0.015) 45%, transparent 70%)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
