import { useState, useCallback, useEffect } from "react";

interface UseDialogOptions {
  onOpenChange?: (open: boolean) => void;
}

export function useDialog(options: UseDialogOptions = {}) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      options.onOpenChange?.(newOpen);

      // Ensure focus is properly managed when dialog closes
      if (!newOpen) {
        // Small delay to ensure the dialog is fully closed before restoring focus
        setTimeout(() => {
          // Remove any lingering focus traps
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.blur) {
            activeElement.blur();
          }

          // Restore focus to body to ensure page is interactive
          document.body.focus();
        }, 100);
      }
    },
    [options]
  );

  const openDialog = useCallback(() => {
    handleOpenChange(true);
  }, [handleOpenChange]);

  const closeDialog = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (open) {
        // Ensure cleanup when component unmounts
        document.body.focus();
      }
    };
  }, [open]);

  return {
    open,
    onOpenChange: handleOpenChange,
    openDialog,
    closeDialog,
  };
}
