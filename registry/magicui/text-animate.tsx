'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TextAnimateProps {
  children: React.ReactNode;
  animation?: 'blurIn' | 'fadeIn' | 'slideUp' | 'scaleUp';
  by?: 'word' | 'character' | 'line';
  as?: React.ElementType;
  className?: string;
  delay?: number;
  duration?: number;
}

export function TextAnimate({
  children,
  animation = 'blurIn',
  by = 'word',
  as: Component = 'div',
  className,
  delay = 0,
  duration = 0.4,
}: TextAnimateProps) {
  if (typeof children !== 'string') {
    return (
      <Component className={className}>
        {children}
      </Component>
    );
  }

  const normalizedText = children.replace(/\s+/g, ' ').trim();
  const words = normalizedText.split(' ');

  const variants = {
    blurIn: {
      hidden: { filter: 'blur(10px)', opacity: 0, y: 12 },
      visible: { filter: 'blur(0px)', opacity: 1, y: 0 },
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    scaleUp: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: by === 'character' ? 0.03 : 0.07,
        delayChildren: delay,
      },
    },
  };

  const MotionComponent: React.ComponentType<any> =
    typeof Component === 'string' && (motion as any)[Component]
      ? (motion as any)[Component]
      : (motion.div as any);

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={containerVariants}
      className={cn(Component === 'span' ? 'inline-block' : 'block', className)}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap" style={{ marginRight: '0.35em' }}>
          {by === 'character' ? (
            word.split('').map((char, charIdx) => (
              <motion.span
                key={charIdx}
                variants={variants[animation]}
                transition={{ duration }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))
          ) : (
            <motion.span
              variants={variants[animation]}
              transition={{ duration }}
              className="inline-block"
            >
              {word}
            </motion.span>
          )}
        </span>
      ))}
    </MotionComponent>
  );
}

export default TextAnimate;
