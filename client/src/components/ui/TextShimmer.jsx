import React from 'react';
import { motion } from 'motion/react';

export default function TextShimmer({
  children,
  className = '',
  duration = 2.5
}) {
  return (
    <motion.span
      className={`relative inline-block bg-[length:250%_100%] bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, currentColor 0%, rgba(255,255,255,0.95) 50%, currentColor 100%)`
      }}
      animate={{
        backgroundPosition: ['100% 0%', '-100% 0%']
      }}
      transition={{
        repeat: Infinity,
        duration: duration,
        ease: 'linear'
      }}
    >
      {children}
    </motion.span>
  );
}
