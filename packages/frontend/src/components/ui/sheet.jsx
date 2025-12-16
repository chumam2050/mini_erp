import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = ({ children, open, onOpenChange }) => {
  return (
    <>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { open, onOpenChange })
          : child
      )}
    </>
  )
}

const SheetTrigger = React.forwardRef(
  ({ children, asChild, open, onOpenChange, ...props }, ref) => {
    const handleClick = () => onOpenChange?.(!open)

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ref,
        onClick: handleClick,
      })
    }

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

const SheetContent = React.forwardRef(
  ({ side = "right", className, children, open, onOpenChange, ...props }, ref) => {
    const contentRef = React.useRef(null)

    React.useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === "Escape" && open) {
          onOpenChange?.(false)
        }
      }

      if (open) {
        document.addEventListener("keydown", handleEscape)
        document.body.style.overflow = "hidden"
        return () => {
          document.removeEventListener("keydown", handleEscape)
          document.body.style.overflow = "unset"
        }
      }
    }, [open, onOpenChange])

    if (!open) return null

    const sideClasses = {
      top: "inset-x-0 top-0 border-b",
      bottom: "inset-x-0 bottom-0 border-t",
      left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
      right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
    }

    const content = (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => onOpenChange?.(false)}
        />
        
        {/* Sheet Content */}
        <div
          ref={contentRef}
          className={cn(
            "fixed z-50 overflow-y-auto bg-background p-6 shadow-xl border",
            sideClasses[side],
            className
          )}
          {...props}
        >
          {children}
          <button
            onClick={() => onOpenChange?.(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </>
    )

    return createPortal(content, document.body)
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
}
