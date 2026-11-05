'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ByteFoxProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export function ByteFox({ size = 'md', className, animated = true }: ByteFoxProps) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const animationVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
  };

  const bounceVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 0, -10],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  const Component = animated ? motion.div : 'div';
  const motionProps = animated
    ? {
        variants: animationVariants,
        initial: 'initial',
        animate: 'animate',
        whileHover: 'hover',
      }
    : {};

  return (
    <Component className={cn('relative', sizes[size], className)} {...motionProps}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Fox Body */}
        <motion.ellipse
          cx="50"
          cy="55"
          rx="28"
          ry="25"
          fill="#FF6B35"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />

        {/* Fox Head */}
        <motion.ellipse
          cx="50"
          cy="35"
          rx="22"
          ry="20"
          fill="#FF6B35"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        />

        {/* Ears */}
        <motion.polygon
          points="30,20 25,5 40,18"
          fill="#FF6B35"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        />
        <motion.polygon
          points="70,20 75,5 60,18"
          fill="#FF6B35"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        />

        {/* Inner Ears */}
        <motion.polygon
          points="30,20 27,10 38,18"
          fill="#FFB385"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        />
        <motion.polygon
          points="70,20 73,10 62,18"
          fill="#FFB385"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        />

        {/* White Face Markings */}
        <motion.path
          d="M 50 35 Q 65 35 70 45 Q 50 55 30 45 Q 35 35 50 35"
          fill="#FFFFFF"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        />

        {/* Eyes */}
        <motion.circle
          cx="42"
          cy="32"
          r="4"
          fill="#1A1A2E"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.2 }}
        />
        <motion.circle
          cx="58"
          cy="32"
          r="4"
          fill="#1A1A2E"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.2 }}
        />

        {/* Eye Highlights */}
        <motion.circle
          cx="43"
          cy="31"
          r="1.5"
          fill="#FFFFFF"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, duration: 0.2 }}
        />
        <motion.circle
          cx="59"
          cy="31"
          r="1.5"
          fill="#FFFFFF"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, duration: 0.2 }}
        />

        {/* Nose */}
        <motion.ellipse
          cx="50"
          cy="42"
          rx="3"
          ry="2"
          fill="#1A1A2E"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, duration: 0.2 }}
        />

        {/* Tail */}
        <motion.path
          d="M 78 60 Q 95 45 90 25 Q 85 15 75 20"
          stroke="#FF6B35"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        />

        {/* Tail Tip */}
        <motion.ellipse
          cx="90"
          cy="25"
          rx="5"
          ry="4"
          fill="#FFFFFF"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
        />

        {/* Code Accents */}
        <motion.text
          x="50"
          y="75"
          textAnchor="middle"
          fill="#6366F1"
          fontSize="8"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          &lt;/&gt;
        </motion.text>
      </svg>

      {animated && (
        <motion.div
          className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl"
          variants={bounceVariants}
          initial="initial"
          animate="animate"
        />
      )}
    </Component>
  );
}
