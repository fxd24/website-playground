import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trade Management System",
  description: "Construction and trade management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </AppProvider>
      </body>
    </html>
  );
}