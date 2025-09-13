"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { AuthUser, SignupData, SigninData, AuthResponse } from "@/lib/types";
import {
  handleApiError,
  displayApiErrors,
  showSuccessMessage,
  showErrorMessage,
} from "@/lib/error-handler";
import { toast } from "sonner";

// Auth State Interface
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: "AUTH_INIT_START" }
  | { type: "AUTH_INIT_SUCCESS"; payload: { user: AuthUser } }
  | { type: "AUTH_INIT_FAILURE" }
  | { type: "AUTH_REQUEST_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: AuthUser } }
  | { type: "AUTH_FAILURE"; payload?: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<AuthUser> }
  | { type: "UPDATE_AVATAR"; payload: string }
  | { type: "CLEAR_ERROR" };

// Auth Context Interface
interface AuthContextType {
  state: AuthState;
  signin: (
    data: SigninData
  ) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  signup: (
    data: SignupData
  ) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  resetAvatar: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_INIT_START":
      return {
        ...state,
        isLoading: true,
        isInitialized: false,
      };

    case "AUTH_INIT_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
        isInitialized: true,
        error: null,
      };

    case "AUTH_INIT_FAILURE":
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isInitialized: true,
        error: null,
      };

    case "AUTH_REQUEST_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
        isInitialized: true,
        error: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload || null,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
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

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage utilities
class AuthStorage {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly USER_KEY = "user_data";

  static getStoredAuth(): { token: string | null; user: AuthUser | null } {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);

      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData),
        };
      }
    } catch (error) {
      console.error("Error parsing stored auth data:", error);
      this.clearStoredAuth();
    }

    return { token: null, user: null };
  }

  static storeAuth(token: string, user: AuthUser): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error storing auth data:", error);
    }
  }

  static updateStoredUser(user: AuthUser): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error updating stored user data:", error);
    }
  }

  static clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

// API utilities
class AuthAPI {
  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const { token } = AuthStorage.getStoredAuth();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(endpoint, {
      ...options,
      headers,
      credentials: "include", // Include cookies
    });
  }

  static async signin(data: SigninData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    return response.json();
  }

  static async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    return response.json();
  }

  static async logout(): Promise<AuthResponse> {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    return response.json();
  }

  static async refreshToken(): Promise<AuthResponse> {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    return response.json();
  }

  static async getProfile(): Promise<any> {
    const response = await this.makeRequest("/api/auth/profile");
    return response.json();
  }

  static async updateProfile(updates: Partial<AuthUser>): Promise<any> {
    const response = await this.makeRequest("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    return response.json();
  }

  static async uploadAvatar(file: File): Promise<any> {
    const { token } = AuthStorage.getStoredAuth();
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: "include",
    });

    return response.json();
  }

  static async resetAvatar(): Promise<any> {
    const response = await this.makeRequest("/api/profile/avatar", {
      method: "DELETE",
    });

    return response.json();
  }
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    dispatch({ type: "AUTH_INIT_START" });

    try {
      const { token, user } = AuthStorage.getStoredAuth();

      if (token && user) {
        // Try to refresh token if refresh tokens are supported
        try {
          const refreshResult = await AuthAPI.refreshToken();

          if (refreshResult.success) {
            // Store new token if provided
            if (refreshResult.token) {
              AuthStorage.storeAuth(refreshResult.token, user);
            }
            dispatch({ type: "AUTH_INIT_SUCCESS", payload: { user } });
          } else {
            // Token refresh failed, but user still exists in storage
            // For backward compatibility, assume token is still valid
            dispatch({ type: "AUTH_INIT_SUCCESS", payload: { user } });
          }
        } catch (refreshError) {
          // Refresh not available or failed, use existing token
          dispatch({ type: "AUTH_INIT_SUCCESS", payload: { user } });
        }
      } else {
        dispatch({ type: "AUTH_INIT_FAILURE" });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      AuthStorage.clearStoredAuth();
      dispatch({ type: "AUTH_INIT_FAILURE" });
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Sign in function
  const signin = async (
    data: SigninData
  ): Promise<{ success: boolean; errors?: Record<string, string> }> => {
    try {
      dispatch({ type: "AUTH_REQUEST_START" });

      const result = await AuthAPI.signin(data);

      if (result.success && result.user && result.token) {
        AuthStorage.storeAuth(result.token, result.user);
        dispatch({ type: "AUTH_SUCCESS", payload: { user: result.user } });
        showSuccessMessage("Welcome back!");
        return { success: true };
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: result.message });
        const apiErrors = handleApiError(result, "Sign in failed");
        const fieldErrors = displayApiErrors(apiErrors);
        return { success: false, errors: fieldErrors };
      }
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE", payload: "Network error occurred" });
      showErrorMessage("Network error. Please try again.");
      console.error("Signin error:", error);
      return { success: false };
    }
  };

  // Sign up function
  const signup = async (
    data: SignupData
  ): Promise<{ success: boolean; errors?: Record<string, string> }> => {
    try {
      dispatch({ type: "AUTH_REQUEST_START" });

      const result = await AuthAPI.signup(data);

      if (result.success && result.user && result.token) {
        AuthStorage.storeAuth(result.token, result.user);
        dispatch({ type: "AUTH_SUCCESS", payload: { user: result.user } });
        showSuccessMessage("Account created successfully!");
        return { success: true };
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: result.message });
        const apiErrors = handleApiError(result, "Sign up failed");
        const fieldErrors = displayApiErrors(apiErrors);
        return { success: false, errors: fieldErrors };
      }
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE", payload: "Network error occurred" });
      showErrorMessage("Network error. Please try again.");
      console.error("Signup error:", error);
      return { success: false };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      AuthStorage.clearStoredAuth();
      dispatch({ type: "LOGOUT" });
      toast.success("Logged out successfully");
    }
  };

  // Update profile function
  const updateProfile = async (
    updates: Partial<AuthUser>
  ): Promise<boolean> => {
    try {
      const result = await AuthAPI.updateProfile(updates);

      if (result.success && result.user) {
        const updatedUser = { ...state.user, ...result.user };
        dispatch({ type: "UPDATE_USER", payload: result.user });
        AuthStorage.updateStoredUser(updatedUser as AuthUser);
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

  // Upload avatar function
  const uploadAvatar = async (file: File): Promise<boolean> => {
    try {
      const result = await AuthAPI.uploadAvatar(file);

      if (result.success && result.avatar) {
        dispatch({ type: "UPDATE_AVATAR", payload: result.avatar });
        const updatedUser = { ...state.user!, avatar: result.avatar };
        AuthStorage.updateStoredUser(updatedUser);
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

  // Reset avatar function
  const resetAvatar = async (): Promise<boolean> => {
    try {
      const result = await AuthAPI.resetAvatar();

      if (result.success && result.avatar) {
        dispatch({ type: "UPDATE_AVATAR", payload: result.avatar });
        const updatedUser = { ...state.user!, avatar: result.avatar };
        AuthStorage.updateStoredUser(updatedUser);
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

  // Refresh user data function
  const refreshUser = async (): Promise<void> => {
    try {
      const result = await AuthAPI.getProfile();

      if (result.success && result.user) {
        dispatch({ type: "UPDATE_USER", payload: result.user });
        AuthStorage.updateStoredUser(result.user);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const contextValue: AuthContextType = {
    state,
    signin,
    signup,
    logout,
    updateProfile,
    uploadAvatar,
    resetAvatar,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth guard component
export function AuthGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { state } = useAuth();

  if (!state.isInitialized) {
    return fallback || <div>Loading...</div>;
  }

  if (!state.isAuthenticated) {
    return fallback || <div>Please sign in to continue</div>;
  }

  return <>{children}</>;
}
