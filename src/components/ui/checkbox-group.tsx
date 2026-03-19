"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface CheckboxGroupItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface CheckboxGroupProps {
  legend?: string
  items: CheckboxGroupItem[]
  value: string[]
  onValueChange: (value: string[]) => void
  className?: string
}

function CheckboxGroup({
  legend,
  items,
  value,
  onValueChange,
  className,
}: CheckboxGroupProps) {
  const handleToggle = React.useCallback(
    (itemValue: string, checked: boolean) => {
      if (checked) {
        onValueChange([...value, itemValue])
      } else {
        onValueChange(value.filter((v) => v !== itemValue))
      }
    },
    [value, onValueChange]
  )

  return (
    <fieldset data-slot="checkbox-group" className={cn("space-y-3", className)}>
      {legend && (
        <legend className="text-sm font-medium text-foreground">
          {legend}
        </legend>
      )}
      <div className="space-y-2">
        {items.map((item) => {
          const id = `checkbox-group-${item.value}`
          return (
            <div key={item.value} className="flex items-start gap-3">
              <Checkbox
                id={id}
                checked={value.includes(item.value)}
                onCheckedChange={(checked) =>
                  handleToggle(item.value, checked === true)
                }
                disabled={item.disabled}
                className="mt-0.5"
              />
              <label htmlFor={id} className="space-y-0.5 cursor-pointer">
                <span className="block text-sm font-medium text-foreground">
                  {item.label}
                </span>
                {item.description && (
                  <span className="block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

export { CheckboxGroup }
export type { CheckboxGroupProps, CheckboxGroupItem }
