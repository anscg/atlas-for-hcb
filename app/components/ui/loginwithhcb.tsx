import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import HCBLogo from "../../icons/HCBoutline.svg"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl text-m transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 w-full",
  {
    variants: {
      variant: {
        default:
          "bg-stone-800 text-stone-50 hover:bg-stone-700",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-6 py-5",
        sm: "h-10 rounded-lg px-3 text-base",
        lg: "h-16 rounded-2xl px-10 text-xl",
        icon: "h-11 w-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [scaleValue, setScaleValue] = React.useState(0.95);
    
    React.useEffect(() => {
      if (buttonRef.current) {
        const heightScale = 0.96;
        setScaleValue(heightScale);
      }
    }, []);
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={(node) => {
          // Handle both refs
          buttonRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        whileTap={{ scale: scaleValue }}
        transition={{ 
          type: "spring", 
          stiffness: 700, 
          damping: 40,
        }}
        {...props}
      >
        <img  src={HCBLogo} alt="HCB Logo" className="w-5 h-5 invert brightness-100 opacity-80" />
        <span className="font-semibold opacity-95">Continue with HCB</span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
