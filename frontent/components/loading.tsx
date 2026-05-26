import React from "react";
import { BookOpen } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-violet-600 border-2 border-white dark:border-slate-900 animate-bounce" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default Loading;
