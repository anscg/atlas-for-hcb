"use client";
import { Sheet } from "@silk-hq/components";
import "./Page.css";
import React from "react";
import useA10StyleInjector from "../../hooks/useA10StyleInjector";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
   presentTrigger: React.ReactNode;
   sheetContent: React.ReactNode;
}

const Page = ({ presentTrigger, sheetContent, ...restProps }: Props) => {
   useA10StyleInjector();
   
   return (
      <Sheet.Root license="non-commercial" {...restProps}>
         {presentTrigger}
         <Sheet.Portal>
               <Sheet.View
                  className="Page-view"
                  contentPlacement="right"
                  swipeOvershoot={false}
                  nativeEdgeSwipePrevention={true}
               >
                  
                  <div className="flex flex-col justify-center items-center h-screen w-screen">
                  <Sheet.Outlet
                          travelAnimation={{ opacity: [0, 1] }}
                          className="z-40 absolute top-0 left-1/2 transform -translate-x-1/2 sm:max-w-md w-screen"
                        >
                          <div className="flex justify-between items-center h-[68px] px-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-50">
                            <Sheet.Trigger 
                              className="flex items-center text-lime-500 text-base font-normal focus:outline-none" 
                              action="dismiss"
                            >
                              <span className="text-2xl mr-0.5">‹</span>
                              <span>Home</span>
                            </Sheet.Trigger>
                            <h1 className="text-center text-base text-2xl font-semibold flex-grow mx-2">Receipts</h1>
                            <div className="w-10"></div> {/* Placeholder for balance */}
                          </div>
                        </Sheet.Outlet>
                     <div className="sm:max-w-md w-screen h-screen clippery">
                        
                        
                        <Sheet.Content className="Page-content sm:max-w-md w-screen">{sheetContent}</Sheet.Content>
                        <Sheet.Backdrop className="Page-backdrop" />
                     </div>
                  </div>
                  
               </Sheet.View>
         </Sheet.Portal>
      </Sheet.Root>
   );
};

export { Page };
