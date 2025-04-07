import React from "react";
import { motion } from "framer-motion";

interface AnimatedBaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedBaseButton = ({
  children,
  className = "",
  ...props
}: AnimatedBaseButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};