"use client";
import BlogCard from "@/components/BlogCard";
import Loading from "@/components/loading";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppData } from "../../components/context/AppContext";
import { LayoutGrid, LayoutList, PanelLeftOpen, PanelLeftClose, Search, X } from "lucide-react";
import React, { useState } from "react";

const Blogs = () => {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const { loading, blogLoading, blogs } = useAppData();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = blogs?.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase())
  );

  // On desktop: show filter button only when sidebar is closed
  // On mobile: always show it (it opens the drawer)
  const showFilterBtn = isMobile || !open;

  return (
    <div className="min-h-screen">
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Sticky Page Header */}
          <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
            <div className="px-4 sm:px-6 h-14 flex items-center gap-3">

              {/* Sidebar toggle — icon only, smooth icon swap */}
              <button
                onClick={toggleSidebar}
                title={open ? "Close sidebar" : "Open sidebar"}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 flex-shrink-0"
              >
                {open && !isMobile ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>

              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                Latest Blogs
              </h1>

              {/* Search Bar */}
              <div className="flex-1 max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search blogs..."
                  className="w-full pl-8 pr-7 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all duration-200"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 transition-colors duration-150 ${
                    view === "grid"
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 transition-colors duration-150 ${
                    view === "list"
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                  title="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 py-8">
            {/* Results count */}
            {!blogLoading && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {search
                  ? `${filtered?.length ?? 0} result${filtered?.length !== 1 ? "s" : ""} for "${search}"`
                  : `${blogs?.length ?? 0} article${blogs?.length !== 1 ? "s" : ""} published`}
              </p>
            )}

            {blogLoading ? (
              <Loading />
            ) : filtered?.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Search className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-base font-medium text-slate-600 dark:text-slate-300">
                  {search ? "No blogs match your search" : "No blogs published yet"}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="mt-3 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                    : "flex flex-col gap-4"
                }
              >
                {filtered?.map((e, i) => (
                  <BlogCard
                    key={e.id ?? i}
                    image={e.image}
                    title={e.title}
                    desc={e.description}
                    id={e.id}
                    time={e.created_at}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Blogs;
