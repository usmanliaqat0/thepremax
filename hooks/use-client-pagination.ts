import { useState, useEffect, useMemo, useCallback } from "react";

export interface FilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

export interface UseClientPaginationOptions<T> {
  data: T[];
  itemsPerPage?: number;
  searchFields?: (keyof T)[];
  filterOptions?: FilterOption[];
  initialFilters?: Record<string, string>;
  initialSearch?: string;
}

export interface UseClientPaginationReturn<T> {
  // Data
  paginatedData: T[];
  filteredData: T[];
  allData: T[];

  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Search & Filters
  searchTerm: string;
  filters: Record<string, string>;
  activeFiltersCount: number;

  // Actions
  setSearchTerm: (term: string) => void;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refresh: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function useClientPagination<T extends Record<string, any>>({
  data,
  itemsPerPage = 10,
  searchFields = [],
  filterOptions = [],
  initialFilters = {},
  initialSearch = "",
}: UseClientPaginationOptions<T>): UseClientPaginationReturn<T> {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] =
    useState<Record<string, string>>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          }
          if (Array.isArray(value)) {
            return value.some(
              (v: unknown) =>
                typeof v === "string" && v.toLowerCase().includes(searchLower)
            );
          }
          return false;
        })
      );
    }

    // Apply filters
    filterOptions.forEach((filter) => {
      const filterValue = filters[filter.key];
      if (filterValue && filterValue !== "all") {
        result = result.filter((item) => {
          const itemValue = item[filter.key];
          if (typeof itemValue === "boolean") {
            return itemValue === (filterValue === "true");
          }
          if (typeof itemValue === "string") {
            return itemValue === filterValue;
          }
          return false;
        });
      }
    });

    return result;
  }, [data, searchTerm, filters, searchFields, filterOptions]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    const searchActive = searchTerm.trim() !== "";
    const filterActive = Object.values(filters).some(
      (value) => value && value !== "all"
    );
    return [searchActive, filterActive].filter(Boolean).length;
  }, [searchTerm, filters]);

  // Actions
  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({});
    setCurrentPage(1);
  }, []);

  const setPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    // Data refresh should be handled by parent component
  }, []);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return {
    // Data
    paginatedData,
    filteredData,
    allData: data,

    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,

    // Search & Filters
    searchTerm,
    filters,
    activeFiltersCount,

    // Actions
    setSearchTerm,
    setFilter,
    clearFilters,
    setPage,
    nextPage,
    previousPage,
    refresh,

    // Loading state
    isLoading,
    setIsLoading,
  };
}
