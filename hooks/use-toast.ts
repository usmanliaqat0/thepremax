import { toast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export const useToast = () => {
  return {
    toast: ({ title, description, variant = "default" }: ToastProps) => {
      if (variant === "destructive") {
        toast.error(title, {
          description,
          style: {
            background: "hsl(var(--background) / 0.95)",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--destructive))",
            backdropFilter: "blur(8px)",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          },
        });
      } else {
        toast.success(title, {
          description,
          style: {
            background: "hsl(var(--background) / 0.95)",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
            backdropFilter: "blur(8px)",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          },
        });
      }
    },
  };
};
