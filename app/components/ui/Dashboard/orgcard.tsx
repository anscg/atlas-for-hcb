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
  
  React.useEffect(() => {
    if (cardRef.current) {
      const updateCardHeight = () => {
        const height = cardRef.current?.clientHeight || 112;
        document.documentElement.style.setProperty('--card-height', `${height}`);
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
        borderRadius: '22px',
        width: '100%',
        aspectRatio: '165/112', // Set aspect ratio of width:height as 165:112
      }}
      className="relative"
    >
      <Squircle
        cornerRadius={22}
        cornerSmoothing={0.7}
        style={{
          backgroundColor: backgroundColor,
          fontSize: '1px', // Base font size for calculations
        }}
        className="p-[0.8rem] w-full h-full pointer-events-none select-none flex flex-col"
      >
        <div className="mb-[0.87rem] flex h-[2.8rem] w-[2.8rem] opacity-90 bg-white items-center justify-center rounded-full">
          <img
            src={imageSrc}
            alt="Organization Icon"
            className="h-fill w-fill rounded-full object-contain select-none"
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
