"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Plus,
  Save,
  Search,
  Users,
  Wrench,
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  Phone,
  Mail,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { useApp } from "@/lib/context";
import { Quote, QuoteStatus, Job, Task, JobStatus } from "@/lib/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function NewJobPage() {
  const {
    quotes,
    clients,
    buildings,
    teamMembers,
    createJobFromQuote,
    isLoadingQuotes,
    isLoadingClients,
    isLoadingBuildings
  } = useApp();

  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId');

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteSelector, setShowQuoteSelector] = useState(!quoteId);
  const [quoteSearchTerm, setQuoteSearchTerm] = useState("");

  // Job form data
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    scheduledStartDate: undefined as Date | undefined,
    scheduledEndDate: undefined as Date | undefined,
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    assignedTeam: [] as string[],
    notes: ""
  });

  // Tasks data
  const [tasks, setTasks] = useState<Task[]>([]);

  // Auto-select quote if quoteId is provided
  useEffect(() => {
    if (quoteId && quotes.length > 0) {
      const quote = quotes.find(q => q.id === quoteId && q.status === 'Accepted');
      if (quote) {
        setSelectedQuote(quote);
        setShowQuoteSelector(false);
      }
    }
  }, [quoteId, quotes]);

  // Get accepted quotes for selection
  const acceptedQuotes = quotes.filter(quote => quote.status === 'Accepted');

  const filteredQuotes = acceptedQuotes.filter(quote => {
    const client = clients.find(c => c.id === quote.clientId);
    const searchString = `${client?.name || ''} ${quote.id}`.toLowerCase();
    return searchString.includes(quoteSearchTerm.toLowerCase());
  });

  // Initialize job data when quote is selected
  useEffect(() => {
    if (selectedQuote) {
      const client = clients.find(c => c.id === selectedQuote.clientId);
      const building = buildings.find(b => b.id === selectedQuote.buildingId);

      setJobData({
        title: `Job for ${client?.name || 'Client'}${building ? ` - ${building.name}` : ''}`,
        description: `Job execution for ${client?.name || 'Client'}${building ? ` at ${building.name}` : ''}`,
        scheduledStartDate: undefined,
        scheduledEndDate: undefined,
        priority: "medium",
        assignedTeam: [],
        notes: `Converted from Quote #${selectedQuote.id}`
      });

      // Initialize standard tasks
      const standardTasks: Omit<Task, 'id'>[] = [
        {
          jobId: '', // Will be set when job is created
          title: "Site Preparation",
          description: "Prepare the work site, ensure safety measures, and setup equipment",
          status: 'pending',
          priority: 'high',
          estimatedHours: 4,
          assignedTo: undefined,
          dueDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          jobId: '',
          title: "Material Installation",
          description: "Install the materials according to specifications",
          status: 'pending',
          priority: 'high',
          estimatedHours: selectedQuote.lines.reduce((sum: number, item) => sum + (item.quantity || 1) * 2, 0), // Rough estimate
          assignedTo: undefined,
          dueDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          jobId: '',
          title: "Quality Control",
          description: "Perform quality checks and ensure work meets standards",
          status: 'pending',
          priority: 'medium',
          estimatedHours: 2,
          assignedTo: undefined,
          dueDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          jobId: '',
          title: "Site Cleanup",
          description: "Clean up the work site and remove all equipment",
          status: 'pending',
          priority: 'medium',
          estimatedHours: 2,
          assignedTo: undefined,
          dueDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          jobId: '',
          title: "Client Handover",
          description: "Final walkthrough with client and handover documentation",
          status: 'pending',
          priority: 'low',
          estimatedHours: 1,
          assignedTo: undefined,
          dueDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setTasks(standardTasks.map((task, index) => ({
        ...task,
        id: `task-${index + 1}`
      })));
    }
  }, [selectedQuote, clients, buildings]);

  const handleQuoteSelect = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowQuoteSelector(false);
  };

  const handleCreateJob = async () => {
    if (!selectedQuote) return;

    try {
      const newJob = await createJobFromQuote(selectedQuote.id, {
        title: jobData.title,
        description: jobData.description,
        scheduledStartDate: jobData.scheduledStartDate,
        scheduledEndDate: jobData.scheduledEndDate,
        priority: jobData.priority
      });

      if (newJob) {
        // Redirect to the new job page
        window.location.href = `/jobs/${newJob.id}`;
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const addCustomTask = () => {
    const newTask: Task = {
      id: `task-${tasks.length + 1}`,
      jobId: '',
      title: "New Task",
      description: "",
      status: 'pending',
      priority: 'medium',
      estimatedHours: 1,
      assignedTo: undefined,
      dueDate: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  if (isLoadingQuotes || isLoadingClients || isLoadingBuildings) {
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

  if (showQuoteSelector) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Job</h1>
            <p className="text-muted-foreground">Convert an accepted quote into a job</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Quote to Convert</CardTitle>
            <CardDescription>Choose from accepted quotes to create a new job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotes..."
                value={quoteSearchTerm}
                onChange={(e) => setQuoteSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuotes.map((quote) => {
                const client = clients.find(c => c.id === quote.clientId);
                const building = buildings.find(b => b.id === quote.buildingId);

                return (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleQuoteSelect(quote)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-1">Quote #{quote.id}</CardTitle>
                            <CardDescription>{client?.name}</CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {building && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {building.name}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          CHF {quote.total?.toLocaleString() || '0'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {quote.lines.length} items
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filteredQuotes.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {quoteSearchTerm ? "No matching quotes found" : "No accepted quotes available"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Quotes must be in "Accepted" status to create jobs from them.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedQuote) {
    return (
      <div className="p-6">
        <p>No quote selected</p>
      </div>
    );
  }

  const client = clients.find(c => c.id === selectedQuote.clientId);
  const building = buildings.find(b => b.id === selectedQuote.buildingId);
  const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Job</h1>
          <p className="text-muted-foreground">Convert quote into executable job</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowQuoteSelector(true)}>
            Change Quote
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Job Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Configure the job settings and schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={jobData.title}
                    onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={jobData.priority}
                    onValueChange={(value) => setJobData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={jobData.description}
                  onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !jobData.scheduledStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {jobData.scheduledStartDate ? (
                          format(jobData.scheduledStartDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={jobData.scheduledStartDate}
                        onSelect={(date: Date | undefined) => setJobData(prev => ({ ...prev, scheduledStartDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !jobData.scheduledEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {jobData.scheduledEndDate ? (
                          format(jobData.scheduledEndDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={jobData.scheduledEndDate}
                        onSelect={(date: Date | undefined) => setJobData(prev => ({ ...prev, scheduledEndDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={jobData.notes}
                  onChange={(e) => setJobData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any special instructions or requirements..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Tasks</CardTitle>
                  <CardDescription>Tasks will be created for the job execution</CardDescription>
                </div>
                <Button onClick={addCustomTask} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.map((task, index) => (
                <Card key={task.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={task.title}
                            onChange={(e) => updateTask(task.id, { title: e.target.value })}
                            className="font-medium border-none p-0 h-auto shadow-none"
                            placeholder="Task title"
                          />
                          <Badge variant="secondary" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                        <Textarea
                          value={task.description}
                          onChange={(e) => updateTask(task.id, { description: e.target.value })}
                          placeholder="Task description"
                          className="text-sm border-none p-0 h-auto shadow-none resize-none"
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Estimated Hours</Label>
                        <Input
                          type="number"
                          value={task.estimatedHours}
                          onChange={(e) => updateTask(task.id, { estimatedHours: parseFloat(e.target.value) || 0 })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Assign To</Label>
                        <Select
                          value={task.assignedTo || ""}
                          onValueChange={(value) => updateTask(task.id, { assignedTo: value || undefined })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {teamMembers.map(member => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-8",
                                !task.dueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {task.dueDate ? (
                                format(task.dueDate, "MMM dd")
                              ) : (
                                <span>Optional</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={task.dueDate}
                              onSelect={(date: Date | undefined) => updateTask(task.id, { dueDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Separator />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total Tasks: {tasks.length}</span>
                <span>Estimated Hours: {totalEstimatedHours}h</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Quote Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Quote #{selectedQuote.id}</h4>
                <p className="text-sm text-muted-foreground">Quote #{selectedQuote.id}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Client:</span>
                  <span className="font-medium">{client?.name}</span>
                </div>
                {building && (
                  <div className="flex justify-between text-sm">
                    <span>Building:</span>
                    <span className="font-medium">{building.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span className="font-medium">{selectedQuote.lines.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Value:</span>
                  <span className="font-medium">CHF {selectedQuote.total?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {client.name}
                  </div>
                  {client.contacts.length > 0 && (
                    <>
                      {client.contacts[0].email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {client.contacts[0].email}
                        </div>
                      )}
                      {client.contacts[0].phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {client.contacts[0].phone}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      {client.address.street}<br />
                      {client.address.postalCode} {client.address.city}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedQuote.lines.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="truncate">{item.description}</span>
                  <span className="font-medium">
                    {item.quantity} × CHF {item.unitPrice}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            onClick={handleCreateJob}
            disabled={!jobData.title.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>
    </div>
  );
}
