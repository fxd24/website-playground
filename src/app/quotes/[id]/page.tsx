"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText,
  Plus,
  Camera,
  Send,
  Eye,
  Edit,
  Download,
  Users,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useApp } from "@/lib/context";
import { Quote, QuoteStatus, Product } from "@/lib/types";
import { QuoteService, ProductService, AIAgentService } from "@/lib/mock-services";
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

const statusIcons: Record<QuoteStatus, React.ComponentType<{ className?: string }>> = {
  Draft: FileText,
  UnderReview: Clock,
  Sent: Send,
  Viewed: Eye,
  Accepted: CheckCircle,
  Rejected: AlertCircle,
  Expired: AlertCircle,
};

export default function QuotePage() {
  const params = useParams();
  const router = useRouter();
  const { quotes, clients, products, updateQuoteStatus } = useApp();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [client, setClient] = useState<any>(null);
  const [building, setBuilding] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // AI Draft state
  const [isGeneratingAIDraft, setIsGeneratingAIDraft] = useState(false);
  const [aiRisks, setAiRisks] = useState<string[]>([]);
  const [aiMissingInfo, setAiMissingInfo] = useState<string[]>([]);

  // Product search for adding lines
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);

  const quoteId = params.id as string;

  useEffect(() => {
    loadQuote();
  }, [quoteId, quotes]);

  const loadQuote = async () => {
    setIsLoading(true);
    try {
      const foundQuote = quotes.find(q => q.id === quoteId) || await QuoteService.getById(quoteId);
      if (foundQuote) {
        setQuote(foundQuote);
        const foundClient = clients.find(c => c.id === foundQuote.clientId);
        setClient(foundClient);
      }
    } catch (error) {
      console.error('Error loading quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: QuoteStatus) => {
    if (!quote) return;

    setIsUpdating(true);
    try {
      const updatedQuote = await updateQuoteStatus(quote.id, newStatus);
      if (updatedQuote) {
        setQuote(updatedQuote);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAIGenerateDraft = async () => {
    setIsGeneratingAIDraft(true);
    try {
      // Mock AI generation - in real app this would use the capture session
      const result = await AIAgentService.generateQuoteDraft("mock-capture-session");
      setAiRisks(result.risks);
      setAiMissingInfo(result.missingInfo);

      // Add AI-suggested lines to quote (mock)
      if (quote && result.lines.length > 0) {
        const updatedQuote = await QuoteService.addLine(quote.id, result.lines[0]);
        if (updatedQuote) {
          setQuote(updatedQuote);
        }
      }
    } catch (error) {
      console.error('Error generating AI draft:', error);
    } finally {
      setIsGeneratingAIDraft(false);
    }
  };

  const handleSendQuote = async () => {
    // Mock PDF generation and email sending
    if (!quote) return;

    console.log(`Mock: Generating PDF for quote ${quote.id}`);
    console.log(`Mock: Sending email to ${client?.contacts[0]?.email}`);

    // Update status to Sent
    await handleStatusUpdate('Sent');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quote || !client) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
        <p className="text-muted-foreground">The quote you're looking for doesn't exist.</p>
      </div>
    );
  }

  const StatusIcon = statusIcons[quote.status];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quote #{quote.id.split('-')[1]}</h1>
            <p className="text-muted-foreground">{client.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[quote.status]}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {quote.status}
          </Badge>
          {quote.status === 'Accepted' && (
            <Button onClick={() => router.push(`/jobs/new?quoteId=${quote.id}`)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Convert to Job
            </Button>
          )}
        </div>
      </div>

      {/* Quote Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="font-medium">{client.name}</div>
              <div className="text-sm text-muted-foreground">{client.type}</div>
            </div>
            {client.contacts[0] && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {client.contacts[0].email}
                </div>
                {client.contacts[0].phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {client.contacts[0].phone}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {client.address.street}, {client.address.city} {client.address.postalCode}
            </div>
          </CardContent>
        </Card>

        {/* Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <span className="font-bold text-lg">CHF {quote.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tax Rate:</span>
              <span>{(quote.taxRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valid Until:</span>
              <span>{new Date(quote.createdAt.getTime() + quote.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created:</span>
              <span>{quote.createdAt.toLocaleDateString()}</span>
            </div>
            {quote.sentAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sent:</span>
                <span>{quote.sentAt.toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quote Lines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIGenerateDraft}
                disabled={isGeneratingAIDraft}
              >
                {isGeneratingAIDraft ? "Generating..." : "AI Draft"}
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Line
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {quote.lines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.description || 'No description'}</TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">CHF {line.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">CHF {line.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No line items yet</p>
              <Button onClick={handleAIGenerateDraft} disabled={isGeneratingAIDraft}>
                Generate with AI
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {(aiRisks.length > 0 || aiMissingInfo.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {aiRisks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Risks Identified</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiRisks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {aiMissingInfo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Missing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiMissingInfo.map((info, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{info}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quote.status === 'Draft' && (
              <>
                <Button onClick={() => handleStatusUpdate('UnderReview')}>
                  <Clock className="h-4 w-4 mr-1" />
                  Send for Review
                </Button>
                <Button variant="outline" onClick={handleSendQuote}>
                  <Send className="h-4 w-4 mr-1" />
                  Send Quote
                </Button>
              </>
            )}

            {quote.status === 'UnderReview' && (
              <>
                <Button onClick={() => handleStatusUpdate('Draft')}>
                  <Edit className="h-4 w-4 mr-1" />
                  Back to Draft
                </Button>
                <Button onClick={() => handleStatusUpdate('Sent')}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve & Send
                </Button>
              </>
            )}

            {quote.status === 'Sent' && (
              <>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-1" />
                  Resend Email
                </Button>
              </>
            )}

            <Button variant="outline">
              <Camera className="h-4 w-4 mr-1" />
              Add Media
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {(quote.notes || quote.internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quote.notes && (
              <div>
                <Label className="text-sm font-medium">Client Notes</Label>
                <p className="text-sm text-muted-foreground mt-1">{quote.notes}</p>
              </div>
            )}
            {quote.internalNotes && (
              <div>
                <Label className="text-sm font-medium">Internal Notes</Label>
                <p className="text-sm text-muted-foreground mt-1">{quote.internalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
