import SideBar from "@/components/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import React, { ReactNode } from "react";

interface BlogsProps {
  children: ReactNode;
}

const HomeLayout: React.FC<BlogsProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <SideBar />
      <SidebarInset className="min-w-0 flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomeLayout;
