import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "muted" | "gradient" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
}

const sectionVariants = {
  default: "bg-background",
  muted: "bg-muted/30",
  gradient: "bg-gradient-hero",
  dark: "bg-primary text-primary-foreground",
};

const sectionSizes = {
  sm: "py-8",
  md: "py-12",
  lg: "py-16",
  xl: "py-20",
};

export function Section({
  children,
  className,
  variant = "default",
  size = "md",
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        sectionVariants[variant],
        sectionSizes[size],
        className
      )}
    >
      {children}
    </section>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const containerSizes = {
  sm: "max-w-4xl",
  md: "max-w-6xl",
  lg: "max-w-7xl",
  xl: "max-w-[1400px]",
  full: "max-w-none",
};

export function Container({
  children,
  className,
  size = "lg",
}: ContainerProps) {
  return (
    <div
      className={cn("container mx-auto px-4", containerSizes[size], className)}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  alignment?: "left" | "center" | "right";
  showDivider?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  className,
  alignment = "center",
  showDivider = true,
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const dividerClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  return (
    <div className={cn("mb-12", alignmentClasses[alignment], className)}>
      <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          {subtitle}
        </p>
      )}
      {showDivider && (
        <div
          className={cn(
            "w-24 h-1 bg-accent rounded-full mt-4",
            dividerClasses[alignment]
          )}
        />
      )}
    </div>
  );
}
