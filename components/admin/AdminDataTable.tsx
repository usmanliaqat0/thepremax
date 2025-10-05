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
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
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
                <SelectTrigger className="w-full md:w-48">
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

            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}

            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {title} ({filteredData.length})
            </CardTitle>
            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground">
                Filtered from {data.length} total
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
              <div className="overflow-x-auto">
                <Table>
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
                          <TableCell key={String(column.key)}>
                            {renderCellContent(item, column)}
                          </TableCell>
                        ))}
                        {actions && (
                          <TableCell>
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
                                            onSelect={(e) => e.preventDefault()}
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

              {/* Pagination */}
              {showPagination && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                    of {filteredData.length} results
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasNext}
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
