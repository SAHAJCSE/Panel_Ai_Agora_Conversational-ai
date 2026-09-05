'use client';

import React, { useEffect, useState, useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  pathColor = 'rgba(236, 72, 153, 0.2)',
  pathWidth = 2,
  pathOpacity = 0.35,
  gradientStartColor = '#ec4899',
  gradientStopColor = '#a855f7',
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const id = useId();
  const [pathD, setPathD] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  const updatePath = () => {
    if (!containerRef.current || !fromRef.current || !toRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const rectA = fromRef.current.getBoundingClientRect();
    const rectB = toRef.current.getBoundingClientRect();

    const svgWidth = containerRect.width;
    const svgHeight = containerRect.height;
    setSvgDimensions({ width: svgWidth, height: svgHeight });

    const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
    const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
    const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
    const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

    const controlY = startY + curvature;
    const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
    setPathD(d);
  };

  useEffect(() => {
    updatePath();
    const resizeObserver = new ResizeObserver(() => updatePath());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', updatePath);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePath);
    };
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('pointer-events-none absolute inset-0 z-0 stroke-2', className)}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        stroke={`url(#${id})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: reverse ? '100%' : '0%',
            x2: reverse ? '120%' : '-20%',
            y1: '0%',
            y2: '0%',
          }}
          animate={{
            x1: reverse ? ['100%', '-20%'] : ['-20%', '100%'],
            x2: reverse ? ['120%', '0%'] : ['0%', '120%'],
          }}
          transition={{
            delay,
            duration,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="32.5%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}

export default AnimatedBeam;
