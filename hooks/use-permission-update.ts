import { useCallback } from "react";
import { usePermissions } from "@/context/PermissionContext";
import { showSuccessMessage, showErrorMessage } from "@/lib/error-handler";

export function usePermissionUpdate() {
  const { refreshPermissions } = usePermissions();

  const updateAdminPermissions = useCallback(
    async (adminId: string, permissions: any) => {
      try {
        const response = await fetch(
          `/api/admin/admins/${adminId}/permissions`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({ permissions }),
          }
        );

        const result = await response.json();

        if (result.success) {
          showSuccessMessage("Admin permissions updated successfully");
          // Refresh permissions for current user if they updated their own permissions
          await refreshPermissions();
          return { success: true, data: result.admin };
        } else {
          showErrorMessage(result.message || "Failed to update permissions");
          return { success: false, error: result.message };
        }
      } catch (error) {
        console.error("Error updating permissions:", error);
        showErrorMessage("Failed to update permissions. Please try again.");
        return { success: false, error: "Network error" };
      }
    },
    [refreshPermissions]
  );

  return {
    updateAdminPermissions,
  };
}
