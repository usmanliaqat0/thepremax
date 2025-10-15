"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { AuthUser, SignupData, SigninData, AuthResponse } from "@/lib/types";
import {
  handleClientError,
  displayApiErrors,
  showSuccessMessage,
  showErrorMessage,
} from "@/lib/error-handler";
import { toast } from "sonner";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: AuthUser; token: string } }
  | { type: "AUTH_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<AuthUser> }
  | { type: "UPDATE_AVATAR"; payload: string };

interface AuthContextType {
  state: AuthState;
  signin: (
    data: SigninData
  ) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  adminSignin: (
    data: SigninData
  ) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  signup: (
    data: SignupData
  ) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  resetAvatar: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  requireAdmin: () => boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case "UPDATE_AVATAR":
      return {
        ...state,
        user: state.user ? { ...state.user, avatar: action.payload } : null,
      };

    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user, token },
        });
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        dispatch({ type: "AUTH_FAILURE" });
      }
    } else {
      dispatch({ type: "AUTH_FAILURE" });
    }
  }, []);

  const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (state.token) {
      headers.Authorization = `Bearer ${state.token}`;
    }

    return fetch(endpoint, {
      ...options,
      headers,
    });
  };

  const signin = async (
    data: SigninData
  ): Promise<{ success: boolean; errors?: Record<string, string> }> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.user && result.token) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("user_data", JSON.stringify(result.user));

        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: result.user, token: result.token },
        });

        if (!result.user.isEmailVerified && result.user.role !== "admin") {
          localStorage.setItem("pending_verification_email", result.user.email);

          window.location.href = `/verify-code?email=${encodeURIComponent(
            result.user.email
          )}`;
          return { success: true };
        }

        showSuccessMessage("Welcome back!");
        return { success: true };
      } else {
        dispatch({ type: "AUTH_FAILURE" });
        const apiErrors = handleClientError(result, "Sign in failed");
        const fieldErrors = displayApiErrors(apiErrors);
        return { success: false, errors: fieldErrors };
      }
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      showErrorMessage("Network error. Please try again.");
      console.error("Signin error:", error);
      return { success: false };
    }
  };

  const adminSignin = async (
    data: SigninData
  ): Promise<{ success: boolean; errors?: Record<string, string> }> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await fetch("/api/admin/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Admin signin result:", result);

      if (result.success && result.user && result.accessToken) {
        console.log("Admin signin successful, updating auth state");
        localStorage.setItem("auth_token", result.accessToken);
        localStorage.setItem("user_data", JSON.stringify(result.user));

        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: result.user, token: result.accessToken },
        });

        showSuccessMessage("Admin login successful!");
        return { success: true };
      } else {
        dispatch({ type: "AUTH_FAILURE" });
        const apiErrors = handleClientError(result, "Admin sign in failed");
        const fieldErrors = displayApiErrors(apiErrors);
        return { success: false, errors: fieldErrors };
      }
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      showErrorMessage("Network error. Please try again.");
      console.error("Admin signin error:", error);
      return { success: false };
    }
  };

  const signup = async (
    data: SignupData
  ): Promise<{ success: boolean; errors?: Record<string, string> }> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.user) {
        if (result.requiresVerification && result.token) {
          localStorage.setItem("auth_token", result.token);
          localStorage.setItem("user_data", JSON.stringify(result.user));

          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: result.user, token: result.token },
          });

          localStorage.setItem("pending_verification_email", result.user.email);

          window.location.href = `/verify-code?email=${encodeURIComponent(
            result.user.email
          )}`;
          return { success: true };
        } else if (result.token) {
          localStorage.setItem("auth_token", result.token);
          localStorage.setItem("user_data", JSON.stringify(result.user));

          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: result.user, token: result.token },
          });

          showSuccessMessage("Account created successfully!");
          return { success: true };
        } else {
          return { success: true };
        }
      } else {
        dispatch({ type: "AUTH_FAILURE" });
        const apiErrors = handleClientError(result, "Sign up failed");
        const fieldErrors = displayApiErrors(apiErrors);
        return { success: false, errors: fieldErrors };
      }
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      showErrorMessage("Network error. Please try again.");
      console.error("Signup error:", error);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const updateProfile = async (
    updates: Partial<AuthUser>
  ): Promise<boolean> => {
    try {
      const response = await apiCall("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success && result.user) {
        dispatch({ type: "UPDATE_USER", payload: result.user });
        localStorage.setItem(
          "user_data",
          JSON.stringify({ ...state.user, ...result.user })
        );
        toast.success("Profile updated successfully");
        return true;
      } else {
        toast.error(result.message || "Profile update failed");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Update profile error:", error);
      return false;
    }
  };

  const uploadAvatar = async (file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.avatar) {
        dispatch({ type: "UPDATE_AVATAR", payload: result.avatar });
        const updatedUser = { ...state.user!, avatar: result.avatar };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        toast.success("Profile image updated successfully");
        return true;
      } else {
        toast.error(result.message || "Image upload failed");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Upload avatar error:", error);
      return false;
    }
  };

  const resetAvatar = async (): Promise<boolean> => {
    try {
      const response = await apiCall("/api/profile/avatar", {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success && result.avatar) {
        dispatch({ type: "UPDATE_AVATAR", payload: result.avatar });
        const updatedUser = { ...state.user!, avatar: result.avatar };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        toast.success("Profile image reset to default");
        return true;
      } else {
        toast.error(result.message || "Reset avatar failed");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Reset avatar error:", error);
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiCall("/api/auth/profile");
      const result = await response.json();

      if (result.success && result.user) {
        dispatch({ type: "UPDATE_USER", payload: result.user });
        localStorage.setItem("user_data", JSON.stringify(result.user));
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  const isAdmin = (): boolean => {
    return state.user?.role === "admin" || state.user?.role === "super_admin";
  };

  const isSuperAdmin = (): boolean => {
    return (
      state.user?.role === "super_admin" && state.user?.id === "super-admin"
    );
  };

  const requireAdmin = (): boolean => {
    if (!state.isAuthenticated || !state.user) {
      return false;
    }
    return isAdmin();
  };

  const contextValue: AuthContextType = {
    state,
    signin,
    adminSignin,
    signup,
    logout,
    updateProfile,
    uploadAvatar,
    resetAvatar,
    refreshUser,
    isAdmin,
    isSuperAdmin,
    requireAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
