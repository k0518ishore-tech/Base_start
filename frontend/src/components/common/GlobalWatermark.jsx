import React from 'react';

/**
 * GlobalWatermark Component
 *
 * Renders the official government building watermark positioned at the exact horizontal
 * and vertical centre of the main content area with responsive scaling, non-blocking
 * pointer events, and subtle 0.08 opacity that complements the light-blue and white theme.
 */
const GlobalWatermark = ({
  className = '',
  opacity = 'opacity-[0.08]',
  size = 'w-[80%] max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl max-h-[70vh]',
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <img
        src="/government-watermark.png"
        alt=""
        className={`${size} ${opacity} object-contain pointer-events-none select-none transition-opacity duration-300`}
        style={{
          aspectRatio: '1024 / 513',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
};

export default GlobalWatermark;
