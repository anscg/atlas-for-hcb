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

  const formatAmount = (value: string | number): string => {
    if (typeof value === 'number') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value;
  };

  return (
    <div 
      style={{
        boxShadow: `0 10px 30px -6px ${backgroundColor}40`,
        borderRadius: '22px',
        width: '100%',
        height: '7.8rem'
      }}
    >
      <Squircle
        cornerRadius={22}
        cornerSmoothing={0.7}
        style={{
          backgroundColor: backgroundColor,
        }}
        className="p-[0.8rem] w-full space-y-2 h-full pointer-events-none select-none"
      >
        <div className="mb-[0.87rem] flex h-[2.8rem] w-[2.8rem] opacity-90 bg-white items-center justify-center rounded-full">
          <img
            src={imageSrc}
            alt="Organization Icon"
            className="h-fill w-fill rounded-full object-contain select-none"
          />
        </div>

        <div className="space-y-reverse space-y-8">
          <p className="text-[1.04rem] font-regular text-white select-none">{orgName}</p>
          <p className="text-[0.832rem] opacity-50 font-light text-amount-text text-white select-none">{formatAmount(amount)}</p>
        </div>
      </Squircle>
    </div>
  );
}

export default OrgCard;
