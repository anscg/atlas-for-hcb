"use client";
import { Sheet } from "@silk-hq/components";
import { DetachedSheet } from "../DetachedSheet/DetachedSheet";
import "./ReciptsHelp.css";
import AnimatedBaseButton from "../../animatedbasebutton";
import { SheetDismissButton } from "../../Button/SheetDismissButton";
import Rive from "@rive-app/react-canvas";
import { HeroButton } from "../../herobutton";


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
        <div className={"relative"}>
          <div className="absolute top-6 right-6 z-10" style={{ transform: 'translateZ(0)' }}
          >
          <Sheet.Trigger asChild action="dismiss">
            <SheetDismissButton />
          </Sheet.Trigger>
          </div>
          <div className="flex bg-[#F4B000] items-center justify-center pointer-events-none relative">
            <Rive 
              src="animations/receipts.riv" 
              stateMachines="State Machine 1" 
              style={{ 
                width: '100%', 
                aspectRatio: '438/235',
                zIndex: 0,
                //maxWidth: '101%',
                //display: 'block',
                //margin: 'auto'
              }} 
            />
            <div className="absolute bottom-6 left-9 leading-snug z-10 text-white" style={{ transform: 'translateZ(0)' }}
            >
              <p className="font-semibold text-[24px] select-none">About Receipts</p>
              <p className="opacity-80 font-regular text-[17px] select-none">Learn more about receipts.</p>
            </div>
          </div>
          <div className="p-[1.2rem] flex justify-center gap-7 flex-col">
            <div className="font-medium px-3 pt-3 text-[#999] space-y-5 leading-[1.3] text-[1.04rem]">
              <p className="select-none">
                Since HCB have a requirement with the IRS to show all our receipts 
                and your organization is underneath ours through fiscal sponsorship, 
                we ask you to upload all your receipts for funds that leave your 
                HCB account.
              </p>
              <p className="select-none">
              Please try to upload these receipts as soon as possible. 
              This receipt could be a screenshot, download email, 
              or a picture of a physical receipts. 
              </p>
              <a href="http://help.hcb.hackclub.com/article/28-how-do-i-upload-receipts" className="opacity-100 text-[#33B9F2] select-none" >Learn more.</a>
            </div>
          <Sheet.Trigger asChild action="dismiss">
          <HeroButton variant="default"
            className="w-full shadow-none rounded-full h-[3.1rem] bg-[#F4B000] hover:bg-[#F4B000] py-6 text-white font-medium text-lg">
            Got It
          </HeroButton>
          </Sheet.Trigger>
          </div>
        </div>
      }
    />
  );
};

export { ReciptsHelp };