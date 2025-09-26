import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-fashion disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-fashion-sm hover:bg-primary/90 hover:shadow-fashion-md hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-fashion-sm hover:bg-destructive/90 hover:shadow-fashion-md hover:-translate-y-0.5",
        outline:
          "border border-border bg-background shadow-fashion-sm hover:bg-accent hover:text-accent-foreground hover:shadow-fashion-md hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-fashion-sm hover:bg-secondary/80 hover:shadow-fashion-md hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-colors",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent transition-colors",
        accent:
          "bg-accent text-accent-foreground shadow-fashion-sm hover:bg-accent/90 hover:shadow-fashion-md hover:-translate-y-0.5",
        luxury:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-fashion-product hover:shadow-fashion-luxury hover:-translate-y-1 font-semibold",
        nav: "text-foreground hover:text-primary hover:bg-accent/20 px-3 py-2 transition-colors font-medium",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        xl: "h-14 rounded-lg px-10 text-lg has-[>svg]:px-8",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
