"use client";
import React, { useCallback } from 'react';
import { Squircle } from 'corner-smoothing';
import { motion } from 'framer-motion';

interface OrgCardProps {
  imageSrc: string;
  orgName: string;
  amount: string | number;
  backgroundColor?: string;
}

function OrgCard({ imageSrc, orgName, amount, backgroundColor = '#F96262' }: OrgCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [cornerRadius, setCornerRadius] = React.useState(20);
  const [isAmountLoaded, setIsAmountLoaded] = React.useState(false);
  
  React.useEffect(() => {
    if (cardRef.current) {
      const updateCardHeight = () => {
        const height = cardRef.current?.clientHeight || 112;
        document.documentElement.style.setProperty('--card-height', `${height}`);
        // Calculate corner radius based on height
        setCornerRadius(Math.max(5, 20 * (height / 112)));
      };
      
      updateCardHeight();
      window.addEventListener('resize', updateCardHeight);
      
      return () => {
        window.removeEventListener('resize', updateCardHeight);
      };
    }
  }, []);
  
  React.useEffect(() => {
    if (amount !== undefined && amount !== null) {
      const timer = setTimeout(() => {
        setIsAmountLoaded(true);
      }, 300); // Short delay before showing the amount
      
      return () => clearTimeout(timer);
    }
  }, [amount]);

  const formatAmount = (value: string | number): string => {
    if (typeof value === 'number') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value;
  };

  const truncateOrgName = (name: string, maxLength: number = 17): string => {
    if (name.length <= maxLength) {
      return name;
    }
    return `${name.substring(0, maxLength - 3)}...`;
  };

  // Add pointer move handler for glow effect
  const pointerMoveHandler = useCallback((event: React.PointerEvent) => {
    if (!cardRef.current || event.pointerType !== "mouse") return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    cardRef.current.style.setProperty("--xPos", `${x}px`);
    cardRef.current.style.setProperty("--yPos", `${y}px`);
  }, []);

  return (
    <motion.div 
      ref={cardRef}
      whileTap={{ 
        scale: 0.95, 
        transition: { type: "spring", bounce: 0, duration: 0.1 } 
      }}
      onPointerMove={pointerMoveHandler}
      style={{
        boxShadow: `0 10px 30px -6px ${backgroundColor}40`,
        borderRadius: `calc(20 * var(--card-height, 112) / 112 * 1px)`,
        width: '100%',
        aspectRatio: '165/112', // Set aspect ratio of width:height as 165:112
        position: 'relative', // Ensure positioned for the glow effect
        '--xPos': '50%',
        '--yPos': '50%',
      } as React.CSSProperties}
      className="relative group"
    >
      <Squircle
        cornerRadius={cornerRadius}
        cornerSmoothing={0.77}
        style={{
          backgroundColor: backgroundColor,
          fontSize: '1px', // Base font size for calculations
          padding: 'calc(12 * var(--card-height, 112) / 112 * 1px)',
        }}
        className="w-full h-full select-none flex flex-col"
      >
        <div 
          className="flex items-center justify-center rounded-full bg-white opacity-90"
          style={{ 
            height: 'calc(40 * var(--card-height, 112) / 112 * 1px)', 
            width: 'calc(40 * var(--card-height, 112) / 112 * 1px)',
            marginBottom: 'calc(10 * var(--card-height, 112) / 112 * 1px)'
          }}
        >
          <img
            src={imageSrc}
            alt="Organization Icon"
            className="rounded-full object-contain select-none"
            style={{ 
              height: 'calc(40 * var(--card-height, 112) / 112 * 1px)', 
              width: 'calc(40 * var(--card-height, 112) / 112 * 1px)'
            }}
          />
        </div>

        <div className="mt-auto space-y-1">
          <p className="text-white select-none font-medium" 
             style={{ fontSize: 'calc(15 * (100% * var(--card-height, 112) / 112))', lineHeight: '1.2' }}>
            {truncateOrgName(orgName)}
          </p>
          <div style={{ height: 'calc(14.5 * var(--card-height, 112) / 112 * 1px)' }}>
            {amount !== undefined && amount !== null ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: isAmountLoaded ? 0.5 : 0 }}
                transition={{ duration: 0.2 }}
                className="font-light text-white select-none" 
                style={{ fontSize: 'calc(12 * (100% * var(--card-height, 112) / 112))', lineHeight: '1.2' }}
              >
                {formatAmount(amount)}
              </motion.p>
            ) : (
              <motion.div 
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-16 bg-white bg-opacity-20 animate-pulse rounded"
                style={{ height: 'calc(14.5 * var(--card-height, 112) / 112 * 1px)' }}
              >
              </motion.div>
            )}
          </div>
        </div>
      </Squircle>
      
      {/* Add the glow effect div */}
      <div 
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none"
        style={{
          background: `radial-gradient(1000px circle at var(--xPos) var(--yPos), rgba(255, 255, 255, 0.33), transparent 35%)`,
          borderRadius: `calc(20 * var(--card-height, 112) / 112 * 1px)`,
        }}
      />
    </motion.div>
  );
}

export default OrgCard;
