import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaterRippleAnimationProps {
  isAnimating: boolean;
  originPosition: { x: number; y: number } | null;
  onAnimationComplete: () => void;
  isDarkMode: boolean; // Add this to determine animation direction
}

const WaterRippleAnimation: React.FC<WaterRippleAnimationProps> = ({
  isAnimating,
  originPosition,
  onAnimationComplete,
  isDarkMode,
}) => {
  if (!isAnimating || !originPosition) return null;

  // Calculate the maximum distance needed to cover the entire screen
  const maxDistance = Math.sqrt(
    Math.pow(Math.max(originPosition.x, window.innerWidth - originPosition.x), 2) +
    Math.pow(Math.max(originPosition.y, window.innerHeight - originPosition.y), 2)
  );

  // Different colors for different modes
  const rippleColor = isDarkMode 
    ? 'rgba(15, 23, 42, 0.9)' // Dark mode: dark slate
    : 'rgba(248, 250, 252, 0.9)'; // Light mode: light slate

  const gradientStops = isDarkMode 
    ? `radial-gradient(circle, 
        rgba(15, 23, 42, 0.9) 0%, 
        rgba(15, 23, 42, 0.7) 30%, 
        rgba(15, 23, 42, 0.4) 60%, 
        rgba(15, 23, 42, 0.1) 80%, 
        transparent 100%
      )`
    : `radial-gradient(circle, 
        rgba(248, 250, 252, 0.9) 0%, 
        rgba(248, 250, 252, 0.7) 30%, 
        rgba(248, 250, 252, 0.4) 60%, 
        rgba(248, 250, 252, 0.1) 80%, 
        transparent 100%
      )`;

  const centralGradient = isDarkMode
    ? `radial-gradient(circle, 
        rgba(15, 23, 42, 0.6) 0%, 
        rgba(15, 23, 42, 0.3) 40%, 
        rgba(15, 23, 42, 0.1) 70%, 
        transparent 100%
      )`
    : `radial-gradient(circle, 
        rgba(248, 250, 252, 0.6) 0%, 
        rgba(248, 250, 252, 0.3) 40%, 
        rgba(248, 250, 252, 0.1) 70%, 
        transparent 100%
      )`;

  const borderColor = isDarkMode 
    ? 'rgba(15, 23, 42, 0.4)' 
    : 'rgba(248, 250, 252, 0.4)';

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Multiple ripple waves for water effect */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{
                width: 0,
                height: 0,
                x: originPosition.x,
                y: originPosition.y,
                opacity: 0.8 - index * 0.2,
              }}
              animate={{
                width: maxDistance * 2.5,
                height: maxDistance * 2.5,
                x: originPosition.x - maxDistance * 1.25,
                y: originPosition.y - maxDistance * 1.25,
                opacity: 0,
              }}
              transition={{
                duration: 1.2 + index * 0.3,
                ease: [0.23, 1, 0.32, 1], // Custom cubic-bezier for water-like motion
                delay: index * 0.1,
              }}
              onAnimationComplete={index === 0 ? onAnimationComplete : undefined}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                background: gradientStops,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
          
          {/* Central ripple with different timing */}
          <motion.div
            initial={{
              width: 0,
              height: 0,
              x: originPosition.x,
              y: originPosition.y,
              opacity: 1,
            }}
            animate={{
              width: maxDistance * 3,
              height: maxDistance * 3,
              x: originPosition.x - maxDistance * 1.5,
              y: originPosition.y - maxDistance * 1.5,
              opacity: 0,
            }}
            transition={{
              duration: 1.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: centralGradient,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Surface tension effect - smaller, faster ripples */}
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={`surface-${index}`}
              initial={{
                width: 20,
                height: 20,
                x: originPosition.x - 10,
                y: originPosition.y - 10,
                opacity: 0.6,
                scale: 0.5,
              }}
              animate={{
                width: 100 + index * 40,
                height: 100 + index * 40,
                x: originPosition.x - (50 + index * 20),
                y: originPosition.y - (50 + index * 20),
                opacity: 0,
                scale: 1.5,
              }}
              transition={{
                duration: 0.8 + index * 0.2,
                ease: "easeOut",
                delay: index * 0.05,
              }}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                border: `2px solid ${borderColor}`,
                background: 'transparent',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WaterRippleAnimation;
