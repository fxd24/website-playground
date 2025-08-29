"use client";

import * as React from "react";
import {
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  Home,
  Plus,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FEATURE_FLAGS, FEATURE_FLAG_CONFIG } from "@/lib/feature-flags";
import { useFeatureFlag } from "@/hooks/use-feature-flag-store";
import { useState, useEffect } from "react";
import { SidebarFeatureToggles } from "./sidebar-feature-toggles";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Quotes",
    url: "/quotes",
    icon: FileText,
  },
  {
    title: "Jobs",
    url: "/jobs",
    icon: Wrench,
  },
  {
    title: "Scheduling",
    url: "/jobs/schedule",
    icon: Calendar,
  },
  {
    title: "Purchase Orders",
    url: "/purchase-orders",
    icon: ShoppingCart,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: ClipboardList,
  },
];

const managementNavItems = [
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Buildings",
    url: "/buildings",
    icon: Building2,
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
  },
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: Building2,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const otherNavItems: typeof managementNavItems = [];

export function AppSidebar() {
  const { currentUser, sidebarCollapsed } = useApp();
  const { value: purchaseOrdersEnabled } = useFeatureFlag(FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED);
  const [isClient, setIsClient] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Sidebar variant="floating" className="border-r">
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="px-4 py-6">
          <motion.div
            layout
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold text-sm"
              >
                TradePro
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <Link href="/quotes/new">
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {!sidebarCollapsed && "New Quote"}
            </Button>
          </Link>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems
                .filter((item) => {
                  // Filter out Purchase Orders if feature flag is disabled
                  if (item.title === "Purchase Orders") {
                    // Use default value during SSR, then client value after hydration
                    return isClient ? purchaseOrdersEnabled : FEATURE_FLAG_CONFIG[FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED].defaultValue;
                  }
                  return true;
                })
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Feature Toggles */}
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarFeatureToggles isExpanded={!sidebarCollapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info */}
        <div className="mt-auto px-4 py-4 border-t">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-medium">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{currentUser.role}</span>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
