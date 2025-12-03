import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children, ...props }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <div className="relative inline-block text-left" {...props}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { open, setOpen })
          : child
      )}
    </div>
  )
}

const DropdownMenuTrigger = React.forwardRef(({ children, asChild, open, setOpen, ...props }, ref) => {
  const handleClick = () => setOpen(!open)
  
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
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(
  ({ className, align = "center", children, open, setOpen, ...props }, ref) => {
    const contentRef = React.useRef(null)

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (contentRef.current && !contentRef.current.contains(event.target)) {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [open, setOpen])

    if (!open) return null

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          align === "end" && "right-0",
          align === "start" && "left-0",
          "mt-2",
          className
        )}
        {...props}
      >
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child, { setOpen })
            : child
        )}
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(
  ({ className, setOpen, onClick, ...props }, ref) => {
    const handleClick = (e) => {
      onClick?.(e)
      setOpen?.(false)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
