"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { SidebarNavItem } from "@/types/nav"
import { cn } from "@/lib/utils"

export interface DocSidebarNavProps {
  items: SidebarNavItem[]
}

export function DocSidebarNav({ items }: DocSidebarNavProps) {
  const pathname = usePathname()

  return items.length ? (
    <div className="w-full">
      {items.map((item, index) => (
        <div key={index} className={cn("pb-6")}>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground">{item.title}</h4>
          {item.items?.length && <DocSidebarNavItems items={item.items} pathname={pathname} />}
        </div>
      ))}
    </div>
  ) : null
}

interface DocSidebarNavItemsProps {
  items: SidebarNavItem[]
  pathname: string | null
}

export function DocSidebarNavItems({ items, pathname }: DocSidebarNavItemsProps) {
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {items.map((item, index) =>
        item.href ? (
          <Link
            key={index}
            href={item.href}
            className={cn("flex w-full items-center rounded-md p-2 hover:underline", {
              "bg-gradient-to-r from-emerald-400/10 to-green-500/10 font-medium text-emerald-600 dark:text-emerald-400":
                pathname === item.href,
              "text-muted-foreground hover:text-foreground": pathname !== item.href,
            })}
            target={item.external ? "_blank" : ""}
            rel={item.external ? "noreferrer" : ""}
          >
            {item.title}
          </Link>
        ) : (
          <span key={index} className="flex w-full cursor-not-allowed items-center rounded-md p-2 opacity-60">
            {item.title}
          </span>
        ),
      )}
    </div>
  ) : null
}
