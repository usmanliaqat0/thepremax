import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface IconFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  variant?: "default" | "accent" | "large";
}

export function IconFeature({
  icon: Icon,
  title,
  description,
  className,
  variant = "default",
}: IconFeatureProps) {
  const variants = {
    default: {
      container: "text-center space-y-4",
      iconWrapper:
        "w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto",
      icon: "h-8 w-8 text-accent",
      title: "font-semibold text-lg text-primary",
      description: "text-muted-foreground",
    },
    accent: {
      container:
        "text-center space-y-4 p-6 rounded-lg border border-border hover:border-accent/50 transition-colors",
      iconWrapper:
        "w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto",
      icon: "h-10 w-10 text-accent",
      title: "font-semibold text-xl text-primary",
      description: "text-muted-foreground leading-relaxed",
    },
    large: {
      container:
        "text-center space-y-6 p-8 rounded-xl bg-card shadow-fashion-sm hover:shadow-fashion-md transition-all",
      iconWrapper:
        "w-24 h-24 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto",
      icon: "h-12 w-12 text-accent",
      title: "font-heading font-bold text-2xl text-primary",
      description: "text-muted-foreground text-lg leading-relaxed",
    },
  };

  const variantStyles = variants[variant];

  return (
    <div className={cn(variantStyles.container, className)}>
      <div className={variantStyles.iconWrapper}>
        <Icon className={variantStyles.icon} />
      </div>
      <h3 className={variantStyles.title}>{title}</h3>
      <p className={variantStyles.description}>{description}</p>
    </div>
  );
}

interface FeatureGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function FeatureGrid({
  children,
  className,
  columns = 4,
}: FeatureGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-8", gridClasses[columns], className)}>
      {children}
    </div>
  );
}

interface StatsGridProps {
  stats: {
    value: string;
    label: string;
  }[];
  className?: string;
  variant?: "default" | "bordered" | "large";
}

export function StatsGrid({
  stats,
  className,
  variant = "default",
}: StatsGridProps) {
  const variants = {
    default: {
      container: "grid grid-cols-3 gap-6 pt-8 border-t border-border",
      item: "text-center",
      value: "text-2xl md:text-3xl font-bold text-primary",
      label: "text-sm text-muted-foreground",
    },
    bordered: {
      container: "grid grid-cols-3 gap-6",
      item: "text-center p-6 rounded-lg border border-border hover:border-accent/50 transition-colors",
      value: "text-3xl font-bold text-primary mb-2",
      label: "text-sm text-muted-foreground",
    },
    large: {
      container: "grid grid-cols-1 md:grid-cols-3 gap-8",
      item: "text-center p-8 rounded-xl bg-card shadow-fashion-sm hover:shadow-fashion-md transition-all",
      value: "text-4xl md:text-5xl font-heading font-bold text-primary mb-4",
      label: "text-base text-muted-foreground",
    },
  };

  const variantStyles = variants[variant];

  return (
    <div className={cn(variantStyles.container, className)}>
      {stats.map((stat, index) => (
        <div key={index} className={variantStyles.item}>
          <div className={variantStyles.value}>{stat.value}</div>
          <div className={variantStyles.label}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
