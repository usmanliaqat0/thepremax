import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshLoader } from "@/components/ui/loader";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "rectangular" | "text";
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  const variants = {
    default: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded-sm h-4",
  };

  return (
    <div
      className={cn("animate-pulse bg-muted", variants[variant], className)}
    />
  );
}

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="aspect-square">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="circular" className="w-4 h-4" />
          ))}
          <Skeleton className="h-4 w-12 ml-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="circular" className="w-4 h-4" />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

interface PageLoadingProps {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

export function PageLoading({
  title = "Loading",
  subtitle = "Please wait while we load the content",
  showHeader = true,
}: PageLoadingProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <RefreshLoader size="xl" />
      {showHeader && (
        <>
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {subtitle}
          </p>
        </>
      )}
    </div>
  );
}

interface GridSkeletonProps {
  items?: number;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

export function GridSkeleton({
  items = 8,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  className,
}: GridSkeletonProps) {
  const getGridClasses = () => {
    const classes = ["grid", "gap-6"];
    if (columns.sm) classes.push(`grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    return classes.join(" ");
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {[...Array(items)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface ListSkeletonProps {
  items?: number;
  className?: string;
  itemClassName?: string;
}

export function ListSkeleton({
  items = 5,
  className,
  itemClassName,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className={cn("space-y-2", itemClassName)}>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
