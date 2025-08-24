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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Search,
  Eye,
  DollarSign,
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  Package,
  Building2,
  Users,
  Send,
  Download
} from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { PurchaseOrder, Supplier, Job, Client, Building } from "@/lib/types";
import { motion } from "framer-motion";

const statusColors: Record<PurchaseOrder['status'], string> = {
  Draft: "bg-gray-100 text-gray-800",
  Ordered: "bg-blue-100 text-blue-800",
  Confirmed: "bg-purple-100 text-purple-800",
  Shipped: "bg-yellow-100 text-yellow-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800"
};

const statusIcons: Record<PurchaseOrder['status'], React.ComponentType<{ className?: string }>> = {
  Draft: FileText,
  Ordered: Clock,
  Confirmed: CheckCircle,
  Shipped: Truck,
  Delivered: Package,
  Cancelled: AlertTriangle
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders,
    suppliers,
    jobs,
    clients,
    buildings,
    isLoadingPurchaseOrders,
    updatePurchaseOrderStatus,
    createPurchaseOrderFromJob
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Create PO dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    const supplier = suppliers.find(s => s.id === po.supplierId);
    const job = jobs.find(j => j.id === po.jobId);
    const client = clients.find(c => c.id === job?.clientId);

    const searchString = `${po.poNumber} ${supplier?.name || ''} ${job?.title || ''} ${client?.name || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreatePurchaseOrder = async () => {
    if (!selectedJobId || !selectedSupplierId) return;

    await createPurchaseOrderFromJob(selectedJobId, selectedSupplierId);
    setCreateDialogOpen(false);
    setSelectedJobId("");
    setSelectedSupplierId("");
  };

  // Calculate summary metrics
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.finalTotal, 0);
  const pendingOrders = purchaseOrders.filter(po => po.status === 'Ordered' || po.status === 'Confirmed').length;
  const overdueDeliveries = purchaseOrders.filter(po => {
    if (!po.requestedDeliveryDate || po.status === 'Delivered' || po.status === 'Cancelled') return false;
    return new Date() > po.requestedDeliveryDate;
  }).length;

  const deliveredThisMonth = purchaseOrders.filter(po => {
    if (!po.actualDeliveryDate) return false;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const deliveryDate = new Date(po.actualDeliveryDate);
    return deliveryDate.getMonth() === thisMonth && deliveryDate.getFullYear() === thisYear;
  }).length;

  if (isLoadingPurchaseOrders) {
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
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage supplier orders and procurement</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>
                Generate a purchase order from a job for a specific supplier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobSelect">Select Job</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs
                      .filter(job => job.status === 'InProgress' || job.status === 'Planned')
                      .map(job => {
                        const client = clients.find(c => c.id === job.clientId);
                        return (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title} - {client?.name}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplierSelect">Select Supplier</Label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers
                      .filter(supplier => supplier.isActive)
                      .map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} - {supplier.categories.join(', ')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreatePurchaseOrder} disabled={!selectedJobId || !selectedSupplierId}>
                Create Purchase Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All purchase orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Deliveries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueDeliveries}</div>
            <p className="text-xs text-muted-foreground">Past delivery date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered This Month</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchase orders..."
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
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Ordered">Ordered</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPurchaseOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredPurchaseOrders.map((po, index) => {
                const supplier = suppliers.find(s => s.id === po.supplierId);
                const job = jobs.find(j => j.id === po.jobId);
                const client = clients.find(c => c.id === job?.clientId);
                const StatusIcon = statusIcons[po.status];

                const daysOverdue = po.requestedDeliveryDate && po.status !== 'Delivered' && po.status !== 'Cancelled' ?
                  Math.max(0, Math.floor((Date.now() - po.requestedDeliveryDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;

                return (
                  <motion.div
                    key={po.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{po.poNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {supplier?.name} • {job?.title}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={statusColors[po.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {po.status}
                          </Badge>
                          <Badge className={priorityColors[po.priority]}>
                            {po.priority}
                          </Badge>
                          {daysOverdue > 0 && (
                            <Badge variant="destructive">
                              {daysOverdue} days overdue
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ordered: {po.orderDate.toLocaleDateString()}
                        </div>
                        {po.requestedDeliveryDate && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            Requested: {po.requestedDeliveryDate.toLocaleDateString()}
                          </div>
                        )}
                        {po.actualDeliveryDate && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Package className="h-3 w-3" />
                            Delivered: {po.actualDeliveryDate.toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          CHF {po.finalTotal.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {po.lines.length} item{po.lines.length !== 1 ? 's' : ''} • {client?.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {po.status === 'Draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePurchaseOrderStatus(po.id, 'Ordered')}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send Order
                        </Button>
                      )}

                      {po.status === 'Ordered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePurchaseOrderStatus(po.id, 'Confirmed')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                      )}

                      {po.status === 'Confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePurchaseOrderStatus(po.id, 'Shipped')}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Mark Shipped
                        </Button>
                      )}

                      {po.status === 'Shipped' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePurchaseOrderStatus(po.id, 'Delivered')}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          Mark Delivered
                        </Button>
                      )}

                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" ? "No purchase orders found" : "No purchase orders yet"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Purchase Order
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
