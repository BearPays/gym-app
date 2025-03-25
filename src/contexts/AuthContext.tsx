"use client";

import React, { createContext, useState, useEffect, useContext } from "react";

type User = {
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check session status on initial render
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try to get user info from the non-HTTP-only cookie (contains just the user's name)
        const userInfoCookie = getCookieValue('user_info');
        
        if (userInfoCookie) {
          // Parse the user info cookie
          const userInfo = JSON.parse(userInfoCookie);
          
          // Validate the session by making an API call
          const response = await fetch('/api/auth/validate', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookies to be sent
          });
          
          if (response.ok) {
            const data = await response.json();
            // If session is valid, set the user state
            if (data.authenticated) {
              setUser({
                name: userInfo.name,
                email: data.email,
              });
              setIsAuthenticated(true);
            } else {
              // Invalid session
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            // API error
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No user info cookie found
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Error checking auth status:", e);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Helper function to get a cookie value by name
  const getCookieValue = (name: string): string | null => {
    if (typeof document === 'undefined') return null; // SSR check
    
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };
  
  const login = (userData: User) => {
    if (!userData) return;
    
    setUser(userData);
    setIsAuthenticated(true);
    
    // The HTTP-only cookie is set by the server in the API response
    // We don't need to set it here
  };
  
  const logout = async () => {
    try {
      // Call the logout API to clear the HTTP-only cookie on the server
      await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'logout',
          userId: user?.email // Send userId if available for server-side cleanup
        }),
        credentials: 'include', // Important for cookies to be sent
      });
    } catch (e) {
      console.error("Error during logout:", e);
    } finally {
      // Clear local state regardless of API success
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      isInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
