"use client";

import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PageLayout({
  children,
  className = "",
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-background ${className}`}>
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
