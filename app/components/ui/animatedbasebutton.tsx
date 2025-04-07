"use client";

import { motion } from "framer-motion";
import React from "react";

type AnimatedBaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const AnimatedBaseButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedBaseButtonProps
>(({ children, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.87 }}
      transition={{ type: "spring", duration: 0.15, bounce: 0 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

AnimatedBaseButton.displayName = "AnimatedBaseButton";

export default AnimatedBaseButton;
