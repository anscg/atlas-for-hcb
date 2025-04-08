"use client";
import React from 'react';
import { Squircle } from 'corner-smoothing';

interface OrgCardProps {
  imageSrc: string;
  orgName: string;
  amount: string | number;
  backgroundColor?: string;
}

function OrgCard({ imageSrc, orgName, amount, backgroundColor = '#F96262' }: OrgCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [cornerRadius, setCornerRadius] = React.useState(20);
  
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

  const formatAmount = (value: string | number): string => {
    if (typeof value === 'number') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value;
  };

  return (
    <div 
      ref={cardRef}
      style={{
        boxShadow: `0 10px 30px -6px ${backgroundColor}40`,
        borderRadius: `calc(20 * var(--card-height, 112) / 112 * 1px)`,
        width: '100%',
        aspectRatio: '165/112', // Set aspect ratio of width:height as 165:112
      }}
      className="relative"
    >
      <Squircle
        cornerRadius={cornerRadius}
        cornerSmoothing={0.7}
        style={{
          backgroundColor: backgroundColor,
          fontSize: '1px', // Base font size for calculations
          padding: 'calc(12 * var(--card-height, 112) / 112 * 1px)',
        }}
        className="w-full h-full pointer-events-none select-none flex flex-col"
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
            {orgName}
          </p>
          <p className="opacity-50 font-light text-white select-none" 
             style={{ fontSize: 'calc(12 * (100% * var(--card-height, 112) / 112))', lineHeight: '1.2' }}>
            {formatAmount(amount)}
          </p>
        </div>
      </Squircle>
    </div>
  );
}

export default OrgCard;
