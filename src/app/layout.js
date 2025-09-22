// src/app/layout.js
"use client";

import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" reverseOrder={false} />
        </AuthProvider>
      </body>
    </html>
  );
}
