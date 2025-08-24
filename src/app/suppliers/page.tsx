"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users
} from "lucide-react";
import { useApp } from "@/lib/context";
import { Supplier } from "@/lib/types";
import { motion } from "framer-motion";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800"
};

const ratingColors = {
  1: "text-red-600",
  2: "text-orange-600",
  3: "text-yellow-600",
  4: "text-blue-600",
  5: "text-green-600"
};

export default function SuppliersPage() {
  const { suppliers, purchaseOrders, isLoadingSuppliers } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? supplier.isActive : !supplier.isActive);
    const matchesCategory = categoryFilter === "all" || supplier.categories.includes(categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate supplier metrics
  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  const totalCategories = Array.from(new Set(suppliers.flatMap(s => s.categories))).length;
  const averageRating = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length : 0;

  // Get unique categories
  const categories = Array.from(new Set(suppliers.flatMap(s => s.categories)));

  // Get supplier performance metrics
  const getSupplierOrders = (supplierId: string) => {
    return purchaseOrders.filter(po => po.supplierId === supplierId);
  };

  const getSupplierMetrics = (supplier: Supplier) => {
    const orders = getSupplierOrders(supplier.id);
    const totalOrders = orders.length;
    const onTimeDeliveries = orders.filter(order => order.actualDeliveryDate && order.requestedDeliveryDate &&
      new Date(order.actualDeliveryDate) <= new Date(order.requestedDeliveryDate)).length;
    const onTimeRate = totalOrders > 0 ? (onTimeDeliveries / totalOrders) * 100 : 0;

    return {
      totalOrders,
      onTimeRate,
      avgLeadTime: supplier.leadTime
    };
  };

  if (isLoadingSuppliers) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage supplier relationships and performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Add a new supplier to your network
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" placeholder="Supplier Name" />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Name</Label>
                  <Input id="contact" placeholder="Contact Person" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="supplier@company.ch" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+41 XX XXX XX XX" />
                </div>
              </div>
              <div>
                <Label htmlFor="categories">Categories</Label>
                <Input id="categories" placeholder="Windows, Doors, Materials" />
              </div>
              <Button className="w-full">Add Supplier</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">Out of {suppliers.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
            <p className="text-xs text-muted-foreground">Purchase orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Suppliers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier, index) => {
          const metrics = getSupplierMetrics(supplier);
          const ratingColor = ratingColors[Math.round(supplier.rating) as keyof typeof ratingColors];

          return (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{supplier.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge className={statusColors[supplier.isActive ? 'active' : 'inactive']}>
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < supplier.rating ? ratingColor : 'text-gray-300'}`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-2 text-sm">
                    {supplier.contactName && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {supplier.contactName}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    {supplier.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {supplier.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.address.city}</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <div className="text-sm font-medium mb-2">Categories</div>
                    <div className="flex flex-wrap gap-1">
                      {supplier.categories.map((category, catIndex) => (
                        <Badge key={catIndex} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Lead Time</div>
                      <div className="font-medium">{supplier.leadTime} days</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Orders</div>
                      <div className="font-medium">{metrics.totalOrders}</div>
                    </div>
                  </div>

                  {/* Performance Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>On-Time Delivery</span>
                        <span>{Math.round(metrics.onTimeRate)}%</span>
                      </div>
                      <Progress value={metrics.onTimeRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Quality Rating</span>
                        <span>{supplier.qualityRating}%</span>
                      </div>
                      <Progress value={supplier.qualityRating} className="h-2" />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" || categoryFilter !== "all" ? "No suppliers found" : "No suppliers yet"}
          </p>
          {!searchTerm && statusFilter === "all" && categoryFilter === "all" && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Supplier
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
