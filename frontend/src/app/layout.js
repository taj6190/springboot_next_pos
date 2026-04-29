import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "POS System — Point of Sale",
  description: "Production-grade Point of Sale management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: { background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "0.875rem" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }} />
        {children}
      </body>
    </html>
  );
}
