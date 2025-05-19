"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdvancedPaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  siblingsCount?: number
  showPageSize?: boolean
  pageSizeOptions?: number[]
  className?: string
}

export function AdvancedPagination({
  totalItems,
  itemsPerPage,
  currentPage,
  siblingsCount = 1,
  showPageSize = true,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: AdvancedPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([name, value]) => {
        newSearchParams.set(name, value)
      })

      return newSearchParams.toString()
    },
    [searchParams],
  )

  const handlePageChange = (page: number) => {
    router.push(`${pathname}?${createQueryString({ page: page.toString() })}`)
  }

  const handlePageSizeChange = (value: string) => {
    router.push(`${pathname}?${createQueryString({ page: "1", size: value })}`)
  }

  // Generate page numbers to display
  const generatePagination = () => {
    // Always show first and last page
    const firstPage = 1
    const lastPage = totalPages

    // Calculate range of pages to show around current page
    let startPage = Math.max(firstPage, currentPage - siblingsCount)
    let endPage = Math.min(lastPage, currentPage + siblingsCount)

    // Adjust if we're near the start or end
    if (currentPage <= siblingsCount + 1) {
      endPage = Math.min(firstPage + siblingsCount * 2, lastPage)
    }

    if (currentPage >= lastPage - siblingsCount) {
      startPage = Math.max(lastPage - siblingsCount * 2, firstPage)
    }

    // Generate array of page numbers
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    // Add ellipsis and edge pages
    const result = []

    // Add first page
    if (startPage > firstPage) {
      result.push(firstPage)
      if (startPage > firstPage + 1) {
        result.push("ellipsis-start")
      }
    }

    // Add middle pages
    result.push(...pages)

    // Add last page
    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        result.push("ellipsis-end")
      }
      result.push(lastPage)
    }

    return result
  }

  const paginationItems = generatePagination()

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
        <div>
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>
        {showPageSize && (
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>
        )}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) handlePageChange(currentPage - 1)
              }}
              disabled={currentPage <= 1}
            />
          </PaginationItem>

          {paginationItems.map((page, i) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            return (
              <PaginationItem key={`page-${page}`}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(page as number)
                  }}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) handlePageChange(currentPage + 1)
              }}
              disabled={currentPage >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
