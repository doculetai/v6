"use client"

import * as React from "react"
import { CaretRight } from '@/components/icons'

import { cn } from "@/lib/utils"
import { primitivesCopy } from '@/config/copy/primitives'

interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
}

interface TreeViewProps {
  data: TreeNode[]
  className?: string
  defaultExpandedIds?: string[]
  onSelect?: (id: string) => void
  selectedId?: string
}

function TreeView({
  data,
  className,
  defaultExpandedIds = [],
  onSelect,
  selectedId,
}: TreeViewProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(defaultExpandedIds)
  )

  const toggle = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <ul
      data-slot="tree-view"
      role="tree"
      className={cn("text-sm", className)}
      aria-label={primitivesCopy.ariaExtended.treeNavigation}
    >
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          expandedIds={expandedIds}
          onToggle={toggle}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </ul>
  )
}

function TreeItem({
  node,
  level,
  expandedIds,
  onToggle,
  onSelect,
  selectedId,
}: {
  node: TreeNode
  level: number
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onSelect?: (id: string) => void
  selectedId?: string
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (hasChildren) {
          onToggle(node.id)
        }
        onSelect?.(node.id)
      }
      if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
        e.preventDefault()
        onToggle(node.id)
      }
      if (e.key === "ArrowLeft" && hasChildren && isExpanded) {
        e.preventDefault()
        onToggle(node.id)
      }
    },
    [hasChildren, isExpanded, node.id, onToggle, onSelect]
  )

  return (
    <li
      data-slot="tree-item"
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      <div
        className={cn(
          "flex cursor-pointer items-center gap-1 rounded-md py-1 transition-colors hover:bg-muted/50",
          isSelected && "bg-accent text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        )}
        style={{ paddingLeft: `${level * 24 + 4}px` }}
        tabIndex={0}
        onClick={() => {
          if (hasChildren) onToggle(node.id)
          onSelect?.(node.id)
        }}
        onKeyDown={handleKeyDown}
      >
        {hasChildren ? (
          <CaretRight
            weight="duotone"
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
            aria-hidden="true"
          />
        ) : (
          <span className="size-4 shrink-0" />
        )}
        {node.icon && (
          <span className="shrink-0 text-muted-foreground [&>svg]:size-4">
            {node.icon}
          </span>
        )}
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul role="group">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export { TreeView }
export type { TreeNode, TreeViewProps }
