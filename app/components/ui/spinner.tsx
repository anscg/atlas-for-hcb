import React from "react";
import { cn } from "~/lib/utils";

interface SpinnerProps {
  size?: number;
  className?: string;
  color?: string;
}

export function Spinner({ size = 20, className, color = "#69717d" }: SpinnerProps) {
  // Create an array of 12 elements for the spinner blades
  const blades = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div 
      className={cn("relative inline-block", className)}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        fontSize: `${size}px`
      }}
    >
      {blades.map((i) => (
        <div
          key={i}
          className="absolute rounded-md animate-spinner-fade"
          style={{
            left: '0.4629em',
            bottom: '0',
            width: '0.085em',
            height: '0.2777em',
            backgroundColor: i === 0 ? color : 'transparent',
            transformOrigin: 'center -0.2222em',
            opacity: 0.7,
            transform: `rotate(${i * 30}deg)`,
            animationDelay: `${i * 0.083}s`,
            borderRadius: '0.5em',
          }}
        />
      ))}
    </div>
  );
}
