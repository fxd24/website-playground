"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Users,
  Wrench,
  Camera,
  FileText,
  Play,
  Pause,
  Square,
  AlertCircle,
  Plus,
  Edit,
  Save,
  MessageSquare,
  Phone,
  Mail,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { useApp } from "@/lib/context";
import { Job, JobStatus, Task, Client, Building, TeamMember } from "@/lib/types";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

const statusColors: Record<JobStatus, string> = {
  Planned: "bg-blue-100 text-blue-800",
  Scheduled: "bg-purple-100 text-purple-800",
  InProgress: "bg-green-100 text-green-800",
  Blocked: "bg-red-100 text-red-800",
  Completed: "bg-gray-100 text-gray-800",
  Archived: "bg-gray-100 text-gray-600"
};

const taskStatusColors = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800"
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const {
    jobs,
    clients,
    buildings,
    teamMembers,
    updateJobStatus,
    updateTask,
    startTimeEntry,
    stopTimeEntry,
    isLoadingJobs
  } = useApp();

  const [job, setJob] = useState<Job | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [timeEntryDescription, setTimeEntryDescription] = useState("");
  const [showTimeDialog, setShowTimeDialog] = useState(false);

  useEffect(() => {
    const foundJob = jobs.find(j => j.id === jobId);
    if (foundJob) {
      setJob(foundJob);
      setClient(clients.find(c => c.id === foundJob.clientId) || null);
      setBuilding(buildings.find(b => b.id === foundJob.buildingId) || null);
    }
  }, [jobs, clients, buildings, jobId]);

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job) return;
    const updatedJob = await updateJobStatus(job.id, newStatus);
    if (updatedJob) {
      setJob(updatedJob);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    const updatedTask = await updateTask(taskId, updates);
    if (updatedTask && job) {
      const updatedTasks = job.tasks.map(t => t.id === taskId ? updatedTask : t);
      setJob({ ...job, tasks: updatedTasks });
    }
  };

  const handleStartTimer = async () => {
    if (!job) return;

    const newEntry = await startTimeEntry(teamMembers[0]?.id || 'user-1', job.id, timeEntryDescription);
    if (newEntry) {
      setActiveTimer(newEntry);
      setShowTimeDialog(false);
      setTimeEntryDescription("");
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    const updatedEntry = await stopTimeEntry(activeTimer.id);
    if (updatedEntry) {
      setActiveTimer(null);
    }
  };

  const calculateProgress = () => {
    if (!job) return 0;
    const completedTasks = job.tasks.filter(t => t.status === 'completed').length;
    return job.tasks.length > 0 ? (completedTasks / job.tasks.length) * 100 : 0;
  };

  const getCompletedTasks = () => {
    return job?.tasks.filter(t => t.status === 'completed').length || 0;
  };

  const getTotalTasks = () => {
    return job?.tasks.length || 0;
  };

  const getActiveTasks = () => {
    return job?.tasks.filter(t => t.status === 'in_progress').length || 0;
  };

  if (isLoadingJobs) {
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

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">
            {client?.name}
            {building && ` • ${building.name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[job.status]}>{job.status}</Badge>
          <Select value={job.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(calculateProgress())}%</div>
            <Progress value={calculateProgress()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getCompletedTasks()} of {getTotalTasks()} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveTasks()}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.laborHours || 0}h</div>
            <p className="text-xs text-muted-foreground">Tracked time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {job.actualCost || job.estimatedCost}</div>
            <p className="text-xs text-muted-foreground">
              {job.actualCost ? 'Actual' : 'Estimated'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Priority</Label>
                      <div className="mt-1">
                        <Badge className={priorityColors[job.priority]}>{job.priority}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge className={statusColors[job.status]}>{job.status}</Badge>
                      </div>
                    </div>
                  </div>

                  {job.scheduledStartDate && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(job.scheduledStartDate), 'PPP')}
                        </div>
                      </div>
                      {job.scheduledEndDate && (
                        <div>
                          <Label>End Date</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(job.scheduledEndDate), 'PPP')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {job.description && (
                    <div>
                      <Label>Description</Label>
                      <p className="mt-1 text-sm text-muted-foreground">{job.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Client & Building Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{client.name}</h4>
                        <p className="text-sm text-muted-foreground">{client.type}</p>
                        {client.contacts.length > 0 && (
                          <div className="mt-2 space-y-1">
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
                      </div>
                    </div>
                  )}

                  {building && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{building.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {building.address.street}<br />
                          {building.address.postalCode} {building.address.city}
                        </div>
                        {building.accessInfo && (
                          <p className="text-sm text-muted-foreground mt-1">{building.accessInfo}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start" variant="outline">
                        {activeTimer ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Stop Timer
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Time Tracking
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {activeTimer ? 'Stop Time Tracking' : 'Start Time Tracking'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {!activeTimer && (
                          <div>
                            <Label htmlFor="description">What are you working on?</Label>
                            <Textarea
                              id="description"
                              value={timeEntryDescription}
                              onChange={(e) => setTimeEntryDescription(e.target.value)}
                              placeholder="Describe the work being done..."
                              className="mt-1"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={activeTimer ? handleStopTimer : handleStartTimer}
                            className="flex-1"
                          >
                            {activeTimer ? 'Stop Timer' : 'Start Timer'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowTimeDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </CardContent>
              </Card>

              {job.assignedTeam && job.assignedTeam.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Team</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {job.assignedTeam.map(memberId => {
                      const member = teamMembers.find(m => m.id === memberId);
                      return member ? (
                        <div key={memberId} className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{member.name}</span>
                        </div>
                      ) : null;
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Tasks</CardTitle>
                  <CardDescription>Track task completion and progress</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                          <Badge className={taskStatusColors[task.status]}>{task.status}</Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleTaskUpdate(task.id, { status: value as any })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Estimated Hours</Label>
                        <p className="font-medium">{task.estimatedHours}h</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Actual Hours</Label>
                        <p className="font-medium">{task.actualHours || 0}h</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Assigned To</Label>
                        <p className="font-medium">
                          {task.assignedTo ? teamMembers.find(m => m.id === task.assignedTo)?.name || 'Unknown' : 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>Monitor time spent on this job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Time tracking integration coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This will show detailed time entries and reports for this job
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Photo Documentation</CardTitle>
              <CardDescription>Visual progress and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Photo documentation coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload and organize photos from the job site
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Updates</CardTitle>
              <CardDescription>Track changes and progress updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Job updates coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  View timeline of changes and status updates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}