"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, Eye, Edit, Send } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { QuoteStatus } from "@/lib/types";
import { motion } from "framer-motion";

const statusColors: Record<QuoteStatus, string> = {
  Draft: "bg-gray-100 text-gray-800",
  UnderReview: "bg-yellow-100 text-yellow-800",
  Sent: "bg-blue-100 text-blue-800",
  Viewed: "bg-purple-100 text-purple-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Expired: "bg-orange-100 text-orange-800",
};

export default function QuotesPage() {
  const { quotes, clients, isLoadingQuotes } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuotes = quotes.filter(quote => {
    const client = clients.find(c => c.id === quote.clientId);
    const searchString = `${quote.id} ${client?.name || ''} ${quote.status}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (isLoadingQuotes) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">Manage your quotes and proposals</p>
        </div>
        <Link href="/quotes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuotes.map((quote, index) => {
          const client = clients.find(c => c.id === quote.clientId);

          return (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/quotes/${quote.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Quote #{quote.id.split('-')[1]}</CardTitle>
                        <CardDescription>{client?.name}</CardDescription>
                      </div>
                      <Badge className={statusColors[quote.status]}>
                        {quote.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-medium">CHF {quote.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{quote.createdAt.toLocaleDateString()}</span>
                      </div>
                      {quote.sentAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sent:</span>
                          <span>{quote.sentAt.toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {quote.status === 'Draft' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                        {quote.status === 'Draft' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Send className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No quotes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first quote"}
          </p>
          {!searchTerm && (
            <Link href="/quotes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Quote
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
