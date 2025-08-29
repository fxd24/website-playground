"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Wrench, Users, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { motion } from "framer-motion";
import { QuickFeatureToggle } from "@/components/quick-feature-toggle";

export default function Dashboard() {
  const { quotes, clients, isLoadingQuotes, isLoadingClients } = useApp();

  // Calculate dashboard metrics
  const draftQuotes = quotes.filter(q => q.status === 'Draft').length;
  const sentQuotes = quotes.filter(q => q.status === 'Sent').length;
  const totalClients = clients.length;
  const recentQuotes = quotes.filter(q => {
    const daysSince = (Date.now() - q.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length;

  const decisionCards = [
    {
      title: "Cash in next 14 days",
      value: "CHF 12,450",
      description: "From upcoming payments",
      icon: TrendingUp,
      trend: "+15% from last month",
      action: "View invoices",
      href: "/invoices"
    },
    {
      title: "Jobs at risk",
      value: "2 jobs",
      description: "Blocked >48h or missing parts",
      icon: AlertTriangle,
      trend: "Requires attention",
      action: "View jobs",
      href: "/jobs"
    },
    {
      title: "Overdue invoices",
      value: "3 invoices",
      description: "Past due date",
      icon: AlertTriangle,
      trend: "CHF 8,200 total",
      action: "Send reminders",
      href: "/invoices"
    },
    {
      title: "Team availability",
      value: "85%",
      description: "Next 7 days",
      icon: Users,
      trend: "4 technicians available",
      action: "Schedule jobs",
      href: "/jobs"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Link href="/quotes/new">
          <Button className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Decision Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {decisionCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={card.href}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.trend}
                  </p>
                  <p className="text-xs text-primary mt-2 font-medium">
                    {card.action} →
                  </p>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/quotes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Quotes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingQuotes ? "..." : draftQuotes}</div>
              <p className="text-xs text-muted-foreground">
                Ready to send
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/quotes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Quotes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingQuotes ? "..." : sentQuotes}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingClients ? "..." : totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Active clients
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/quotes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Quotes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingQuotes ? "..." : recentQuotes}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Feature Toggles - Quick Access */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest quotes and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotes.slice(0, 5).map((quote) => (
                <Link key={quote.id} href={`/quotes/${quote.id}`}>
                  <div className="flex items-center space-x-4 hover:bg-muted/50 rounded-lg p-3 cursor-pointer transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Quote #{quote.id.split('-')[1]} - {quote.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {quote.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      CHF {quote.total.toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <QuickFeatureToggle />
      </div>
    </div>
  );
}