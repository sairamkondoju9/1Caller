import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'motion/react';

export default function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className = '',
  decimalPlaces = 0,
  prefix = '',
  suffix = ''
}) {
  const ref = useRef(null);
  const motionVal = useMotionValue(direction === 'down' ? value : 0);
  const springVal = useSpring(motionVal, {
    damping: 30,
    stiffness: 120
  });

  const display = useTransform(springVal, (current) => {
    return `${prefix}${current.toLocaleString('en-IN', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    })}${suffix}`;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      motionVal.set(value);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay, motionVal]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <span
      ref={ref}
      className={`inline-block tabular-nums font-mono tracking-tight ${className}`}
    >
      {prefix}{Number(value).toLocaleString('en-IN', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      })}{suffix}
    </span>
  );
}
