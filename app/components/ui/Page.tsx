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
   //useA10StyleInjector();
   
   return (
      <Sheet.Root license="commercial" {...restProps}>
         {presentTrigger}
         <Sheet.Portal>
            <div className="flex flex-col items-center justify-center h-screen">
               <Sheet.View
                  className="Page-view sm:max-w-md w-screen"
                  contentPlacement="right"
                  swipeOvershoot={true}
                  nativeEdgeSwipePrevention={true}
               >
                  <Sheet.Backdrop className="Page-backdrop" />
                  <Sheet.Content className="Page-content">{sheetContent}</Sheet.Content>
               </Sheet.View>
            </div>
            
         </Sheet.Portal>
      </Sheet.Root>
   );
};

export { Page };
