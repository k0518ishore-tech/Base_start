import React from 'react';

/**
 * GlobalWatermark Component
 *
 * Renders the official government building watermark positioned at the center
 * of the page with large, responsive scaling, transparent background, and soft
 * visibility matching real-world government applications.
 */
const GlobalWatermark = ({
  className = '',
  opacity = 'opacity-[0.18]',
  size = 'w-[1100px] max-w-[95vw] lg:w-[1300px] xl:w-[1450px] max-h-[85vh]',
}) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 flex items-center justify-center select-none overflow-hidden ${className}`}
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
