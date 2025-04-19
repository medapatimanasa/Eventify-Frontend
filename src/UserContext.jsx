/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptors
  useEffect(() => {
    // Add token to all requests
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle 401 responses
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
          // Redirect to login page if not already there
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "https://ems-backend-9cfa.onrender.com/profile"
      );
      setUser(response.data);
    } catch (error) {
      console.error("Error checking user:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return {
          success: false,
          error: "Email and password are required",
        };
      }

      const response = await axios.post(
        "https://ems-backend-9cfa.onrender.com/login",
        {
          email,
          password,
        }
      );

      if (!response.data.token || !response.data.user) {
        return {
          success: false,
          error: "Invalid response from server",
        };
      }

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.details ||
          "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        "https://ems-backend-9cfa.onrender.com/register",
        userData
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.details ||
          "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post("https://ems-backend-9cfa.onrender.com/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
