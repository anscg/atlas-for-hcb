import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      className={`w-full ${className}`}
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
}