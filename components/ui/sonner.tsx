"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:border-green-500 group-[.toaster]:backdrop-blur-sm",
          error:
            "group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:border-red-500 group-[.toaster]:backdrop-blur-sm",
        },
        style: {
          background: "hsl(var(--background) / 0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid hsl(var(--border))",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
