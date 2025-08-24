"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, MapPin, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { motion } from "framer-motion";

export default function ClientsPage() {
  const { clients, isLoadingClients } = useApp();

  if (isLoadingClients) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {client.type}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{client.language}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {client.contacts[0] && (
                    <div className="space-y-1">
                      {client.contacts[0].email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {client.contacts[0].email}
                        </div>
                      )}
                      {client.contacts[0].phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {client.contacts[0].phone}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3" />
                    {client.address.city}, {client.address.country}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Created {client.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No clients yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first client
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        </div>
      )}
    </div>
  );
}
