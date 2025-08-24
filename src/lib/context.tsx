'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Building, Product, Quote, QuoteStatus, Role, Job, Task, JobStatus, Invoice, InvoiceStatus, Supplier, PurchaseOrder, TeamMember, TimeEntry, TeamPerformance } from './types';
import { ClientService, BuildingService, ProductService, QuoteService, JobService, TaskService, InvoiceService, SupplierService, PurchaseOrderService, TeamService, TimeTrackingService } from './mock-services';

interface AppContextType {
  // Data
  clients: Client[];
  buildings: Building[];
  products: Product[];
  quotes: Quote[];
  jobs: Job[];
  invoices: Invoice[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  teamMembers: TeamMember[];
  timeEntries: TimeEntry[];

  // Loading states
  isLoadingClients: boolean;
  isLoadingBuildings: boolean;
  isLoadingProducts: boolean;
  isLoadingQuotes: boolean;
  isLoadingJobs: boolean;
  isLoadingInvoices: boolean;
  isLoadingSuppliers: boolean;
  isLoadingPurchaseOrders: boolean;
  isLoadingTeamMembers: boolean;
  isLoadingTimeEntries: boolean;

  // Actions
  refreshClients: () => Promise<void>;
  refreshQuotes: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshSuppliers: () => Promise<void>;
  refreshPurchaseOrders: () => Promise<void>;
  refreshTeamMembers: () => Promise<void>;
  refreshTimeEntries: () => Promise<void>;
  createQuote: (data: {
    clientId: string;
    buildingId?: string;
    lines: any[];
    validityDays?: number;
    notes?: string;
    internalNotes?: string;
  }) => Promise<Quote>;
  updateQuoteStatus: (id: string, status: QuoteStatus) => Promise<Quote | null>;
  createJobFromQuote: (quoteId: string, data?: {
    title?: string;
    description?: string;
    scheduledStartDate?: Date;
    scheduledEndDate?: Date;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => Promise<Job>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<Job | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task | null>;
  createInvoiceFromJob: (jobId: string, data?: {
    lines?: any[];
    dueDate?: Date;
    paymentTerms?: string;
    notes?: string;
  }) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<Invoice | null>;
  addPayment: (invoiceId: string, payment: {
    amount: number;
    paymentMethod: 'bank_transfer' | 'cash' | 'credit_card' | 'check' | 'other';
    reference?: string;
    notes?: string;
  }) => Promise<Invoice | null>;
  sendInvoiceReminder: (id: string) => Promise<Invoice | null>;
  createPurchaseOrderFromJob: (jobId: string, supplierId: string, data?: {
    lines?: any[];
    requestedDeliveryDate?: Date;
    paymentTerms?: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => Promise<PurchaseOrder>;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder['status']) => Promise<PurchaseOrder | null>;
  startTimeEntry: (teamMemberId: string, jobId: string, description?: string) => Promise<TimeEntry>;
  stopTimeEntry: (entryId: string) => Promise<TimeEntry | null>;
  approveTimeEntry: (entryId: string, approverId: string) => Promise<TimeEntry | null>;
  getPendingTimeApprovals: () => Promise<TimeEntry[]>;
  getTeamPerformance: (teamMemberId: string, period: 'week' | 'month' | 'quarter') => Promise<TeamPerformance | null>;

  // Current user (mocked)
  currentUser: {
    id: string;
    name: string;
    role: Role;
    email: string;
  };

  // UI state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Loading states
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isLoadingPurchaseOrders, setIsLoadingPurchaseOrders] = useState(true);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(true);
  const [isLoadingTimeEntries, setIsLoadingTimeEntries] = useState(true);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock current user
  const currentUser = {
    id: 'user-1',
    name: 'John Technician',
    role: 'Technician' as Role,
    email: 'john.technician@company.com'
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load products (always needed)
      setIsLoadingProducts(true);
      const productsData = await ProductService.getAll();
      setProducts(productsData);
      setIsLoadingProducts(false);

      // Load clients
      setIsLoadingClients(true);
      const clientsData = await ClientService.getAll();
      setClients(clientsData);
      setIsLoadingClients(false);

      // Load quotes
      setIsLoadingQuotes(true);
      const quotesData = await QuoteService.getAll();
      setQuotes(quotesData);
      setIsLoadingQuotes(false);

      // Load jobs
      setIsLoadingJobs(true);
      const jobsData = await JobService.getAll();
      setJobs(jobsData);
      setIsLoadingJobs(false);

      // Load invoices
      setIsLoadingInvoices(true);
      const invoicesData = await InvoiceService.getAll();
      setInvoices(invoicesData);
      setIsLoadingInvoices(false);

      // Load suppliers
      setIsLoadingSuppliers(true);
      const suppliersData = await SupplierService.getAll();
      setSuppliers(suppliersData);
      setIsLoadingSuppliers(false);

      // Load purchase orders
      setIsLoadingPurchaseOrders(true);
      const purchaseOrdersData = await PurchaseOrderService.getAll();
      setPurchaseOrders(purchaseOrdersData);
      setIsLoadingPurchaseOrders(false);

      // Load team members
      setIsLoadingTeamMembers(true);
      const teamMembersData = await TeamService.getAll();
      setTeamMembers(teamMembersData);
      setIsLoadingTeamMembers(false);

      // Load time entries
      setIsLoadingTimeEntries(true);
      const timeEntriesData = await TimeTrackingService.getAll();
      setTimeEntries(timeEntriesData);
      setIsLoadingTimeEntries(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const refreshClients = async () => {
    setIsLoadingClients(true);
    try {
      const clientsData = await ClientService.getAll();
      setClients(clientsData);
    } catch (error) {
      console.error('Error refreshing clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const refreshQuotes = async () => {
    setIsLoadingQuotes(true);
    try {
      const quotesData = await QuoteService.getAll();
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error refreshing quotes:', error);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const refreshJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const jobsData = await JobService.getAll();
      setJobs(jobsData);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const refreshInvoices = async () => {
    setIsLoadingInvoices(true);
    try {
      const invoicesData = await InvoiceService.getAll();
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error refreshing invoices:', error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const refreshSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const suppliersData = await SupplierService.getAll();
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error refreshing suppliers:', error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const refreshPurchaseOrders = async () => {
    setIsLoadingPurchaseOrders(true);
    try {
      const purchaseOrdersData = await PurchaseOrderService.getAll();
      setPurchaseOrders(purchaseOrdersData);
    } catch (error) {
      console.error('Error refreshing purchase orders:', error);
    } finally {
      setIsLoadingPurchaseOrders(false);
    }
  };

  const refreshTeamMembers = async () => {
    setIsLoadingTeamMembers(true);
    try {
      const teamMembersData = await TeamService.getAll();
      setTeamMembers(teamMembersData);
    } catch (error) {
      console.error('Error refreshing team members:', error);
    } finally {
      setIsLoadingTeamMembers(false);
    }
  };

  const refreshTimeEntries = async () => {
    setIsLoadingTimeEntries(true);
    try {
      const timeEntriesData = await TimeTrackingService.getAll();
      setTimeEntries(timeEntriesData);
    } catch (error) {
      console.error('Error refreshing time entries:', error);
    } finally {
      setIsLoadingTimeEntries(false);
    }
  };

  const createQuote = async (data: {
    clientId: string;
    buildingId?: string;
    lines: any[];
    validityDays?: number;
    notes?: string;
    internalNotes?: string;
  }) => {
    const newQuote = await QuoteService.create(data);
    setQuotes(prev => [...prev, newQuote]);
    return newQuote;
  };

  const updateQuoteStatus = async (id: string, status: QuoteStatus) => {
    const updatedQuote = await QuoteService.updateStatus(id, status);
    if (updatedQuote) {
      setQuotes(prev => prev.map(quote =>
        quote.id === id ? updatedQuote : quote
      ));
    }
    return updatedQuote;
  };

  const createJobFromQuote = async (quoteId: string, data?: {
    title?: string;
    description?: string;
    scheduledStartDate?: Date;
    scheduledEndDate?: Date;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    const newJob = await JobService.createFromQuote(quoteId, data);
    setJobs(prev => [...prev, newJob]);
    return newJob;
  };

  const updateJobStatus = async (id: string, status: JobStatus) => {
    const updatedJob = await JobService.updateStatus(id, status);
    if (updatedJob) {
      setJobs(prev => prev.map(job =>
        job.id === id ? updatedJob : job
      ));
    }
    return updatedJob;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Find the job that contains this task
    const jobWithTask = jobs.find(job => job.tasks.some(task => task.id === taskId));
    if (!jobWithTask) return null;

    const updatedTasks = jobWithTask.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );

    const updatedJob = { ...jobWithTask, tasks: updatedTasks };
    setJobs(prev => prev.map(job =>
      job.id === jobWithTask.id ? updatedJob : job
    ));

    return updatedTasks.find(task => task.id === taskId) || null;
  };



  const createInvoiceFromJob = async (jobId: string, data?: {
    lines?: any[];
    dueDate?: Date;
    paymentTerms?: string;
    notes?: string;
  }) => {
    const newInvoice = await InvoiceService.createFromJob(jobId, data);
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    const updatedInvoice = await InvoiceService.updateStatus(id, status);
    if (updatedInvoice) {
      setInvoices(prev => prev.map(invoice =>
        invoice.id === id ? updatedInvoice : invoice
      ));
    }
    return updatedInvoice;
  };

  const addPayment = async (invoiceId: string, payment: {
    amount: number;
    paymentMethod: 'bank_transfer' | 'cash' | 'credit_card' | 'check' | 'other';
    reference?: string;
    notes?: string;
  }) => {
    const updatedInvoice = await InvoiceService.addPayment(invoiceId, {
      invoiceId,
      ...payment,
      paymentDate: new Date(),
      status: 'completed'
    });
    if (updatedInvoice) {
      setInvoices(prev => prev.map(invoice =>
        invoice.id === invoiceId ? updatedInvoice : invoice
      ));
    }
    return updatedInvoice;
  };

  const sendInvoiceReminder = async (id: string) => {
    const updatedInvoice = await InvoiceService.sendReminder(id);
    if (updatedInvoice) {
      setInvoices(prev => prev.map(invoice =>
        invoice.id === id ? updatedInvoice : invoice
      ));
    }
    return updatedInvoice;
  };

  const createPurchaseOrderFromJob = async (jobId: string, supplierId: string, data?: {
    lines?: any[];
    requestedDeliveryDate?: Date;
    paymentTerms?: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    const newPurchaseOrder = await PurchaseOrderService.createFromJob(jobId, supplierId, data);
    setPurchaseOrders(prev => [...prev, newPurchaseOrder]);
    return newPurchaseOrder;
  };

  const updatePurchaseOrderStatus = async (id: string, status: PurchaseOrder['status']) => {
    const updatedPurchaseOrder = await PurchaseOrderService.updateStatus(id, status);
    if (updatedPurchaseOrder) {
      setPurchaseOrders(prev => prev.map(po =>
        po.id === id ? updatedPurchaseOrder : po
      ));
    }
    return updatedPurchaseOrder;
  };

  const startTimeEntry = async (teamMemberId: string, jobId: string, description?: string) => {
    const newEntry = await TimeTrackingService.startTimer(teamMemberId, jobId, description);
    setTimeEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const stopTimeEntry = async (entryId: string) => {
    const updatedEntry = await TimeTrackingService.stopTimer(entryId);
    if (updatedEntry) {
      setTimeEntries(prev => prev.map(entry =>
        entry.id === entryId ? updatedEntry : entry
      ));
    }
    return updatedEntry;
  };

  const approveTimeEntry = async (entryId: string, approverId: string) => {
    const updatedEntry = await TimeTrackingService.approveEntry(entryId, approverId);
    if (updatedEntry) {
      setTimeEntries(prev => prev.map(entry =>
        entry.id === entryId ? updatedEntry : entry
      ));
    }
    return updatedEntry;
  };

  const getPendingTimeApprovals = async () => {
    return await TimeTrackingService.getPendingApprovals();
  };

  const getTeamPerformance = async (teamMemberId: string, period: 'week' | 'month' | 'quarter') => {
    return await TimeTrackingService.getTeamPerformance(teamMemberId, period);
  };

  const value: AppContextType = {
    clients,
    buildings,
    products,
    quotes,
    jobs,
    invoices,
    suppliers,
    purchaseOrders,
    teamMembers,
    timeEntries,
    isLoadingClients,
    isLoadingBuildings,
    isLoadingProducts,
    isLoadingQuotes,
    isLoadingJobs,
    isLoadingInvoices,
    isLoadingSuppliers,
    isLoadingPurchaseOrders,
    isLoadingTeamMembers,
    isLoadingTimeEntries,
    refreshClients,
    refreshQuotes,
    refreshJobs,
    refreshInvoices,
    refreshSuppliers,
    refreshPurchaseOrders,
    refreshTeamMembers,
    refreshTimeEntries,
    createQuote,
    updateQuoteStatus,
    createJobFromQuote,
    updateJobStatus,
    updateTask,
    createInvoiceFromJob,
    updateInvoiceStatus,
    addPayment,
    sendInvoiceReminder,
    createPurchaseOrderFromJob,
    updatePurchaseOrderStatus,
    startTimeEntry,
    stopTimeEntry,
    approveTimeEntry,
    getPendingTimeApprovals,
    getTeamPerformance,
    currentUser,
    sidebarCollapsed,
    setSidebarCollapsed
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
