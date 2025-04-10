import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "~/lib/utils"
import { Spinner } from "./spinner"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
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
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
  loading?: boolean
  spinnerColor?: string
  spinnerSize?: number
}

const HeroButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, spinnerColor, spinnerSize = 20, children, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [scaleValue, setScaleValue] = React.useState(0.95);
    
    React.useEffect(() => {
      if (buttonRef.current) {
        const heightScale = 0.96;
        setScaleValue(heightScale);
      }
    }, []);

    // Determine spinner color based on variant
    const getSpinnerColor = () => {
      if (spinnerColor) return spinnerColor;
      if (variant === 'default' || variant === 'destructive') return "white";
      return "#69717d";
    }
    
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
        transition={{ type: "spring", duration: 0.15, bounce: 0 }}
        disabled={loading || props.disabled}
        {...props}
      >
        <div className="relative overflow-hidden w-full flex items-center justify-center" style={{ minHeight: "1.5rem" }}>
          <AnimatePresence mode="sync" initial={false}>
            {loading ? (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                key="spinner"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              >
                <Spinner size={spinnerSize} color={getSpinnerColor()} />
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center justify-center w-full"
                key="content"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Comp>
    )
  }
)
HeroButton.displayName = "Button"

export { HeroButton, buttonVariants }
