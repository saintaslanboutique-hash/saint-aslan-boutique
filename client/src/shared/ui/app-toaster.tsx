"use client";

import { Toaster } from "react-hot-toast";

/** Global toast host — mount once under `[locale]/layout` so all routes (main, auth, admin, hero) can show toasts. */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      containerClassName="!z-[2147483647]"
      toastOptions={{
        duration: 3000,
        className: "font-host-grotesk text-sm",
        style: {
          fontFamily: "var(--font-host-grotesk), sans-serif",
          fontSize: "0.875rem",
          borderRadius: "0.75rem",
          border: "1px solid oklch(0.922 0 0)",
          boxShadow: "0 4px 24px -4px rgba(0,0,0,0.10)",
          padding: "12px 16px",
        },
        success: {
          iconTheme: { primary: "#171717", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}
