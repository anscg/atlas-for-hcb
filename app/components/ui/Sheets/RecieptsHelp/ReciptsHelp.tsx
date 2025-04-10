"use client";
import { Sheet } from "@silk-hq/components";
import { DetachedSheet } from "../DetachedSheet/DetachedSheet";
import "./ReciptsHelp.css";
import AnimatedBaseButton from "../../animatedbasebutton";
import { SheetDismissButton } from "../../Button/SheetDismissButton";

const ReciptsHelp = () => {
  return (
    <DetachedSheet
      presentTrigger={
        <Sheet.Trigger asChild>
        <AnimatedBaseButton
                        type="button"
                        className="rounded-full p-1 text-[#93979F] transition-colors duration-200 leading-0 flex items-center justify-center"
                        aria-label="help"
                      >
                        <box-icon name="help-circle" color="#93979F" className="w-7 h-7" />
                      </AnimatedBaseButton>
        </Sheet.Trigger>
      }
      sheetContent={
        <div className={"ExampleDetachedSheet-root relative"}>
          {/* Add SheetDismissButton in the upper-right corner */}
          <div className="absolute top-6 right-6 z-10">
            <SheetDismissButton />
          </div>
          
          <div className="ExampleDetachedSheet-illustration" />
          <div className="ExampleDetachedSheet-information">
            <Sheet.Title className="ExampleDetachedSheet-title">
              Your Meal is Coming
            </Sheet.Title>
            <Sheet.Description className="ExampleDetachedSheet-description">
              Your food is on its way and will arrive soon! Sit back and get
              ready to enjoy your meal.
            </Sheet.Description>
          </div>
          <Sheet.Trigger
            className="ExampleDetachedSheet-validateTrigger"
            action="dismiss"
          >
            Got it
          </Sheet.Trigger>
        </div>
      }
    />
  );
};

export { ReciptsHelp };