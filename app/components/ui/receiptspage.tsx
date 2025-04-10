import React, { useContext } from "react";
import { Page } from "./Page";
import { Scroll, Sheet } from "@silk-hq/components";
import "./receiptspage.css";
import { AnimatedBaseButton } from "./animatedbasebutton";
import { SheetDismissButton } from "./Button/SheetDismissButton";
import { ReciptsHelp } from "./Sheets/RecieptsHelp/ReciptsHelp";

const ReceiptsPage = () => {
  return (
    <Page
      presentTrigger={
        <Sheet.Trigger asChild>
          <AnimatedBaseButton
          type="button"
          className=" rounded-full p-1 text-[#93979F] transition-colors duration-200 leading-0 flex items-center justify-center"
          aria-label="Open Receipts"
        >
          <box-icon name="receipt" color="#93979F" className="w-7 h-7" />
        </AnimatedBaseButton>
        </Sheet.Trigger>
        
      }
      sheetContent={
        <>
          
          
          <Scroll.Root asChild>
            <Scroll.View className="ExamplePage-scrollView">
              <Scroll.Content asChild>
                <div>
                <header
          className="sticky top-0 left-0 z-50 w-full bg-white"
          aria-label="Main Navigation"
        >
          <div className="grid h-[68px] grid-cols-[auto_1fr_auto] items-center px-6">
            <div className="justify-self-start">
            <Sheet.Trigger asChild action="dismiss">
              <AnimatedBaseButton
                type="button"
                className="rounded-full p-1 text-[#93979F] transition-colors duration-200 leading-0 flex items-center justify-center"
                aria-label="Back"
              >
                <box-icon name="chevron-left" color="#93979F" className="w-7 h-7" />
              </AnimatedBaseButton>
              </Sheet.Trigger>
            </div>

            <div className="overflow-hidden text-center">
              <h1
                className="truncate text-[1.2rem] font-semibold leading-tight select-none text-gray-900"
                title="Title"
              >
                Missing Receipts
              </h1>
            </div>

            <div className="justify-self-end">
              <ReciptsHelp></ReciptsHelp>
            </div>
          </div>
        </header>
                </div>
                
              </Scroll.Content>
            </Scroll.View>
          </Scroll.Root>
        </>
      }
    />
  );
};

export { ReceiptsPage };
