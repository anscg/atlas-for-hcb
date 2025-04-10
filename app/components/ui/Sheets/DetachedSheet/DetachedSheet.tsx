"use client";
import React from "react";
import { Sheet, SheetViewProps, useClientMediaQuery } from "@silk-hq/components";
import "./DetachedSheet.css";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
   presentTrigger: React.ReactNode;
   sheetContent: React.ReactNode;
}

const DetachedSheet = ({ presentTrigger, sheetContent, ...restProps }: Props) => {
   const largeViewport = useClientMediaQuery("(min-width: 650px)");
   const contentPlacement = "bottom";

   return (
      <Sheet.Root license="commercial" {...restProps}>
         {presentTrigger}
         <Sheet.Portal>
            <Sheet.View
               className={`DetachedSheet-view`}
               swipeOvershoot={true}
               nativeEdgeSwipePrevention={true}
            >
                <div className="flex flex-col justify-center items-center h-full w-screen">
                <div className="sm:max-w-md w-screen h-full clippery">
               <Sheet.Backdrop
               />
               <Sheet.Content className="DetachedSheet-content sm:max-w-md w-screen">
                  <div className="DetachedSheet-innerContent">{sheetContent}</div>
               </Sheet.Content>
               </div>
               </div>
            </Sheet.View>
         </Sheet.Portal>
      </Sheet.Root>
   );
};

export { DetachedSheet };
