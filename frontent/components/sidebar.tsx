"use client";
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { BookOpen, LayoutGrid, Search, Tag, X } from "lucide-react";
import { blogCategories, useAppData } from "../components/context/AppContext";

const categoryIcons: Record<string, string> = {
  Technology: "💻",
  Science: "🔬",
  Health: "🏥",
  Travel: "✈️",
  Food: "🍽️",
  Lifestyle: "🌿",
  Business: "💼",
  Sports: "⚽",
  Entertainment: "🎬",
  Education: "📚",
};

const SideBar = () => {
  const { searchQuery, setSearchQuery, setCategory } = useAppData();
  const [activeCategory, setActiveCategory] = useState("");
  const { isMobile, setOpenMobile } = useSidebar();

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setCategory(cat);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas">
      {/* Header */}
      <SidebarHeader className="px-5 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              The Reading Retreat
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Discover & explore
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white dark:bg-slate-900 px-4 py-4 overflow-y-auto">

        {/* Search */}
        <SidebarGroup className="p-0 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
            <Search className="w-3 h-3" />
            Search
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs..."
              className="w-full pl-8 pr-8 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </SidebarGroup>

        {/* Categories */}
        <SidebarGroup className="p-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
            <Tag className="w-3 h-3" />
            Categories
          </p>
          <SidebarMenu className="space-y-0.5">
            {/* All */}
            <SidebarMenuItem>
              <button
                onClick={() => handleCategory("")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                  activeCategory === ""
                    ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <LayoutGrid
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    activeCategory === "" ? "text-violet-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
                />
                <span className="flex-1 text-left">All</span>
                {activeCategory === "" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                )}
              </button>
            </SidebarMenuItem>

            {blogCategories?.map((cat, i) => (
              <SidebarMenuItem key={i}>
                <button
                  onClick={() => handleCategory(cat)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                    activeCategory === cat
                      ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="text-base leading-none w-4 text-center flex-shrink-0">
                    {categoryIcons[cat] ?? "📝"}
                  </span>
                  <span className="flex-1 text-left truncate">{cat}</span>
                  {activeCategory === cat && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                  )}
                </button>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
