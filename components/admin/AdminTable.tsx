"use client";

import { useState, ReactNode } from "react";
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
import { Search, X, MoreHorizontal } from "lucide-react";

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}

export interface ActionItem<T = Record<string, unknown>> {
  key: string;
  label: string | ((item: T) => string);
  icon?: ReactNode | ((item: T) => ReactNode);
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  disabled?: (item: T) => boolean;
}

export interface AdminTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: ActionItem<T>[];
  filters?: FilterOption[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingRows?: number;
  onSearch?: (search: string) => void;
  onFilter?: (key: string, value: string) => void;
  onDelete?: (item: T) => Promise<void>;
  deleteTitle?: string;
  deleteDescription?: (item: T) => string;
  searchValue?: string;
  filterValues?: Record<string, string>;
  className?: string;
  rowKey?: (item: T) => string;
  // Pagination props
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export default function AdminTable<T = Record<string, unknown>>({
  data,
  columns,
  actions = [],
  filters = [],
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  isLoading = false,
  loadingRows = 5,
  onSearch,
  onFilter,
  onDelete,
  deleteTitle = "Delete Item",
  deleteDescription = () => `Are you sure you want to delete this item?`,
  searchValue = "",
  filterValues = {},
  className = "",
  rowKey = (item: T) =>
    String(
      (item as Record<string, unknown>)._id ||
        (item as Record<string, unknown>).id
    ),
  pagination,
}: AdminTableProps<T>) {
  const [deleteItem, setDeleteItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (item: T) => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(item);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  const clearFilters = () => {
    if (onSearch) onSearch("");
    filters.forEach((filter) => {
      if (onFilter) onFilter(filter.key, "all");
    });
  };

  const activeFiltersCount = [
    searchValue.trim() !== "",
    ...filters.map(
      (filter) => filterValues[filter.key] && filterValues[filter.key] !== "all"
    ),
  ].filter(Boolean).length;

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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(onSearch || filters.length > 0) && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {onSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-10"
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
                  value={filterValues[filter.key] || "all"}
                  onValueChange={(value) => onFilter?.(filter.key, value)}
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

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: loadingRows }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((item, index) => (
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
                              onClick={() => setDeleteItem(item)}
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
      <div className="hidden md:block border rounded-lg overflow-x-auto">
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
            {isLoading
              ? renderSkeletonRows()
              : data.length > 0
              ? data.map((item, index) => (
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
                                    onClick={() => setDeleteItem(item)}
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

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <AlertDialog
          open={!!deleteItem}
          onOpenChange={() => setDeleteItem(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteItem ? deleteDescription(deleteItem) : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteItem && handleDelete(deleteItem)}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
