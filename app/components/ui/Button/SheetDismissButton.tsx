"use client";
import { VisuallyHidden } from "@silk-hq/components";
import React from "react";
import AnimatedBaseButton from "../animatedbasebutton";

const SheetDismissButton = ({ className, variant, ref, ...restProps }: any) => {
   const isSimple = variant === 'simple';
   return (
      <AnimatedBaseButton 
         className={`
            ${isSimple ? 'w-[34px] h-[34px] bg-transparent' : 'w-[32px] h-[32px] bg-white bg-opacity-20 rounded-full'}
            flex items-center justify-center p-0 border-0 appearance-none text-white
            ${className || ''}
         `}
         {...restProps} 
         ref={ref}
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isSimple ? 'w-[28px] h-[28px] stroke-[2.05px] text-white' : 'w-[18px] h-[18px] stroke-[4px]'}
         >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
         </svg>
         <VisuallyHidden.Root>Dismiss Sheet</VisuallyHidden.Root>
      </AnimatedBaseButton>
   );
};

export { SheetDismissButton };
