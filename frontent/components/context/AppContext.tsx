"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ── Service URLs ──────────────────────────────────────────────────────────────

export const user_service  = "https://user-service-latest-6jwv.onrender.com";
export const author_service = "https://auth-service-latest-yqu0.onrender.com";
export const blog_service  = "https://blog-service-latest-ivv5.onrender.com";

// ── Constants ─────────────────────────────────────────────────────────────────

export const blogCategories = [
  "Technology",
  "Health",
  "Finance",
  "Travel",
  "Education",
  "Entertainment",
  "Study",
];

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  bio: string;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  tags: string[];
  author: string;
  create_at: string;
}

export interface SavedBlogType {
  id: string;
  userid: string;
  blogid: string;
  create_at: string;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  blogs: Blog[] | null;
  blogLoading: boolean;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  fetchBlogs: () => Promise<void>;
  savedBlogs: SavedBlogType[] | null;
  getSavedBlogs: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser]     = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [blogs, setBlogs]           = useState<Blog[] | null>(null);
  const [blogLoading, setBlogLoading] = useState(true);
  const [category, setCategory]     = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedBlogs, setSavedBlogs] = useState<SavedBlogType[] | null>(null);

  // ── Fetch current user ──────────────────────────────────────────────────

  async function fetchUser() {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.get<User>(`${user_service}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      setIsAuth(true);
    } catch {
      // not logged in — stay as guest
    } finally {
      setLoading(false);
    }
  }

  // ── Fetch all blogs ─────────────────────────────────────────────────────

  async function fetchBlogs() {
    setBlogLoading(true);
    try {
      const { data } = await axios.get<Blog[]>(
        `${blog_service}/api/v1/blog/all?searchQuery=${searchQuery}&category=${category}`
      );
      setBlogs(data);
    } catch {
      // keep previous blogs on error
    } finally {
      setBlogLoading(false);
    }
  }

  // ── Fetch saved blogs ───────────────────────────────────────────────────

  async function getSavedBlogs() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get<SavedBlogType[]>(
        `${blog_service}/api/v1/blog/saved/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedBlogs(data);
    } catch {
      // not logged in or no saved blogs
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────

  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully.");
  }

  // ── Effects ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchUser();
    getSavedBlogs();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, category]);

  // ── Provider ─────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        setLoading,
        logoutUser,
        blogs,
        blogLoading,
        setCategory,
        setSearchQuery,
        searchQuery,
        fetchBlogs,
        savedBlogs,
        getSavedBlogs,
      }}
    >
      <GoogleOAuthProvider clientId="663214577288-nfpfef1adus5fc40bs5ldeqfsbe0elak.apps.googleusercontent.com">
        {children}
        <Toaster />
      </GoogleOAuthProvider>
    </AppContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};