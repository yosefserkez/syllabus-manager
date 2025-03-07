"use client";

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
}

export function Logo({ className, iconClassName, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <GraduationCap 
          className={cn(
            "h-6 w-6 text-primary",
            "transform transition-transform group-hover:rotate-[-10deg]",
            iconClassName
          )} 
        />
        <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-blue-500" />
      </div>
      {showText && (
        <span className="font-semibold tracking-tight">
          Syllabus<span className="text-blue-500">Manager</span>
        </span>
      )}
    </div>
  );
}