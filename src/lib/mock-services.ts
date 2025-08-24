import { Client, Building, Product, Quote, QuoteStatus, QuoteLine, CaptureSession, Media, Job, Task, JobStatus, Invoice, Payment, InvoiceStatus, Supplier, PurchaseOrder, PurchaseOrderLine, TeamMember, TimeEntry, TeamPerformance } from './types';
import { mockClients, mockBuildings, mockProducts, mockQuotes, mockCaptureSessions, mockJobs, mockTasks, mockInvoices, mockPayments, mockSuppliers, mockPurchaseOrders, mockTeamMembers, mockTimeEntries, mockTeamPerformance, addresses } from './mock-data';

// Simulate API delay
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Client services
export class ClientService {
  static async getAll(): Promise<Client[]> {
    await delay();
    return [...mockClients];
  }

  static async getById(id: string): Promise<Client | null> {
    await delay();
    return mockClients.find(client => client.id === id) || null;
  }

  static async search(query: string): Promise<Client[]> {
    await delay(300); // Simulate search delay
    const lowercaseQuery = query.toLowerCase();
    return mockClients.filter(client =>
      client.name.toLowerCase().includes(lowercaseQuery) ||
      client.contacts.some(contact =>
        contact.name.toLowerCase().includes(lowercaseQuery) ||
        contact.email.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  static async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    await delay();
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockClients.push(newClient);
    return newClient;
  }
}

// Building services
export class BuildingService {
  static async getByClientId(clientId: string): Promise<Building[]> {
    await delay();
    return mockBuildings.filter(building => building.clientId === clientId);
  }

  static async getById(id: string): Promise<Building | null> {
    await delay();
    return mockBuildings.find(building => building.id === id) || null;
  }

  static async create(building: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>): Promise<Building> {
    await delay();
    const newBuilding: Building = {
      ...building,
      id: `building-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockBuildings.push(newBuilding);
    return newBuilding;
  }
}

// Product services
export class ProductService {
  static async getAll(): Promise<Product[]> {
    await delay();
    return [...mockProducts];
  }

  static async getById(id: string): Promise<Product | null> {
    await delay();
    return mockProducts.find(product => product.id === id) || null;
  }

  static async search(query: string): Promise<Product[]> {
    await delay(200);
    const lowercaseQuery = query.toLowerCase();
    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.sku.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Quote services
export class QuoteService {
  static async getAll(): Promise<Quote[]> {
    await delay();
    return [...mockQuotes];
  }

  static async getById(id: string): Promise<Quote | null> {
    await delay();
    return mockQuotes.find(quote => quote.id === id) || null;
  }

  static async getByClientId(clientId: string): Promise<Quote[]> {
    await delay();
    return mockQuotes.filter(quote => quote.clientId === clientId);
  }

  static async create(quoteData: {
    clientId: string;
    buildingId?: string;
    lines: Omit<QuoteLine, 'id'>[];
    validityDays?: number;
    notes?: string;
    internalNotes?: string;
  }): Promise<Quote> {
    await delay();

    // Calculate totals
    const subtotal = quoteData.lines.reduce((sum, line) => sum + line.total, 0);
    const taxRate = 0.077; // Swiss VAT
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      clientId: quoteData.clientId,
      buildingId: quoteData.buildingId,
      status: 'Draft',
      lines: quoteData.lines.map(line => ({
        ...line,
        id: `line-${Date.now()}-${Math.random()}`
      })),
      subtotal,
      taxRate,
      taxAmount,
      total,
      validityDays: quoteData.validityDays || 30,
      notes: quoteData.notes,
      internalNotes: quoteData.internalNotes,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockQuotes.push(newQuote);
    return newQuote;
  }

  static async updateStatus(id: string, status: QuoteStatus): Promise<Quote | null> {
    await delay();
    const quoteIndex = mockQuotes.findIndex(quote => quote.id === id);
    if (quoteIndex === -1) return null;

    const quote = mockQuotes[quoteIndex];
    const updatedQuote: Quote = {
      ...quote,
      status,
      updatedAt: new Date(),
      ...(status === 'Sent' && { sentAt: new Date() }),
      ...(status === 'Accepted' && { acceptedAt: new Date() }),
      ...(status === 'Rejected' && { rejectedAt: new Date() })
    };

    mockQuotes[quoteIndex] = updatedQuote;
    return updatedQuote;
  }

  static async addLine(quoteId: string, line: Omit<QuoteLine, 'id'>): Promise<Quote | null> {
    await delay();
    const quoteIndex = mockQuotes.findIndex(quote => quote.id === quoteId);
    if (quoteIndex === -1) return null;

    const quote = mockQuotes[quoteIndex];
    const newLine: QuoteLine = {
      ...line,
      id: `line-${Date.now()}`
    };

    const updatedLines = [...quote.lines, newLine];
    const subtotal = updatedLines.reduce((sum, line) => sum + line.total, 0);
    const taxAmount = subtotal * quote.taxRate;
    const total = subtotal + taxAmount;

    const updatedQuote: Quote = {
      ...quote,
      lines: updatedLines,
      subtotal,
      taxAmount,
      total,
      updatedAt: new Date()
    };

    mockQuotes[quoteIndex] = updatedQuote;
    return updatedQuote;
  }

  // Mock PDF generation
  static async generatePDF(quoteId: string): Promise<string> {
    await delay(2000); // Simulate PDF generation time
    console.log(`Mock PDF generated for quote ${quoteId}`);
    return `/mock-pdfs/quote-${quoteId}.pdf`;
  }

  // Mock email sending
  static async sendEmail(quoteId: string, template: string): Promise<boolean> {
    await delay(1000);
    console.log(`Mock email sent for quote ${quoteId} using template: ${template}`);
    return true;
  }
}

// Capture Session services
export class CaptureSessionService {
  static async getByQuoteId(quoteId: string): Promise<CaptureSession | null> {
    await delay();
    return mockCaptureSessions.find(session => session.quoteId === quoteId) || null;
  }

  static async create(quoteId: string): Promise<CaptureSession> {
    await delay();
    const newSession: CaptureSession = {
      id: `capture-${Date.now()}`,
      quoteId,
      media: [],
      notes: [],
      measurements: [],
      createdAt: new Date()
    };
    mockCaptureSessions.push(newSession);
    return newSession;
  }

  static async addMedia(sessionId: string, media: Omit<Media, 'id' | 'uploadedAt'>): Promise<Media> {
    await delay();
    const sessionIndex = mockCaptureSessions.findIndex(session => session.id === sessionId);
    if (sessionIndex === -1) throw new Error('Session not found');

    const newMedia: Media = {
      ...media,
      id: `media-${Date.now()}`,
      uploadedAt: new Date()
    };

    mockCaptureSessions[sessionIndex].media.push(newMedia);
    return newMedia;
  }

  static async addNote(sessionId: string, note: string): Promise<string[]> {
    await delay();
    const sessionIndex = mockCaptureSessions.findIndex(session => session.id === sessionId);
    if (sessionIndex === -1) throw new Error('Session not found');

    mockCaptureSessions[sessionIndex].notes.push(note);
    return mockCaptureSessions[sessionIndex].notes;
  }
}

// AI Agent mock services
export class AIAgentService {
  static async generateQuoteDraft(captureSessionId: string): Promise<{
    lines: Omit<QuoteLine, 'id'>[];
    risks: string[];
    missingInfo: string[];
  }> {
    await delay(3000); // Simulate AI processing time

    // Mock AI response based on typical scenarios
    return {
      lines: [
        {
          productId: 'product-1',
          quantity: 2,
          unitPrice: 350,
          total: 700,
          description: 'Standard windows based on captured measurements'
        },
        {
          productId: 'product-4',
          quantity: 4,
          unitPrice: 120,
          total: 480,
          description: 'Installation labor for windows'
        }
      ],
      risks: [
        'Weather conditions may affect installation timeline',
        'Additional measurements needed for custom sizing'
      ],
      missingInfo: [
        'Customer preferences for window color',
        'Exact installation date requirements',
        'Access restrictions or special requirements'
      ]
    };
  }

  static async processOCR(imageUrl: string): Promise<string> {
    await delay(2000);
    return "Mock OCR result: Window dimensions detected - 120cm x 120cm, Material: PVC, Color: White";
  }
}

// Job services
export class JobService {
  static async getAll(): Promise<Job[]> {
    await delay();
    return [...mockJobs];
  }

  static async getById(id: string): Promise<Job | null> {
    await delay();
    return mockJobs.find(job => job.id === id) || null;
  }

  static async getByQuoteId(quoteId: string): Promise<Job | null> {
    await delay();
    return mockJobs.find(job => job.quoteId === quoteId) || null;
  }

  static async createFromQuote(quoteId: string, data?: {
    title?: string;
    description?: string;
    scheduledStartDate?: Date;
    scheduledEndDate?: Date;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<Job> {
    await delay();

    const quote = mockQuotes.find(q => q.id === quoteId);
    if (!quote) throw new Error('Quote not found');

    // Create default tasks based on quote items
    const defaultTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        jobId: '',
        title: 'Site preparation and access setup',
        description: 'Clear workspace, set up safety barriers, prepare access points',
        status: 'pending',
        priority: 'high',
        estimatedHours: 4,
        assignedTo: undefined
      },
      {
        jobId: '',
        title: 'Installation work',
        description: `Install ${quote.lines.length} items from quote`,
        status: 'pending',
        priority: 'medium',
        estimatedHours: quote.lines.length * 2,
        assignedTo: undefined
      },
      {
        jobId: '',
        title: 'Quality inspection and cleanup',
        description: 'Final inspection, cleanup, and handover',
        status: 'pending',
        priority: 'low',
        estimatedHours: 2,
        assignedTo: undefined
      }
    ];

    const jobId = `job-${Date.now()}`;
    const tasks: Task[] = defaultTasks.map(task => ({
      ...task,
      id: `task-${Date.now()}-${Math.random()}`,
      jobId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const newJob: Job = {
      id: jobId,
      quoteId,
      status: 'Planned',
      title: data?.title || `Job from Quote ${quote.id.split('-')[1]}`,
      description: data?.description || `Job created from accepted quote`,
      clientId: quote.clientId,
      buildingId: quote.buildingId,
      tasks,
      scheduledStartDate: data?.scheduledStartDate,
      scheduledEndDate: data?.scheduledEndDate,
      estimatedCost: quote.total,
      progress: 0,
      priority: data?.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockJobs.push(newJob);
    return newJob;
  }

  static async updateStatus(id: string, status: JobStatus): Promise<Job | null> {
    await delay();
    const jobIndex = mockJobs.findIndex(job => job.id === id);
    if (jobIndex === -1) return null;

    const job = mockJobs[jobIndex];
    const updatedJob: Job = {
      ...job,
      status,
      updatedAt: new Date(),
      ...(status === 'InProgress' && !job.actualStartDate && { actualStartDate: new Date() }),
      ...(status === 'Completed' && !job.actualEndDate && { actualEndDate: new Date() })
    };

    mockJobs[jobIndex] = updatedJob;
    return updatedJob;
  }

  static async updateProgress(id: string, progress: number): Promise<Job | null> {
    await delay();
    const jobIndex = mockJobs.findIndex(job => job.id === id);
    if (jobIndex === -1) return null;

    const job = mockJobs[jobIndex];
    const updatedJob: Job = {
      ...job,
      progress: Math.max(0, Math.min(100, progress)),
      updatedAt: new Date()
    };

    mockJobs[jobIndex] = updatedJob;
    return updatedJob;
  }
}

// Task services
export class TaskService {
  static async getByJobId(jobId: string): Promise<Task[]> {
    await delay();
    return mockTasks.filter(task => task.jobId === jobId);
  }

  static async updateStatus(taskId: string, status: Task['status'], data?: {
    actualHours?: number;
    blockedReason?: string;
  }): Promise<Task | null> {
    await delay();
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return null;

    const task = mockTasks[taskIndex];
    const updatedTask: Task = {
      ...task,
      status,
      updatedAt: new Date(),
      ...(data?.actualHours !== undefined && { actualHours: data.actualHours }),
      ...(data?.blockedReason !== undefined && { blockedReason: data.blockedReason })
    };

    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  static async assignTo(taskId: string, userId: string): Promise<Task | null> {
    await delay();
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return null;

    const task = mockTasks[taskIndex];
    const updatedTask: Task = {
      ...task,
      assignedTo: userId,
      updatedAt: new Date()
    };

    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  }
}

// Invoice services
export class InvoiceService {
  static async getAll(): Promise<Invoice[]> {
    await delay();
    return [...mockInvoices];
  }

  static async getById(id: string): Promise<Invoice | null> {
    await delay();
    return mockInvoices.find(invoice => invoice.id === id) || null;
  }

  static async getByJobId(jobId: string): Promise<Invoice[]> {
    await delay();
    return mockInvoices.filter(invoice => invoice.jobId === jobId);
  }

  static async getByClientId(clientId: string): Promise<Invoice[]> {
    await delay();
    return mockInvoices.filter(invoice => invoice.clientId === clientId);
  }

  static async createFromJob(jobId: string, data?: {
    lines?: Omit<QuoteLine, 'id'>[];
    dueDate?: Date;
    paymentTerms?: string;
    notes?: string;
  }): Promise<Invoice> {
    await delay();

    const job = mockJobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const invoiceNumber = `INV-2024-${String(mockInvoices.length + 1).padStart(3, '0')}`;

    // Default lines based on job cost
    const defaultLines = [
      {
        id: `inv-line-${Date.now()}`,
        jobId,
        description: job.title,
        quantity: 1,
        unitPrice: job.actualCost || job.estimatedCost,
        total: job.actualCost || job.estimatedCost,
        taxRate: 0.077,
        taxAmount: ((job.actualCost || job.estimatedCost) * 0.077)
      }
    ];

    const lines = data?.lines || defaultLines;
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const taxAmount = subtotal * 0.077;
    const total = subtotal + taxAmount;

    const newInvoice: Invoice = {
      id: `invoice-${Date.now()}`,
      jobId,
      clientId: job.clientId,
      buildingId: job.buildingId,
      status: 'Draft',
      invoiceNumber,
      lines: lines.map(line => {
        const taxRate = (line as any).taxRate || 0.077;
        const taxAmount = (line as any).taxAmount || (line.total * 0.077);
        return {
          id: (line as any).id || `inv-line-${Date.now()}`,
          description: (line as any).description || 'Invoice line',
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          total: line.total,
          taxRate,
          taxAmount
        };
      }),
      subtotal,
      taxRate: 0.077,
      taxAmount,
      total,
      paidAmount: 0,
      balance: total,
      dueDate: data?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      issueDate: new Date(),
      paymentTerms: data?.paymentTerms || 'NET 30',
      qrReference: `21000000000313947143000${String(mockInvoices.length + 1).padStart(3, '0')}`,
      payments: [],
      reminderCount: 0,
      notes: data?.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockInvoices.push(newInvoice);
    return newInvoice;
  }

  static async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice | null> {
    await delay();
    const invoiceIndex = mockInvoices.findIndex(invoice => invoice.id === id);
    if (invoiceIndex === -1) return null;

    const invoice = mockInvoices[invoiceIndex];
    const updatedInvoice: Invoice = {
      ...invoice,
      status,
      updatedAt: new Date()
    };

    mockInvoices[invoiceIndex] = updatedInvoice;
    return updatedInvoice;
  }

  static async addPayment(invoiceId: string, payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice | null> {
    await delay();
    const invoiceIndex = mockInvoices.findIndex(invoice => invoice.id === invoiceId);
    if (invoiceIndex === -1) return null;

    const invoice = mockInvoices[invoiceIndex];
    const newPayment: Payment = {
      ...payment,
      id: `payment-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedInvoice: Invoice = {
      ...invoice,
      payments: [...invoice.payments, newPayment],
      paidAmount: invoice.paidAmount + payment.amount,
      balance: invoice.balance - payment.amount,
      status: invoice.balance - payment.amount <= 0 ? 'Paid' : invoice.status,
      updatedAt: new Date()
    };

    mockInvoices[invoiceIndex] = updatedInvoice;
    return updatedInvoice;
  }

  static async sendReminder(id: string): Promise<Invoice | null> {
    await delay();
    const invoiceIndex = mockInvoices.findIndex(invoice => invoice.id === id);
    if (invoiceIndex === -1) return null;

    const invoice = mockInvoices[invoiceIndex];
    const updatedInvoice: Invoice = {
      ...invoice,
      reminderCount: invoice.reminderCount + 1,
      lastReminderDate: new Date(),
      updatedAt: new Date()
    };

    mockInvoices[invoiceIndex] = updatedInvoice;
    return updatedInvoice;
  }

  // Mock PDF generation
  static async generatePDF(id: string): Promise<string> {
    await delay(2000);
    console.log(`Mock PDF generated for invoice ${id}`);
    return `/mock-pdfs/invoice-${id}.pdf`;
  }

  // Mock email sending
  static async sendEmail(id: string, template: string): Promise<boolean> {
    await delay(1000);
    console.log(`Mock email sent for invoice ${id} using template: ${template}`);
    return true;
  }


}

// Supplier services
export class SupplierService {
  static async getAll(): Promise<Supplier[]> {
    await delay();
    return [...mockSuppliers];
  }

  static async getById(id: string): Promise<Supplier | null> {
    await delay();
    return mockSuppliers.find(supplier => supplier.id === id) || null;
  }

  static async getByCategory(category: string): Promise<Supplier[]> {
    await delay();
    return mockSuppliers.filter(supplier => supplier.categories.includes(category));
  }

  static async search(query: string): Promise<Supplier[]> {
    await delay(300);
    const lowercaseQuery = query.toLowerCase();
    return mockSuppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(lowercaseQuery) ||
      supplier.contactName?.toLowerCase().includes(lowercaseQuery) ||
      supplier.email.toLowerCase().includes(lowercaseQuery) ||
      supplier.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
    );
  }

  static async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    await delay();
    const newSupplier: Supplier = {
      ...supplier,
      id: `supplier-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  }

  static async update(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    await delay();
    const supplierIndex = mockSuppliers.findIndex(supplier => supplier.id === id);
    if (supplierIndex === -1) return null;

    const updatedSupplier: Supplier = {
      ...mockSuppliers[supplierIndex],
      ...updates,
      updatedAt: new Date()
    };

    mockSuppliers[supplierIndex] = updatedSupplier;
    return updatedSupplier;
  }
}

// Purchase Order services
export class PurchaseOrderService {
  static async getAll(): Promise<PurchaseOrder[]> {
    await delay();
    return [...mockPurchaseOrders];
  }

  static async getById(id: string): Promise<PurchaseOrder | null> {
    await delay();
    return mockPurchaseOrders.find(po => po.id === id) || null;
  }

  static async getByJobId(jobId: string): Promise<PurchaseOrder[]> {
    await delay();
    return mockPurchaseOrders.filter(po => po.jobId === jobId);
  }

  static async getBySupplierId(supplierId: string): Promise<PurchaseOrder[]> {
    await delay();
    return mockPurchaseOrders.filter(po => po.supplierId === supplierId);
  }

  static async createFromJob(jobId: string, supplierId: string, data?: {
    lines?: Omit<PurchaseOrderLine, 'id'>[];
    requestedDeliveryDate?: Date;
    paymentTerms?: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<PurchaseOrder> {
    await delay();

    const job = mockJobs.find(j => j.id === jobId);
    const supplier = mockSuppliers.find(s => s.id === supplierId);

    if (!job || !supplier) throw new Error('Job or supplier not found');

    const poNumber = `PO-2024-${String(mockPurchaseOrders.length + 1).padStart(3, '0')}`;

    // Default lines based on job requirements
    const defaultLines: Omit<PurchaseOrderLine, 'id'>[] = [
      {
        description: `Materials for ${job.title}`,
        quantity: 1,
        unitPrice: job.estimatedCost * 0.6, // 60% materials
        total: job.estimatedCost * 0.6,
        taxRate: 0.077,
        taxAmount: (job.estimatedCost * 0.6) * 0.077
      }
    ];

    const lines = data?.lines || defaultLines;
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const taxAmount = subtotal * 0.077;
    const total = subtotal + taxAmount;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      jobId,
      supplierId,
      poNumber,
      status: 'Draft',
      lines: lines.map(line => ({
        ...line,
        id: `po-line-${Date.now()}-${Math.random()}`
      })),
      subtotal,
      taxRate: 0.077,
      taxAmount,
      total,
      shippingCost: 0,
      discount: 0,
      finalTotal: total,
      orderDate: new Date(),
      requestedDeliveryDate: data?.requestedDeliveryDate || new Date(Date.now() + supplier.leadTime * 24 * 60 * 60 * 1000),
      paymentTerms: data?.paymentTerms || supplier.paymentTerms,
      shippingAddress: job.buildingId ? mockBuildings.find(b => b.id === job.buildingId)?.address : {
        street: 'Default Address',
        city: 'Default City',
        postalCode: '0000',
        country: 'Switzerland'
      },
      notes: data?.notes,
      priority: data?.priority || 'medium',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockPurchaseOrders.push(newPO);
    return newPO;
  }

  static async updateStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder | null> {
    await delay();
    const poIndex = mockPurchaseOrders.findIndex(po => po.id === id);
    if (poIndex === -1) return null;

    const po = mockPurchaseOrders[poIndex];
    const updatedPO: PurchaseOrder = {
      ...po,
      status,
      updatedAt: new Date(),
      ...(status === 'Delivered' && !po.actualDeliveryDate && { actualDeliveryDate: new Date() })
    };

    mockPurchaseOrders[poIndex] = updatedPO;
    return updatedPO;
  }

  static async update(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    await delay();
    const poIndex = mockPurchaseOrders.findIndex(po => po.id === id);
    if (poIndex === -1) return null;

    const updatedPO: PurchaseOrder = {
      ...mockPurchaseOrders[poIndex],
      ...updates,
      updatedAt: new Date()
    };

    mockPurchaseOrders[poIndex] = updatedPO;
    return updatedPO;
  }

  // Mock PDF generation
  static async generatePDF(id: string): Promise<string> {
    await delay(2000);
    console.log(`Mock PDF generated for purchase order ${id}`);
    return `/mock-pdfs/purchase-order-${id}.pdf`;
  }

  // Mock email sending
  static async sendEmail(id: string, template: string): Promise<boolean> {
    await delay(1000);
    console.log(`Mock email sent for purchase order ${id} using template: ${template}`);
    return true;
  }
}

// Team services
export class TeamService {
  static async getAll(): Promise<TeamMember[]> {
    await delay();
    return [...mockTeamMembers];
  }

  static async getById(id: string): Promise<TeamMember | null> {
    await delay();
    return mockTeamMembers.find(member => member.id === id) || null;
  }

  static async getByRole(role: TeamMember['role']): Promise<TeamMember[]> {
    await delay();
    return mockTeamMembers.filter(member => member.role === role);
  }

  static async getBySkill(skill: string): Promise<TeamMember[]> {
    await delay();
    return mockTeamMembers.filter(member => member.skills.includes(skill));
  }

  static async getAvailableForDate(date: Date): Promise<TeamMember[]> {
    await delay();
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof TeamMember['availability'];

    return mockTeamMembers.filter(member => {
      if (member.status !== 'active') return false;
      return member.availability[dayOfWeek];
    });
  }

  static async updateAvailability(id: string, availability: TeamMember['availability']): Promise<TeamMember | null> {
    await delay();
    const memberIndex = mockTeamMembers.findIndex(member => member.id === id);
    if (memberIndex === -1) return null;

    const updatedMember: TeamMember = {
      ...mockTeamMembers[memberIndex],
      availability,
      updatedAt: new Date()
    };

    mockTeamMembers[memberIndex] = updatedMember;
    return updatedMember;
  }

  static async create(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
    await delay();
    const newMember: TeamMember = {
      ...member,
      id: `user-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockTeamMembers.push(newMember);
    return newMember;
  }

  static async update(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    await delay();
    const memberIndex = mockTeamMembers.findIndex(member => member.id === id);
    if (memberIndex === -1) return null;

    const updatedMember: TeamMember = {
      ...mockTeamMembers[memberIndex],
      ...updates,
      updatedAt: new Date()
    };

    mockTeamMembers[memberIndex] = updatedMember;
    return updatedMember;
  }
}

// Time tracking services
export class TimeTrackingService {
  static async getAll(): Promise<TimeEntry[]> {
    await delay();
    return [...mockTimeEntries];
  }

  static async getByTeamMemberId(teamMemberId: string): Promise<TimeEntry[]> {
    await delay();
    return mockTimeEntries.filter(entry => entry.teamMemberId === teamMemberId);
  }

  static async getByJobId(jobId: string): Promise<TimeEntry[]> {
    await delay();
    return mockTimeEntries.filter(entry => entry.jobId === jobId);
  }

  static async getByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    await delay();
    return mockTimeEntries.filter(entry => {
      const entryDate = entry.date;
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  static async startTimer(teamMemberId: string, jobId: string, description?: string): Promise<TimeEntry> {
    await delay();
    const newEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      teamMemberId,
      jobId,
      date: new Date(),
      startTime: new Date(),
      description,
      billable: true,
      approved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockTimeEntries.push(newEntry);
    return newEntry;
  }

  static async stopTimer(entryId: string): Promise<TimeEntry | null> {
    await delay();
    const entryIndex = mockTimeEntries.findIndex(entry => entry.id === entryId);
    if (entryIndex === -1) return null;

    const entry = mockTimeEntries[entryIndex];
    const endTime = new Date();
    const duration = (endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60); // hours

    const updatedEntry: TimeEntry = {
      ...entry,
      endTime,
      duration,
      updatedAt: new Date()
    };

    mockTimeEntries[entryIndex] = updatedEntry;
    return updatedEntry;
  }

  static async approveEntry(entryId: string, approverId: string): Promise<TimeEntry | null> {
    await delay();
    const entryIndex = mockTimeEntries.findIndex(entry => entry.id === entryId);
    if (entryIndex === -1) return null;

    const entry = mockTimeEntries[entryIndex];
    const updatedEntry: TimeEntry = {
      ...entry,
      approved: true,
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedAt: new Date()
    };

    mockTimeEntries[entryIndex] = updatedEntry;
    return updatedEntry;
  }

  static async getPendingApprovals(): Promise<TimeEntry[]> {
    await delay();
    return mockTimeEntries.filter(entry => !entry.approved);
  }

  static async getTeamPerformance(teamMemberId: string, period: 'week' | 'month' | 'quarter'): Promise<TeamPerformance | null> {
    await delay();
    return mockTeamPerformance.find(perf => perf.teamMemberId === teamMemberId && perf.period === period) || null;
  }

  static async getAllTeamPerformance(period: 'week' | 'month' | 'quarter'): Promise<TeamPerformance[]> {
    await delay();
    return mockTeamPerformance.filter(perf => perf.period === period);
  }
}
