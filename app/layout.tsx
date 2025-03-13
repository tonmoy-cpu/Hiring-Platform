"use client";

import { useState, useEffect } from "react";
import Toast from "@/components/Toast";
import "./globals.css";

export default function RootLayout({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const listener = (e) => setToast(e.detail);
    window.addEventListener("show-toast", listener);
    return () => window.removeEventListener("show-toast", listener);
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#373737]">
        {children}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </body>
    </html>
  );
}