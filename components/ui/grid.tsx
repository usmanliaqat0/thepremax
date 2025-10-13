import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg" | "xl";
  minItemWidth?: string;
}

export function ResponsiveGrid({
  children,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  minItemWidth,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  };

  const getColumnClasses = () => {
    const classes = ["grid"];

    if (minItemWidth) {
      classes.push(`grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`);
    } else {
      if (columns.sm) classes.push(`grid-cols-${columns.sm}`);
      if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
      if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
      if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    }

    return classes.join(" ");
  };

  return (
    <div className={cn(getColumnClasses(), gapClasses[gap], className)}>
      {children}
    </div>
  );
}

interface ProductGridWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: "compact" | "comfortable" | "spacious";
}

export function ProductGridWrapper({
  children,
  className,
  variant = "comfortable",
}: ProductGridWrapperProps) {
  const variants = {
    compact: {
      grid: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
      gap: "gap-3 md:gap-4",
    },
    comfortable: {
      grid: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      gap: "gap-4 sm:gap-6",
    },
    spacious: {
      grid: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3",
      gap: "gap-4 sm:gap-8",
    },
  };

  const variantStyles = variants[variant];

  return (
    <div
      className={cn("grid", variantStyles.grid, variantStyles.gap, className)}
    >
      {children}
    </div>
  );
}

interface GridItemProps {
  children: ReactNode;
  className?: string;
  span?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function GridItem({ children, className, span }: GridItemProps) {
  const getSpanClasses = () => {
    if (!span) return "";

    const classes = [];
    if (span.sm) classes.push(`col-span-${span.sm}`);
    if (span.md) classes.push(`md:col-span-${span.md}`);
    if (span.lg) classes.push(`lg:col-span-${span.lg}`);
    if (span.xl) classes.push(`xl:col-span-${span.xl}`);

    return classes.join(" ");
  };

  return <div className={cn(getSpanClasses(), className)}>{children}</div>;
}
