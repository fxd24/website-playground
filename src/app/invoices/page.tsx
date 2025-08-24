"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Plus,
  Search,
  Eye,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Download,
  CreditCard,
  Mail,
  Building2,
  Users
} from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { Invoice, InvoiceStatus, Job, Client, Building } from "@/lib/types";
import { motion } from "framer-motion";

const statusColors: Record<InvoiceStatus, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Issued: "bg-blue-100 text-blue-800",
  PartiallyPaid: "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Overdue: "bg-red-100 text-red-800",
  WrittenOff: "bg-orange-100 text-orange-800"
};

const statusIcons: Record<InvoiceStatus, React.ComponentType<{ className?: string }>> = {
  Draft: FileText,
  Issued: Clock,
  PartiallyPaid: CreditCard,
  Paid: CheckCircle,
  Overdue: AlertTriangle,
  WrittenOff: AlertTriangle
};

export default function InvoicesPage() {
  const {
    invoices,
    jobs,
    clients,
    buildings,
    isLoadingInvoices,
    updateInvoiceStatus,
    addPayment,
    sendInvoiceReminder,
    createInvoiceFromJob
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'credit_card' | 'check' | 'other'>('bank_transfer');
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Create invoice dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");

  const filteredInvoices = invoices.filter(invoice => {
    const job = jobs.find(j => j.id === invoice.jobId);
    const client = clients.find(c => c.id === invoice.clientId);

    const searchString = `${invoice.invoiceNumber} ${invoice.id} ${client?.name || ''} ${job?.title || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedInvoice.balance) return;

    await addPayment(selectedInvoice.id, {
      amount,
      paymentMethod,
      reference: paymentReference,
      notes: paymentNotes
    });

    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount("");
    setPaymentReference("");
    setPaymentNotes("");
  };

  const handleCreateInvoice = async () => {
    if (!selectedJobId) return;

    await createInvoiceFromJob(selectedJobId);
    setCreateDialogOpen(false);
    setSelectedJobId("");
  };

  // Calculate summary metrics
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'Paid' && inv.status !== 'WrittenOff')
    .reduce((sum, inv) => sum + inv.balance, 0);

  const overdueAmount = invoices
    .filter(inv => inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.balance, 0);

  const paidThisMonth = invoices
    .filter(inv => {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      return inv.status === 'Paid' &&
             inv.payments.some(p => {
               const paymentDate = new Date(p.paymentDate);
               return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
             });
    })
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;

  if (isLoadingInvoices) {
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
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and collections</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate an invoice from a completed job
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobSelect">Select Job</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a completed job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs
                      .filter(job => job.status === 'Completed')
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
              <Button onClick={handleCreateInvoice} disabled={!selectedJobId}>
                Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">CHF {overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{overdueInvoices} overdue invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">CHF {paidThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month's collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
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
            <SelectItem value="Issued">Issued</SelectItem>
            <SelectItem value="PartiallyPaid">Partially Paid</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="WrittenOff">Written Off</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {filteredInvoices.map((invoice, index) => {
                const job = jobs.find(j => j.id === invoice.jobId);
                const client = clients.find(c => c.id === invoice.clientId);
                const building = buildings.find(b => b.id === invoice.buildingId);
                const StatusIcon = statusIcons[invoice.status];

                const daysOverdue = invoice.status === 'Overdue' ?
                  Math.floor((Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {client?.name} • {job?.title}
                          </div>
                        </div>
                        <Badge className={statusColors[invoice.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {invoice.status}
                        </Badge>
                        {daysOverdue > 0 && (
                          <Badge variant="destructive">
                            {daysOverdue} days overdue
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {invoice.dueDate.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          CHF {invoice.total.toLocaleString()}
                        </div>
                        {invoice.balance > 0 && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <CreditCard className="h-3 w-3" />
                            Balance: CHF {invoice.balance.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {invoice.payments.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {invoice.payments.length} payment{invoice.payments.length !== 1 ? 's' : ''} received
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {invoice.status === 'Draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInvoiceStatus(invoice.id, 'Issued')}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Issue
                        </Button>
                      )}

                      {invoice.status === 'Issued' || invoice.status === 'PartiallyPaid' || invoice.status === 'Overdue' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentAmount(invoice.balance.toString());
                            setPaymentDialogOpen(true);
                          }}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Add Payment
                        </Button>
                      )}

                      {invoice.status === 'Overdue' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendInvoiceReminder(invoice.id)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Send Reminder
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
                {searchTerm || statusFilter !== "all" ? "No invoices found" : "No invoices yet"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount (CHF)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedInvoice?.balance || 0}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Balance: CHF {selectedInvoice?.balance.toLocaleString()}
              </p>
            </div>

            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Transaction ID, check number, etc."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Additional payment details..."
              />
            </div>

            <Button onClick={handleAddPayment} disabled={!paymentAmount}>
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
