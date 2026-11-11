'use client';
import { animate, motion, useInView, useMotionValue, useTransform, type Variants } from 'framer-motion';
import { useEffect, useRef } from 'react';

export const spring = { type: 'spring', stiffness: 380, damping: 32 } as const;
export const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } } };
export const fadeUp: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } } };

/** Counts smoothly from the previous value to the next one. */
export function AnimatedNumber({ value, format = (n: number) => Math.round(n).toLocaleString('en-US'), className }: { value: number; format?: (n: number) => string; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, format);
  useEffect(() => { const c = animate(mv, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] }); return () => c.stop(); }, [value, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}

/** Fades content up when scrolled into view. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null); const inView = useInView(ref, { once: true, margin: '-40px' });
  return <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
