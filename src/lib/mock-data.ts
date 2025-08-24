import { Client, Building, Product, Quote, QuoteStatus, Address, Contact, Media, CaptureSession, Job, Task, Invoice, InvoiceLine, Payment, Supplier, PurchaseOrder, PurchaseOrderLine, TeamMember, TimeEntry, TeamPerformance } from './types';

// Mock addresses
export const addresses: Address[] = [
  {
    street: 'Bahnhofstrasse 1',
    city: 'Zürich',
    postalCode: '8001',
    country: 'Switzerland'
  },
  {
    street: 'Marktgasse 15',
    city: 'Bern',
    postalCode: '3011',
    country: 'Switzerland'
  },
  {
    street: 'Rue du Rhône 2',
    city: 'Genève',
    postalCode: '1204',
    country: 'Switzerland'
  },
  {
    street: 'Via Nassa 5',
    city: 'Lugano',
    postalCode: '6900',
    country: 'Switzerland'
  }
];

// Mock clients
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Swiss Construction AG',
    type: 'company',
    address: addresses[0],
    contacts: [
      {
        id: 'contact-1',
        name: 'Hans Müller',
        email: 'hans.mueller@swissconstruction.ch',
        phone: '+41 44 123 45 67',
        role: 'Project Manager'
      },
      {
        id: 'contact-2',
        name: 'Maria Schmidt',
        email: 'maria.schmidt@swissconstruction.ch',
        phone: '+41 44 123 45 68',
        role: 'Office Manager'
      }
    ],
    paymentTerms: 'NET 30',
    language: 'DE',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'client-2',
    name: 'Family Müller',
    type: 'individual',
    address: addresses[1],
    contacts: [
      {
        id: 'contact-3',
        name: 'Peter Müller',
        email: 'peter.mueller@gmail.com',
        phone: '+41 31 987 65 43',
        role: 'Homeowner'
      }
    ],
    paymentTerms: 'NET 15',
    language: 'DE',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'client-3',
    name: 'Office Solutions SA',
    type: 'company',
    address: addresses[2],
    contacts: [
      {
        id: 'contact-4',
        name: 'Sophie Dupont',
        email: 'sophie.dupont@officesolutions.ch',
        phone: '+41 22 456 78 90',
        role: 'CEO'
      }
    ],
    paymentTerms: 'NET 30',
    language: 'FR',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-08-10')
  }
];

// Mock buildings
export const mockBuildings: Building[] = [
  {
    id: 'building-1',
    clientId: 'client-1',
    name: 'Main Office Building',
    address: addresses[0],
    accessInfo: 'Main entrance, reception on ground floor',
    photos: [],
    contacts: mockClients[0].contacts,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'building-2',
    clientId: 'client-2',
    name: 'Family Home',
    address: addresses[1],
    accessInfo: 'Front door, ring doorbell',
    photos: [],
    contacts: mockClients[1].contacts,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'building-3',
    clientId: 'client-3',
    name: 'Geneva Office',
    address: addresses[2],
    accessInfo: 'Building entrance with security code: 1234',
    photos: [],
    contacts: mockClients[2].contacts,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-08-10')
  }
];

// Mock products
export const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'Window Standard 120x120cm',
    sku: 'WIN-STD-120',
    description: 'Standard double-glazed window, white frame',
    category: 'Windows',
    unit: 'piece',
    cost: 250,
    markup: 0.4,
    price: 350,
    supplierId: 'supplier-1'
  },
  {
    id: 'product-2',
    name: 'Window Premium 120x120cm',
    sku: 'WIN-PREM-120',
    description: 'Premium triple-glazed window, custom color',
    category: 'Windows',
    unit: 'piece',
    cost: 400,
    markup: 0.4,
    price: 560,
    supplierId: 'supplier-1'
  },
  {
    id: 'product-3',
    name: 'Door Standard 90x210cm',
    sku: 'DOOR-STD-90',
    description: 'Standard entrance door with lock',
    category: 'Doors',
    unit: 'piece',
    cost: 600,
    markup: 0.35,
    price: 810,
    supplierId: 'supplier-2'
  },
  {
    id: 'product-4',
    name: 'Installation Labor - Window',
    sku: 'LABOR-WIN',
    description: 'Installation labor for one window',
    category: 'Labor',
    unit: 'hour',
    cost: 80,
    markup: 0.5,
    price: 120,
    supplierId: undefined
  },
  {
    id: 'product-5',
    name: 'Installation Labor - Door',
    sku: 'LABOR-DOOR',
    description: 'Installation labor for one door',
    category: 'Labor',
    unit: 'hour',
    cost: 90,
    markup: 0.5,
    price: 135,
    supplierId: undefined
  }
];

// Mock quotes
export const mockQuotes: Quote[] = [
  {
    id: 'quote-1',
    clientId: 'client-1',
    buildingId: 'building-1',
    status: 'Draft',
    lines: [
      {
        id: 'line-1',
        productId: 'product-1',
        quantity: 4,
        unitPrice: 350,
        total: 1400,
        description: 'Standard windows for office'
      },
      {
        id: 'line-2',
        productId: 'product-4',
        quantity: 8,
        unitPrice: 120,
        total: 960,
        description: 'Installation labor'
      }
    ],
    subtotal: 2360,
    taxRate: 0.077,
    taxAmount: 181.72,
    total: 2541.72,
    validityDays: 30,
    notes: 'Quote for office renovation project',
    internalNotes: 'Client requested quick turnaround',
    attachments: [],
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'quote-2',
    clientId: 'client-2',
    buildingId: 'building-2',
    status: 'Sent',
    lines: [
      {
        id: 'line-3',
        productId: 'product-1',
        quantity: 2,
        unitPrice: 350,
        total: 700,
        description: 'Kitchen windows'
      },
      {
        id: 'line-4',
        productId: 'product-3',
        quantity: 1,
        unitPrice: 810,
        total: 810,
        description: 'Front door replacement'
      }
    ],
    subtotal: 1510,
    taxRate: 0.077,
    taxAmount: 116.27,
    total: 1626.27,
    validityDays: 30,
    notes: 'Home renovation project',
    attachments: [],
    createdAt: new Date('2024-08-15'),
    sentAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15')
  }
];

// Mock media for capture sessions
export const mockMedia: Media[] = [
  {
    id: 'media-1',
    type: 'photo',
    url: '/mock-photos/kitchen-before.jpg',
    filename: 'kitchen-before.jpg',
    size: 2048576,
    uploadedAt: new Date('2024-08-20'),
    metadata: {
      exif: { camera: 'iPhone 15', timestamp: new Date('2024-08-20T10:30:00') },
      coordinates: { lat: 47.3769, lng: 8.5417 }
    }
  },
  {
    id: 'media-2',
    type: 'document',
    url: '/mock-blueprints/floor-plan.pdf',
    filename: 'floor-plan.pdf',
    size: 1048576,
    uploadedAt: new Date('2024-08-20')
  }
];

// Mock capture sessions
export const mockCaptureSessions: CaptureSession[] = [
  {
    id: 'capture-1',
    quoteId: 'quote-1',
    media: mockMedia,
    notes: [
      'Kitchen windows need replacement due to condensation',
      'Customer wants energy-efficient windows',
      'Access through side entrance'
    ],
    measurements: [
      {
        id: 'meas-1',
        type: 'window_width',
        value: 120,
        unit: 'cm',
        notes: 'Standard size window'
      },
      {
        id: 'meas-2',
        type: 'window_height',
        value: 120,
        unit: 'cm',
        notes: 'Standard size window'
      }
    ],
    createdAt: new Date('2024-08-20')
  }
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    jobId: 'job-1',
    title: 'Site preparation and access setup',
    description: 'Clear workspace, set up safety barriers, prepare access points',
    status: 'completed',
    priority: 'high',
    estimatedHours: 4,
    actualHours: 3.5,
    assignedTo: 'user-1',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'task-2',
    jobId: 'job-1',
    title: 'Install window frames',
    description: 'Install window frames in kitchen and living room',
    status: 'in_progress',
    priority: 'medium',
    estimatedHours: 6,
    actualHours: 4,
    assignedTo: 'user-1',
    dueDate: new Date('2024-08-25'),
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'task-3',
    jobId: 'job-1',
    title: 'Install glazing and seals',
    description: 'Install glass panels and weather seals',
    status: 'pending',
    priority: 'medium',
    estimatedHours: 8,
    dueDate: new Date('2024-08-26'),
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'task-4',
    jobId: 'job-1',
    title: 'Quality inspection and cleanup',
    description: 'Final inspection, cleanup, and handover',
    status: 'pending',
    priority: 'low',
    estimatedHours: 2,
    dueDate: new Date('2024-08-27'),
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'task-5',
    jobId: 'job-2',
    title: 'Office renovation planning',
    description: 'Coordinate with client for renovation schedule',
    status: 'blocked',
    priority: 'high',
    estimatedHours: 2,
    blockedReason: 'Awaiting client approval for renovation dates',
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-22')
  }
];

// Mock jobs
export const mockJobs: Job[] = [
  {
    id: 'job-1',
    quoteId: 'quote-2',
    status: 'InProgress',
    title: 'Home Window Replacement',
    description: 'Replace windows in Müller family home kitchen and living room',
    clientId: 'client-2',
    buildingId: 'building-2',
    tasks: mockTasks.filter(t => t.jobId === 'job-1'),
    scheduledStartDate: new Date('2024-08-15'),
    scheduledEndDate: new Date('2024-08-27'),
    actualStartDate: new Date('2024-08-15'),
    estimatedCost: 1626.27,
    actualCost: 1200,
    laborHours: 7.5,
    progress: 65,
    priority: 'medium',
    assignedTeam: ['user-1'],
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'job-2',
    quoteId: 'quote-1',
    status: 'Planned',
    title: 'Office Window Installation',
    description: 'Install energy-efficient windows in Swiss Construction AG office building',
    clientId: 'client-1',
    buildingId: 'building-1',
    tasks: mockTasks.filter(t => t.jobId === 'job-2'),
    scheduledStartDate: new Date('2024-08-28'),
    scheduledEndDate: new Date('2024-09-10'),
    estimatedCost: 2541.72,
    progress: 0,
    priority: 'high',
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-22')
  }
];

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    invoiceId: 'invoice-1',
    amount: 1626.27,
    paymentDate: new Date('2024-08-25'),
    paymentMethod: 'bank_transfer',
    reference: 'ESR123456789',
    status: 'completed',
    createdAt: new Date('2024-08-25'),
    updatedAt: new Date('2024-08-25')
  },
  {
    id: 'payment-2',
    invoiceId: 'invoice-2',
    amount: 1200,
    paymentDate: new Date('2024-08-22'),
    paymentMethod: 'bank_transfer',
    reference: 'ESR987654321',
    status: 'completed',
    createdAt: new Date('2024-08-22'),
    updatedAt: new Date('2024-08-22')
  }
];

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    jobId: 'job-1',
    clientId: 'client-2',
    buildingId: 'building-2',
    status: 'Paid',
    invoiceNumber: 'INV-2024-001',
    lines: [
      {
        id: 'inv-line-1',
        jobId: 'job-1',
        description: 'Complete window replacement project',
        quantity: 1,
        unitPrice: 1626.27,
        total: 1626.27,
        taxRate: 0.077,
        taxAmount: 125.22
      }
    ],
    subtotal: 1626.27,
    taxRate: 0.077,
    taxAmount: 125.22,
    total: 1751.49,
    paidAmount: 1626.27,
    balance: 0,
    dueDate: new Date('2024-09-10'),
    issueDate: new Date('2024-08-20'),
    paymentTerms: 'NET 30',
    qrReference: '210000000003139471430009017',
    payments: mockPayments.filter(p => p.invoiceId === 'invoice-1'),
    reminderCount: 0,
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-25')
  },
  {
    id: 'invoice-2',
    jobId: 'job-2',
    clientId: 'client-1',
    buildingId: 'building-1',
    status: 'Overdue',
    invoiceNumber: 'INV-2024-002',
    lines: [
      {
        id: 'inv-line-2',
        jobId: 'job-2',
        description: 'Office window installation project',
        quantity: 1,
        unitPrice: 2541.72,
        total: 2541.72,
        taxRate: 0.077,
        taxAmount: 195.71
      }
    ],
    subtotal: 2541.72,
    taxRate: 0.077,
    taxAmount: 195.71,
    total: 2737.43,
    paidAmount: 1200,
    balance: 1337.43,
    dueDate: new Date('2024-08-30'), // Overdue
    issueDate: new Date('2024-08-15'),
    paymentTerms: 'NET 30',
    qrReference: '210000000003139471430009018',
    payments: mockPayments.filter(p => p.invoiceId === 'invoice-2'),
    reminderCount: 1,
    lastReminderDate: new Date('2024-09-02'),
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-09-02')
  },
  {
    id: 'invoice-3',
    jobId: 'job-1',
    clientId: 'client-2',
    buildingId: 'building-2',
    status: 'Issued',
    invoiceNumber: 'INV-2024-003',
    lines: [
      {
        id: 'inv-line-3',
        description: 'Additional materials and supplies',
        quantity: 1,
        unitPrice: 125.22,
        total: 125.22,
        taxRate: 0.077,
        taxAmount: 9.64
      }
    ],
    subtotal: 125.22,
    taxRate: 0.077,
    taxAmount: 9.64,
    total: 134.86,
    paidAmount: 0,
    balance: 134.86,
    dueDate: new Date('2024-09-15'),
    issueDate: new Date('2024-08-25'),
    paymentTerms: 'NET 15',
    qrReference: '210000000003139471430009019',
    payments: [],
    reminderCount: 0,
    createdAt: new Date('2024-08-25'),
    updatedAt: new Date('2024-08-25')
  }
];

// Mock suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'Swiss Window Solutions AG',
    contactName: 'Peter Müller',
    email: 'orders@swisswindows.ch',
    phone: '+41 44 123 45 67',
    address: {
      street: 'Industriestrasse 12',
      city: 'Zürich',
      postalCode: '8005',
      country: 'Switzerland'
    },
    website: 'https://www.swisswindows.ch',
    paymentTerms: 'NET 30',
    taxId: 'CHE-123.456.789',
    rating: 4.5,
    categories: ['Windows', 'Materials'],
    leadTime: 7,
    onTimeDeliveryRate: 95,
    qualityRating: 92,
    notes: 'Primary window supplier, excellent quality and reliability',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'supplier-2',
    name: 'DoorTech Switzerland GmbH',
    contactName: 'Maria Schmidt',
    email: 'sales@doortech.ch',
    phone: '+41 22 456 78 90',
    address: {
      street: 'Route de l\'Industrie 8',
      city: 'Genève',
      postalCode: '1227',
      country: 'Switzerland'
    },
    website: 'https://www.doortech.ch',
    paymentTerms: 'NET 15',
    taxId: 'CHE-987.654.321',
    rating: 4.2,
    categories: ['Doors', 'Hardware'],
    leadTime: 5,
    onTimeDeliveryRate: 88,
    qualityRating: 90,
    notes: 'Specializes in commercial doors, good for urgent orders',
    isActive: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'supplier-3',
    name: 'BuildMaterials AG',
    contactName: 'Hans Weber',
    email: 'info@buildmaterials.ch',
    phone: '+41 31 987 65 43',
    address: {
      street: 'Werkstrasse 25',
      city: 'Bern',
      postalCode: '3018',
      country: 'Switzerland'
    },
    website: 'https://www.buildmaterials.ch',
    paymentTerms: 'NET 30',
    taxId: 'CHE-555.666.777',
    rating: 3.8,
    categories: ['Materials', 'Tools', 'Hardware'],
    leadTime: 3,
    onTimeDeliveryRate: 85,
    qualityRating: 87,
    notes: 'Good for miscellaneous materials and hardware',
    isActive: true,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-08-10')
  }
];

// Mock purchase orders
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    jobId: 'job-1',
    supplierId: 'supplier-1',
    poNumber: 'PO-2024-001',
    status: 'Ordered',
    lines: [
      {
        id: 'po-line-1',
        productId: 'product-1',
        description: 'Standard Window 120x120cm - White Frame',
        quantity: 2,
        unitPrice: 200,
        total: 400,
        taxRate: 0.077,
        taxAmount: 30.80,
        notes: 'For kitchen installation'
      },
      {
        id: 'po-line-2',
        productId: 'product-4',
        description: 'Installation Labor - Window',
        quantity: 8,
        unitPrice: 80,
        total: 640,
        taxRate: 0.077,
        taxAmount: 49.28,
        notes: 'Labor for window installation'
      }
    ],
    subtotal: 1040,
    taxRate: 0.077,
    taxAmount: 80.08,
    total: 1120.08,
    shippingCost: 25,
    discount: 0,
    finalTotal: 1145.08,
    orderDate: new Date('2024-08-15'),
    requestedDeliveryDate: new Date('2024-08-22'),
    paymentTerms: 'NET 30',
    shippingAddress: addresses[0],
    notes: 'Priority order for ongoing job',
    priority: 'high',
    createdBy: 'user-1',
    approvedBy: 'user-1',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'po-2',
    jobId: 'job-2',
    supplierId: 'supplier-3',
    poNumber: 'PO-2024-002',
    status: 'Confirmed',
    lines: [
      {
        id: 'po-line-3',
        description: 'Screws and fasteners package',
        quantity: 1,
        unitPrice: 150,
        total: 150,
        taxRate: 0.077,
        taxAmount: 11.55
      },
      {
        id: 'po-line-4',
        description: 'Weather stripping kit',
        quantity: 2,
        unitPrice: 75,
        total: 150,
        taxRate: 0.077,
        taxAmount: 11.55
      }
    ],
    subtotal: 300,
    taxRate: 0.077,
    taxAmount: 23.10,
    total: 323.10,
    shippingCost: 15,
    discount: 10,
    finalTotal: 328.10,
    orderDate: new Date('2024-08-20'),
    requestedDeliveryDate: new Date('2024-08-25'),
    paymentTerms: 'NET 30',
    shippingAddress: addresses[2],
    notes: 'Materials for office renovation project',
    priority: 'medium',
    createdBy: 'user-1',
    approvedBy: 'user-1',
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-21')
  },
  {
    id: 'po-3',
    jobId: 'job-1',
    supplierId: 'supplier-2',
    poNumber: 'PO-2024-003',
    status: 'Delivered',
    lines: [
      {
        id: 'po-line-5',
        productId: 'product-3',
        description: 'Front Door Standard 90x210cm',
        quantity: 1,
        unitPrice: 500,
        total: 500,
        taxRate: 0.077,
        taxAmount: 38.50,
        notes: 'Replacement front door'
      }
    ],
    subtotal: 500,
    taxRate: 0.077,
    taxAmount: 38.50,
    total: 538.50,
    shippingCost: 20,
    discount: 0,
    finalTotal: 558.50,
    orderDate: new Date('2024-08-18'),
    requestedDeliveryDate: new Date('2024-08-23'),
    actualDeliveryDate: new Date('2024-08-22'),
    paymentTerms: 'NET 15',
    shippingAddress: addresses[1],
    notes: 'Delivered ahead of schedule',
    priority: 'high',
    createdBy: 'user-1',
    approvedBy: 'user-1',
    createdAt: new Date('2024-08-18'),
    updatedAt: new Date('2024-08-22')
  }
];

// Mock team members
export const mockTeamMembers: TeamMember[] = [
  {
    id: 'user-1',
    name: 'John Technician',
    email: 'john.technician@company.ch',
    phone: '+41 78 123 45 67',
    role: 'Technician',
    hourlyRate: 75,
    skills: ['Window Installation', 'Door Fitting', 'Weather Sealing', 'Glass Cutting'],
    certifications: [
      {
        name: 'Swiss Glass Association Certified',
        expiryDate: new Date('2025-06-15'),
        issuingBody: 'Swiss Glass Association',
        status: 'valid'
      },
      {
        name: 'Safety Training Certificate',
        expiryDate: new Date('2024-12-31'),
        issuingBody: 'Swiss Occupational Safety',
        status: 'expiring_soon'
      }
    ],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    address: {
      street: 'Technikerweg 5',
      city: 'Zürich',
      postalCode: '8001',
      country: 'Switzerland'
    },
    emergencyContact: {
      name: 'Sarah Technician',
      phone: '+41 78 123 45 68',
      relationship: 'Spouse'
    },
    hireDate: new Date('2023-01-15'),
    status: 'active',
    notes: 'Lead technician, excellent with complex installations',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'user-2',
    name: 'Maria Manager',
    email: 'maria.manager@company.ch',
    phone: '+41 79 234 56 78',
    role: 'Manager',
    hourlyRate: 95,
    skills: ['Project Management', 'Client Relations', 'Quality Control', 'Team Leadership'],
    certifications: [
      {
        name: 'Project Management Professional',
        expiryDate: new Date('2026-03-20'),
        issuingBody: 'PMI Switzerland',
        status: 'valid'
      }
    ],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    address: {
      street: 'Managementstrasse 10',
      city: 'Zürich',
      postalCode: '8002',
      country: 'Switzerland'
    },
    hireDate: new Date('2022-06-01'),
    status: 'active',
    notes: 'Operations manager, handles client relationships',
    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2024-08-18')
  },
  {
    id: 'user-3',
    name: 'Peter Senior Tech',
    email: 'peter.senior@company.ch',
    phone: '+41 78 345 67 89',
    role: 'Technician',
    hourlyRate: 85,
    skills: ['Advanced Window Systems', 'Custom Installations', 'Training', 'Quality Assurance'],
    certifications: [
      {
        name: 'Master Window Installer',
        expiryDate: new Date('2025-11-10'),
        issuingBody: 'European Window Association',
        status: 'valid'
      },
      {
        name: 'First Aid Certificate',
        expiryDate: new Date('2024-09-30'),
        issuingBody: 'Swiss Red Cross',
        status: 'valid'
      }
    ],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false
    },
    address: {
      street: 'Seniorweg 15',
      city: 'Zürich',
      postalCode: '8003',
      country: 'Switzerland'
    },
    hireDate: new Date('2021-09-01'),
    status: 'active',
    notes: 'Senior technician, handles complex and custom jobs',
    createdAt: new Date('2021-09-01'),
    updatedAt: new Date('2024-08-19')
  }
];

// Mock time entries
export const mockTimeEntries: TimeEntry[] = [
  {
    id: 'time-1',
    teamMemberId: 'user-1',
    jobId: 'job-1',
    date: new Date('2024-08-20'),
    startTime: new Date('2024-08-20T08:00:00'),
    endTime: new Date('2024-08-20T12:00:00'),
    duration: 4,
    description: 'Window frame installation',
    billable: true,
    approved: true,
    approvedBy: 'user-2',
    approvedAt: new Date('2024-08-20T17:00:00'),
    createdAt: new Date('2024-08-20T08:00:00'),
    updatedAt: new Date('2024-08-20T17:00:00')
  },
  {
    id: 'time-2',
    teamMemberId: 'user-1',
    jobId: 'job-1',
    date: new Date('2024-08-21'),
    startTime: new Date('2024-08-21T09:00:00'),
    endTime: new Date('2024-08-21T16:00:00'),
    duration: 7,
    description: 'Glazing and weather sealing',
    billable: true,
    approved: false,
    createdAt: new Date('2024-08-21T09:00:00'),
    updatedAt: new Date('2024-08-21T16:00:00')
  },
  {
    id: 'time-3',
    teamMemberId: 'user-3',
    jobId: 'job-2',
    date: new Date('2024-08-19'),
    startTime: new Date('2024-08-19T10:00:00'),
    endTime: new Date('2024-08-19T15:00:00'),
    duration: 5,
    description: 'Office window consultation and planning',
    billable: true,
    approved: true,
    approvedBy: 'user-2',
    approvedAt: new Date('2024-08-19T16:00:00'),
    createdAt: new Date('2024-08-19T10:00:00'),
    updatedAt: new Date('2024-08-19T16:00:00')
  }
];

// Mock team performance data
export const mockTeamPerformance: TeamPerformance[] = [
  {
    teamMemberId: 'user-1',
    period: 'month',
    totalHours: 168,
    billableHours: 140,
    jobsCompleted: 3,
    averageJobCompletionTime: 12,
    customerSatisfaction: 4.8,
    qualityRating: 4.9,
    utilizationRate: 83,
    overtimeHours: 8
  },
  {
    teamMemberId: 'user-2',
    period: 'month',
    totalHours: 160,
    billableHours: 120,
    jobsCompleted: 0,
    averageJobCompletionTime: 0,
    customerSatisfaction: 4.9,
    qualityRating: 5.0,
    utilizationRate: 75,
    overtimeHours: 0
  },
  {
    teamMemberId: 'user-3',
    period: 'month',
    totalHours: 176,
    billableHours: 152,
    jobsCompleted: 2,
    averageJobCompletionTime: 16,
    customerSatisfaction: 4.7,
    qualityRating: 4.8,
    utilizationRate: 86,
    overtimeHours: 16
  }
];
