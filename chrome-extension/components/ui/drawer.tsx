import * as React from "react"
import { cn } from "../../lib/utils"

interface DrawerContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

const useDrawer = () => {
  const context = React.useContext(DrawerContext)
  if (!context) {
    throw new Error("Drawer components must be used within a Drawer")
  }
  return context
}

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const Drawer: React.FC<DrawerProps> = ({ open, onOpenChange, children }) => {
  return (
    <DrawerContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DrawerContext.Provider>
  )
}

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "right" | "left"
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const { open } = useDrawer()

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-0 bottom-0 drawer-3d z-[99999] flex flex-col h-screen",
          side === "right" ? "right-0" : "left-0",
          className
        )}
        style={{
          width: "540px", // 固定宽度，等同于 w-96
          transform: side === "right" 
            ? open ? "translateX(0)" : "translateX(100%)"
            : open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-in-out",
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerContent.displayName = "DrawerContent"

export const DrawerHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <div className={className} {...props}>
    {children}
  </div>
)

export const DrawerTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <div className={cn("text-lg font-semibold", className)} {...props}>
    {children}
  </div>
)

export const DrawerDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <div className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </div>
)

export const DrawerClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = useDrawer()
    
    return (
      <button
        ref={ref}
        className={className}
        onClick={(e) => {
          onOpenChange(false)
          onClick?.(e)
        }}
        {...props}
      />
    )
  }
)
DrawerClose.displayName = "DrawerClose"