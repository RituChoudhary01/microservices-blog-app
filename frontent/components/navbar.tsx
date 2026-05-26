"use client";
import Link from "next/link";
import React, { useState } from "react";
import { BookOpen, CircleUserRound, LogIn, Menu, X, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "./context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { loading, isAuth } = useAppData();

  const navLinks = [
    { href: "/blogs", label: "Home", always: true },
    { href: "/blog/saved", label: "Saved", authOnly: true },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/blogs" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-700 transition-colors">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white hidden sm:block">
            The Reading Retreat
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, always, authOnly }) =>
            always || (authOnly && isAuth) ? (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-150"
                >
                  {authOnly && <Bookmark className="w-3.5 h-3.5" />}
                  {label}
                </Link>
              </li>
            ) : null
          )}

          {!loading && (
            <li>
              {isAuth ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all duration-150"
                >
                  <CircleUserRound className="w-4 h-4" />
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in
                </Link>
              )}
            </li>
          )}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-100 dark:border-slate-800",
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col px-4 py-3 gap-1 bg-white dark:bg-slate-900">
          <li>
            <Link
              href="/blogs"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Home
            </Link>
          </li>
          {isAuth && (
            <li>
              <Link
                href="/blog/saved"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved Blogs
              </Link>
            </li>
          )}
          {!loading && (
            <li>
              {isAuth ? (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                >
                  <CircleUserRound className="w-4 h-4" />
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
