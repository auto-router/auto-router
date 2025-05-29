"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/lib/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated: setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}; 