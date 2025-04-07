"use client";
import { Sheet } from "@silk-hq/components";
import "./page.css";
import React from "react";
import useA10StyleInjector from "../../hooks/useA10StyleInjector";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
   presentTrigger: React.ReactNode;
   sheetContent: React.ReactNode;
}

const Page = ({ presentTrigger, sheetContent, ...restProps }: Props) => {
   useA10StyleInjector();
   
   return (
      <Sheet.Root license="commercial" {...restProps}>
         {presentTrigger}
         <Sheet.Portal>
               <Sheet.View
                  className="Page-view"
                  contentPlacement="right"
                  swipeOvershoot={false}
                  nativeEdgeSwipePrevention={true}
               >
                  
                  <div className="flex flex-col justify-center items-center h-screen w-screen">
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
