// Core types based on the README specification

export type Role = 'Owner' | 'Manager' | 'Technician' | 'Accountant' | 'Subcontractor' | 'ReadOnly';

// State machines as defined in README
export type QuoteStatus = 'Draft' | 'UnderReview' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired';
export type JobStatus = 'Planned' | 'Scheduled' | 'InProgress' | 'Blocked' | 'Completed' | 'Archived';
export type POStatus = 'Draft' | 'Ordered' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Inspected' | 'Closed' | 'Claimed';
export type InvoiceStatus = 'Draft' | 'Issued' | 'PartiallyPaid' | 'Paid' | 'Overdue' | 'WrittenOff';

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface Client {
  id: string;
  name: string;
  type: 'individual' | 'company';
  address: Address;
  contacts: Contact[];
  paymentTerms: string;
  language: 'DE' | 'FR' | 'IT' | 'EN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  id: string;
  clientId: string;
  name: string;
  address: Address;
  accessInfo?: string;
  photos: string[];
  contacts: Contact[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  unit: string;
  cost: number;
  markup: number;
  price: number;
  supplierId?: string;
}

export interface QuoteLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  description?: string;
  notes?: string;
}

export interface Quote {
  id: string;
  clientId: string;
  buildingId?: string;
  status: QuoteStatus;
  lines: QuoteLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  validityDays: number;
  notes?: string;
  internalNotes?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface Media {
  id: string;
  type: 'photo' | 'document' | 'voice';
  url: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  metadata?: {
    exif?: any;
    transcription?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface CaptureSession {
  id: string;
  quoteId: string;
  media: Media[];
  notes: string[];
  measurements: {
    id: string;
    type: string;
    value: number;
    unit: string;
    notes?: string;
  }[];
  createdAt: Date;
}

// AI Agent outputs
export interface QuoteDraft {
  lines: Omit<QuoteLine, 'id'>[];
  accessories: Product[];
  labor: {
    type: string;
    hours: number;
    rate: number;
    total: number;
  }[];
  risks: string[];
  missingInfo: string[];
}

export interface EventLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  agentId?: string;
  timestamp: Date;
  before?: any;
  after?: any;
  metadata?: any;
}

// Job-related types
export interface Task {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  actualHours?: number;
  assignedTo?: string;
  blockedReason?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  quoteId: string;
  status: JobStatus;
  title: string;
  description?: string;
  clientId: string;
  buildingId?: string;
  tasks: Task[];
  scheduledStartDate?: Date;
  scheduledEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  estimatedCost: number;
  actualCost?: number;
  laborHours?: number;
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTeam?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Invoice-related types
export interface InvoiceLine {
  id: string;
  jobId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  taxAmount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'bank_transfer' | 'cash' | 'credit_card' | 'check' | 'other';
  reference?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}



export interface Invoice {
  id: string;
  jobId: string;
  clientId: string;
  buildingId?: string;
  status: InvoiceStatus;
  invoiceNumber: string;
  lines: InvoiceLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balance: number;
  dueDate: Date;
  issueDate: Date;
  notes?: string;
  paymentTerms: string;
  qrReference?: string; // Swiss QR reference
  payments: Payment[];
  reminderCount: number;
  lastReminderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Order related types
export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  address: Address;
  website?: string;
  paymentTerms: string;
  taxId?: string;
  rating: number; // 1-5
  categories: string[]; // Materials, Labor, Equipment, etc.
  leadTime: number; // days
  onTimeDeliveryRate: number; // 0-100
  qualityRating: number; // 0-100
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderLine {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  taxAmount: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  jobId: string;
  supplierId: string;
  poNumber: string;
  status: 'Draft' | 'Ordered' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  lines: PurchaseOrderLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  shippingCost?: number;
  discount?: number;
  finalTotal: number;
  orderDate: Date;
  requestedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  paymentTerms: string;
  shippingAddress?: Address;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Team Management types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Owner' | 'Manager' | 'Technician' | 'Accountant' | 'Subcontractor' | 'ReadOnly';
  photo?: string;
  hourlyRate: number;
  skills: string[];
  certifications: {
    name: string;
    expiryDate: Date;
    issuingBody: string;
    status: 'valid' | 'expired' | 'expiring_soon';
  }[];
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  address?: Address;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  hireDate: Date;
  status: 'active' | 'inactive' | 'on_leave';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  teamMemberId: string;
  jobId: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in hours
  description?: string;
  billable: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamPerformance {
  teamMemberId: string;
  period: 'week' | 'month' | 'quarter';
  totalHours: number;
  billableHours: number;
  jobsCompleted: number;
  averageJobCompletionTime: number;
  customerSatisfaction: number;
  qualityRating: number;
  utilizationRate: number;
  overtimeHours: number;
}
