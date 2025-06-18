"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/lib/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  refreshAuthState: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  // Refresh auth state from localStorage
  const refreshAuthState = () => {
    setIsAuthenticated(authService.isAuthenticated());
  };

  useEffect(() => {
    // On mount, check auth state
    setIsAuthenticated(authService.isAuthenticated());

    // Listen for storage changes (cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "refresh_token" || e.key === "user_id") {
        setIsAuthenticated(authService.isAuthenticated());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated: setIsAuthenticated, refreshAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};