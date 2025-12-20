import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown, Check } from "lucide-react"

const SelectContext = React.createContext({
  value: '',
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  displayValue: ''
})

const Select = ({ children, value, onValueChange }) => {
  const [open, setOpen] = React.useState(false)
  const [displayValue, setDisplayValue] = React.useState('')
  
  React.useEffect(() => {
    // Find the display text for the selected value from children
    const findDisplayValue = (children) => {
      let found = ''
      React.Children.forEach(children, (child) => {
        if (child && child.type === SelectContent) {
          React.Children.forEach(child.props.children, (item) => {
            if (item && item.props && item.props.value === value) {
              found = item.props.children
            }
          })
        }
      })
      return found
    }
    
    const display = findDisplayValue(children)
    setDisplayValue(display)
  }, [value, children])
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, displayValue }}>
      {children}
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext)
  
  return (
    <button
      ref={ref}
      type="button"
      role="combobox"
      aria-expanded={open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ placeholder, ...props }, ref) => {
  const { displayValue } = React.useContext(SelectContext)
  
  return (
    <span ref={ref} {...props}>
      {displayValue || placeholder}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext)
  const contentRef = React.useRef(null)
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])
  
  if (!open) return null
  
  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext)
  const isSelected = selectedValue === value
  
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent/50",
        className
      )}
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
