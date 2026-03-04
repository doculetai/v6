import * as React from "react"
import { widthClasses, type ContainerWidth } from "@/components/layout/tokens"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.ComponentPropsWithoutRef<"div"> {
  width?: ContainerWidth
  noPadding?: boolean
  center?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ width = "xl", noPadding = false, center = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full",
        widthClasses[width],
        !noPadding && "px-4 sm:px-6 lg:px-8",
        center && "text-center",
        className,
      )}
      {...props}
    />
  ),
)
Container.displayName = "Container"

export { Container, type ContainerProps }
