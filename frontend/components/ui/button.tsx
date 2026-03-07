"use client";

import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-2xl px-4 py-2
        text-sm font-medium
        transition-all duration-200
        shadow-sm
        bg-black text-white
        hover:opacity-90
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
