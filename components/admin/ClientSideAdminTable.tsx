"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useClientPagination,
  FilterOption,
} from "@/hooks/use-client-pagination";

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
}

export interface ActionItem<T = Record<string, unknown>> {
  key: string;
  label: string | ((item: T) => string);
  icon?: ReactNode | ((item: T) => ReactNode);
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  disabled?: (item: T) => boolean;
}

export interface ClientSideAdminTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: ActionItem<T>[];
  filters?: FilterOption[];
  searchFields?: (keyof T)[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingRows?: number;
  onDelete?: (item: T) => Promise<void>;
  deleteTitle?: string;
  deleteDescription?: (item: T) => string;
  className?: string;
  rowKey?: (item: T) => string;
  itemsPerPage?: number;
  onDataChange?: (data: T[]) => void;
  isLoading?: boolean;
}

export default function ClientSideAdminTable<
  T extends Record<string, unknown> = Record<string, unknown>
>({
  data,
  columns,
  actions = [],
  filters = [],
  searchFields = [],
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  loadingRows = 5,
  onDelete,
  deleteTitle = "Delete Item",
  className = "",
  rowKey = (item: T) =>
    String(
      (item as Record<string, unknown>)._id ||
        (item as Record<string, unknown>).id
    ),
  itemsPerPage = 10,
  isLoading = false,
}: ClientSideAdminTableProps<T>) {
  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    searchTerm,
    filters: currentFilters,
    activeFiltersCount,
    setSearchTerm,
    setFilter,
    clearFilters,
    setPage,
    nextPage,
    previousPage,
    isLoading: internalLoading,
  } = useClientPagination({
    data,
    itemsPerPage,
    searchFields,
    filterOptions: filters,
  });

  // Use parent loading state if provided, otherwise use internal loading state
  const isTableLoading = isLoading || internalLoading;

  const renderSkeletonRows = () => {
    return Array.from({ length: loadingRows }).map((_, i) => (
      <TableRow key={i}>
        {columns.map((column, colIndex) => (
          <TableCell key={colIndex}>
            <div className="h-4 bg-muted animate-pulse rounded w-24" />
          </TableCell>
        ))}
        {actions.length > 0 && (
          <TableCell>
            <div className="h-4 bg-muted animate-pulse rounded w-8" />
          </TableCell>
        )}
      </TableRow>
    ));
  };

  const renderEmptyState = () => (
    <TableRow>
      <TableCell
        colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
        className="text-center py-8"
      >
        <div className="text-muted-foreground">{emptyMessage}</div>
      </TableCell>
    </TableRow>
  );

  const renderPaginationInfo = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} results
          {activeFiltersCount > 0 && (
            <span className="ml-2">(filtered from {data.length} total)</span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(searchFields.length > 0 || filters.length > 0) && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {searchFields.length > 0 && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isTableLoading}
                />
              </div>
            )}

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Clear ({activeFiltersCount})
                </span>
                <span className="sm:hidden">Clear</span>
              </Button>
            )}
          </div>

          {filters.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  value={currentFilters[filter.key] || "all"}
                  onValueChange={(value) => setFilter(filter.key, value)}
                  disabled={isTableLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {filter.label}</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile View */}
      <div className="block md:hidden space-y-3 relative">
        {isTableLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </div>
        )}
        {isTableLoading ? (
          Array.from({ length: loadingRows }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
            </div>
          ))
        ) : paginatedData.length > 0 ? (
          paginatedData.map((item, index) => (
            <div key={rowKey(item)} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  {columns.slice(0, 2).map((column) => (
                    <div key={column.key} className="mb-2 last:mb-0">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {column.header}
                      </div>
                      <div className="text-sm">
                        {column.render
                          ? column.render(item, index)
                          : String(
                              (item as Record<string, unknown>)[column.key] ||
                                ""
                            )}
                      </div>
                    </div>
                  ))}
                </div>
                {actions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action) => {
                        const label =
                          typeof action.label === "function"
                            ? action.label(item)
                            : action.label;
                        const icon =
                          typeof action.icon === "function"
                            ? action.icon(item)
                            : action.icon;

                        if (action.key === "delete" && onDelete) {
                          return (
                            <DropdownMenuItem
                              key={action.key}
                              onClick={() => {
                                /* Handle delete */
                              }}
                              disabled={action.disabled?.(item)}
                              className="text-destructive"
                            >
                              {icon}
                              {label}
                            </DropdownMenuItem>
                          );
                        }
                        return (
                          <DropdownMenuItem
                            key={action.key}
                            onClick={() => action.onClick(item)}
                            disabled={action.disabled?.(item)}
                            className={
                              action.variant === "destructive"
                                ? "text-destructive"
                                : ""
                            }
                          >
                            {icon}
                            {label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {columns.length > 2 && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  {columns.slice(2).map((column) => (
                    <div key={column.key}>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {column.header}
                      </div>
                      <div className="text-sm">
                        {column.render
                          ? column.render(item, index)
                          : String(
                              (item as Record<string, unknown>)[column.key] ||
                                ""
                            )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-x-auto relative">
        {isTableLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </div>
        )}
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.width}>
                  {column.header}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-[50px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTableLoading
              ? renderSkeletonRows()
              : paginatedData.length > 0
              ? paginatedData.map((item, index) => (
                  <TableRow key={rowKey(item)}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="whitespace-nowrap">
                        {column.render
                          ? column.render(item, index)
                          : String(
                              (item as Record<string, unknown>)[column.key] ||
                                ""
                            )}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action) => {
                              const label =
                                typeof action.label === "function"
                                  ? action.label(item)
                                  : action.label;
                              const icon =
                                typeof action.icon === "function"
                                  ? action.icon(item)
                                  : action.icon;

                              if (action.key === "delete" && onDelete) {
                                return (
                                  <DropdownMenuItem
                                    key={action.key}
                                    onClick={() => {
                                      /* Handle delete */
                                    }}
                                    disabled={action.disabled?.(item)}
                                    className="text-destructive"
                                  >
                                    {icon}
                                    {label}
                                  </DropdownMenuItem>
                                );
                              }
                              return (
                                <DropdownMenuItem
                                  key={action.key}
                                  onClick={() => action.onClick(item)}
                                  disabled={action.disabled?.(item)}
                                  className={
                                    action.variant === "destructive"
                                      ? "text-destructive"
                                      : ""
                                  }
                                >
                                  {icon}
                                  {label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              : renderEmptyState()}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && <div className="mt-6">{renderPaginationInfo()}</div>}

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {/* This would need to be managed with state */}
                Are you sure you want to delete this item?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isTableLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isTableLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isTableLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
