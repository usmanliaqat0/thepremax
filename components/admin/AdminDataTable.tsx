"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, RefreshCw, X } from "lucide-react";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T, value: unknown) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  value: string;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  confirm?: {
    title: string;
    description: string;
  };
}

export interface AdminDataTableProps<T> {
  title: string;
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  idKey?: keyof T; // Custom ID field name
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  actions?: TableAction<T>[] | ((item: T) => TableAction<T>[]);
  onRefresh?: () => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  itemsPerPage?: number;
  showPagination?: boolean;
  className?: string;
}

export function AdminDataTable<T extends Record<string, unknown>>({
  title,
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKey = "email" as keyof T,
  idKey = "_id" as keyof T,
  filters = [],
  actions = [],
  onRefresh,
  emptyMessage = "No data found",
  emptyIcon,
  itemsPerPage = 10,
  showPagination = true,
  className = "",
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchable && search.trim()) {
      filtered = filtered.filter((item) => {
        const searchValue = item[searchKey];
        return String(searchValue)
          .toLowerCase()
          .includes(search.toLowerCase().trim());
      });
    }

    // Apply filters
    filters.forEach((filter) => {
      if (filter.value !== "all") {
        filtered = filtered.filter((item) => {
          const filterValue = item[filter.key as keyof T];
          return String(filterValue) === filter.value;
        });
      }
    });

    return filtered;
  }, [data, search, filters, searchable, searchKey]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey as keyof T];
      const bValue = b[sortKey as keyof T];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage, showPagination]);

  // Pagination info
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  // Handle sorting
  const handleSort = (key: keyof T | string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter change
  const handleFilterChange = (filterKey: string, value: string) => {
    const filter = filters.find((f) => f.key === filterKey);
    if (filter) {
      filter.onChange(value);
      setCurrentPage(1); // Reset to first page when filtering
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    filters.forEach((filter) => {
      if (filter.value !== "all") {
        filter.onChange("all");
      }
    });
    setCurrentPage(1);
  };

  // Render cell content
  const renderCellContent = (item: T, column: TableColumn<T>) => {
    const value = item[column.key as keyof T];
    return column.render ? column.render(item, value) : String(value);
  };

  // Check if any filters are active
  const hasActiveFilters =
    search.trim() || filters.some((filter) => filter.value !== "all");

  return (
    <div className={className}>
      {/* Filters and Search */}
      <Card className="mb-3 sm:mb-4 lg:mb-6">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {searchable && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => handleSearchChange("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filter.value}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            <div className="flex flex-col sm:flex-row gap-2">
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}

              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">
                {title} ({filteredData.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 sm:hidden">
                Swipe to see all data • Tap cards for details
              </p>
            </div>
            {hasActiveFilters && (
              <div className="text-xs sm:text-sm text-muted-foreground">
                Filtered from {data.length} total
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-8">
              {emptyIcon}
              <p className="text-gray-500 mt-4">{emptyMessage}</p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4 p-3 pt-6">
                {paginatedData.map((item, index) => (
                  <Card
                    key={String(item[idKey])}
                    className="p-4 shadow-sm border-l-4 border-l-primary/20"
                  >
                    <div className="space-y-3">
                      {/* Mobile Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                          #{index + 1 + (currentPage - 1) * itemsPerPage}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {typeof actions === "function"
                            ? actions(item).length
                            : actions.length}{" "}
                          actions
                        </div>
                      </div>
                      {/* Mobile Card Content */}
                      {columns.map((column) => (
                        <div
                          key={String(column.key)}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2"
                        >
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {column.label}:
                          </span>
                          <div className="text-sm break-words min-w-0">
                            {renderCellContent(item, column)}
                          </div>
                        </div>
                      ))}

                      {/* Mobile Actions */}
                      {actions && (
                        <div className="pt-4 mt-3 border-t">
                          <div className="flex flex-wrap gap-2">
                            {(typeof actions === "function"
                              ? actions(item)
                              : actions
                            ).map((action, index) => (
                              <div key={index}>
                                {action.confirm ? (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant={action.variant || "outline"}
                                        size="sm"
                                        className="text-xs"
                                      >
                                        {action.icon}
                                        {action.label}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          {action.confirm.title}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {action.confirm.description}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => action.onClick(item)}
                                          className={
                                            action.variant === "destructive"
                                              ? "bg-red-600 hover:bg-red-700"
                                              : ""
                                          }
                                        >
                                          {action.label}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                ) : (
                                  <Button
                                    variant={action.variant || "outline"}
                                    size="sm"
                                    onClick={() => action.onClick(item)}
                                    className="text-xs"
                                  >
                                    {action.icon}
                                    {action.label}
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead
                            key={String(column.key)}
                            className={
                              column.sortable
                                ? "cursor-pointer hover:bg-gray-50"
                                : ""
                            }
                            onClick={() =>
                              column.sortable && handleSort(column.key)
                            }
                            style={{ width: column.width }}
                          >
                            <div className="flex items-center gap-2">
                              {column.label}
                              {column.sortable && sortKey === column.key && (
                                <span className="text-xs">
                                  {sortDirection === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </TableHead>
                        ))}
                        {actions && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((item) => (
                        <TableRow key={String(item[idKey])}>
                          {columns.map((column) => (
                            <TableCell
                              key={String(column.key)}
                              className="max-w-0 truncate"
                            >
                              <div
                                className="truncate"
                                title={String(item[column.key as keyof T])}
                              >
                                {renderCellContent(item, column)}
                              </div>
                            </TableCell>
                          ))}
                          {actions && (
                            <TableCell className="w-20 min-w-20">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {(typeof actions === "function"
                                    ? actions(item)
                                    : actions
                                  ).map((action, index) => (
                                    <div key={index}>
                                      {action.confirm ? (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                              onSelect={(e) =>
                                                e.preventDefault()
                                              }
                                              className={
                                                action.variant === "destructive"
                                                  ? "text-red-600"
                                                  : ""
                                              }
                                            >
                                              {action.icon}
                                              {action.label}
                                            </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                {action.confirm.title}
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {action.confirm.description}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>
                                                Cancel
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() =>
                                                  action.onClick(item)
                                                }
                                                className={
                                                  action.variant ===
                                                  "destructive"
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : ""
                                                }
                                              >
                                                {action.label}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => action.onClick(item)}
                                          className={
                                            action.variant === "destructive"
                                              ? "text-red-600"
                                              : ""
                                          }
                                        >
                                          {action.icon}
                                          {action.label}
                                        </DropdownMenuItem>
                                      )}
                                    </div>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {showPagination && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 sm:mt-6 p-3 sm:p-0">
                  <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                    of {filteredData.length} results
                  </p>
                  <div className="flex justify-center sm:justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!hasPrev}
                      className="text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasNext}
                      className="text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
