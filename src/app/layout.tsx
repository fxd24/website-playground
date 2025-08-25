import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Wrench } from "lucide-react";

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
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="h-8 w-8" />
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Wrench className="h-3 w-3" />
                      </div>
                      <span className="font-semibold text-sm">TradePro</span>
                    </div>
                  </div>
                </header>
                <div className="p-4 md:p-6">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
        </AppProvider>
      </body>
    </html>
  );
}