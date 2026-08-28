import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
  action?: React.ReactNode
  leftAction?: React.ReactNode
}

export function SectionHeader({
  children,
  className,
  action,
  leftAction,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-gradient-to-b from-[#e6eff5] via-white to-[#e6eff5] px-4 py-2 border-t-2 border-b-2 border-[#f26522] shadow-sm transition-all flex items-center min-h-[38px]",
        className
      )}
      {...props}
    >
      {/* Absolute Dead-Center Heading Title */}
      <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center text-center pointer-events-none px-12">
        <div className="font-sans font-bold text-sm sm:text-base text-[#135d86] tracking-wide flex items-center justify-center gap-2 pointer-events-auto">
          {children}
        </div>
      </div>

      {/* Left Action Container */}
      <div className="relative z-10 flex items-center gap-2 shrink-0 mr-auto">
        {leftAction}
      </div>

      {/* Right Action Container */}
      <div className="relative z-10 flex items-center gap-2 shrink-0 ml-auto">
        {action}
      </div>
    </div>
  )
}
