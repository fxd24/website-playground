"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  User,
  Wrench,
  Plus,
  Filter,
  Search,
  X,
  AlertCircle,
  Star,
  Award,
  Phone,
  Mail,

} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { useApp } from "@/lib/context";
import { Job, TeamMember, Client, Building, JobStatus } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";




const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

export default function JobSchedulingPage() {
  const {
    jobs,
    teamMembers,
    clients,
    buildings,
    updateJobStatus,
    assignTeamMember,
    updateJobScheduling,
    isLoadingJobs,
    isLoadingTeamMembers
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showSchedulingDialog, setShowSchedulingDialog] = useState(false);
  const [conflicts, setConflicts] = useState<{ jobId: string; memberId: string; conflictTime: Date }[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [schedulingJob, setSchedulingJob] = useState<Job | null>(null);

  // Get jobs that need scheduling (Planned or Scheduled status)
  const schedulableJobs = jobs.filter(job =>
    job.status === 'Planned' || job.status === 'Scheduled'
  );

  const filteredJobs = schedulableJobs.filter(job => {
    if (filterStatus !== 'all' && job.status !== filterStatus) return false;
    if (selectedMember !== 'all') {
      return job.assignedTeam?.includes(selectedMember) || false;
    }
    return true;
  });

  // Calculate team availability and conflicts
  const calculateAvailability = useMemo(() => {
    const availability: Record<string, { available: boolean; conflicts: any[]; utilization: number }> = {};

    teamMembers.forEach(member => {
      const memberJobs = jobs.filter(job =>
        job.assignedTeam?.includes(member.id) &&
        job.scheduledStartDate &&
        job.scheduledEndDate &&
        job.status !== 'Completed' &&
        job.status !== 'Archived'
      );

      // Check for conflicts on the selected date
      const dayConflicts = memberJobs.filter(job => {
        if (!job.scheduledStartDate || !job.scheduledEndDate) return false;
        const jobStart = new Date(job.scheduledStartDate);
        const jobEnd = new Date(job.scheduledEndDate);

        // Check if the selected date overlaps with the job period
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(selectedDate);
        selectedDateEnd.setHours(23, 59, 59, 999);

        return (jobStart <= selectedDateEnd && jobEnd >= selectedDateStart);
      });

      // Calculate utilization for the week containing selectedDate
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

      const weekJobs = memberJobs.filter(job => {
        if (!job.scheduledStartDate || !job.scheduledEndDate) return false;
        const jobStart = new Date(job.scheduledStartDate);
        const jobEnd = new Date(job.scheduledEndDate);
        return (jobStart <= weekEnd && jobEnd >= weekStart);
      });

      // Calculate total hours for the week
      const totalWeekHours = weekJobs.reduce((total, job) => {
        if (!job.scheduledStartDate || !job.scheduledEndDate || !job.laborHours) return total;
        const jobStart = new Date(job.scheduledStartDate);
        const jobEnd = new Date(job.scheduledEndDate);

        // Calculate overlapping hours with the week
        const overlapStart = jobStart < weekStart ? weekStart : jobStart;
        const overlapEnd = jobEnd > weekEnd ? weekEnd : jobEnd;

        if (overlapStart < overlapEnd) {
          const overlapHours = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
          return total + Math.min(overlapHours, job.laborHours);
        }
        return total;
      }, 0);

      // Assume 40 working hours per week for utilization calculation
      const weeklyCapacity = 40;
      const utilization = Math.min((totalWeekHours / weeklyCapacity) * 100, 100);

      availability[member.id] = {
        available: dayConflicts.length === 0,
        conflicts: dayConflicts,
        utilization: Math.round(utilization)
      };
    });

    return availability;
  }, [teamMembers, jobs, selectedDate]);

  const getJobsForDate = (date: Date) => {
    return filteredJobs.filter(job => {
      if (!job.scheduledStartDate || !job.scheduledEndDate) return false;
      const jobStart = new Date(job.scheduledStartDate);
      const jobEnd = new Date(job.scheduledEndDate);
      return date >= jobStart && date <= jobEnd;
    });
  };

  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const handleAssignTeamMember = async (jobId: string, memberId: string, action: 'add' | 'remove' = 'add') => {
    try {
      await assignTeamMember(jobId, memberId, action);
      // The job state will be updated automatically through the context
    } catch (error) {
      console.error('Error assigning team member:', error);
    }
  };

  const handleScheduleJob = (job: Job) => {
    setSchedulingJob(job);
    setShowSchedulingDialog(true);
  };

  const handleSaveScheduling = async (data: { scheduledStartDate?: Date; scheduledEndDate?: Date; status?: JobStatus }) => {
    if (!schedulingJob) return;

    try {
      await updateJobScheduling(schedulingJob.id, data);
      setShowSchedulingDialog(false);
      setSchedulingJob(null);
    } catch (error) {
      console.error('Error updating job scheduling:', error);
    }
  };

  const checkConflicts = (job: Job, memberId: string) => {
    const memberJobs = jobs.filter(j =>
      j.assignedTeam?.includes(memberId) &&
      j.id !== job.id &&
      j.scheduledStartDate &&
      j.scheduledEndDate &&
      j.status !== 'Completed' &&
      j.status !== 'Archived'
    );

    return memberJobs.filter(j => {
      if (!j.scheduledStartDate || !j.scheduledEndDate || !job.scheduledStartDate || !job.scheduledEndDate) return false;
      const existingStart = new Date(j.scheduledStartDate);
      const existingEnd = new Date(j.scheduledEndDate);
      const newStart = new Date(job.scheduledStartDate!);
      const newEnd = new Date(job.scheduledEndDate!);

      // Check for time overlap
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };





  if (isLoadingJobs || isLoadingTeamMembers) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Scheduling</h1>
          <p className="text-muted-foreground">Schedule jobs and assign team members</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: 'day' | 'week' | 'month') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>

              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowSchedulingDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Job
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          >
            ←
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-40">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            →
          </Button>
        </div>

        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team Members</SelectItem>
            {teamMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Planned">Planned</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Calendar View */}
        <div className="lg:col-span-3">
          {viewMode === 'week' ? (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>{format(getWeekDates()[0], 'MMMM yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDates().map((date, index) => {
                    const dayJobs = getJobsForDate(date);
                    const isToday = isSameDay(date, new Date());

                    return (
                      <div key={index} className="min-h-32 border rounded-lg p-2">
                        <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`}>
                          {format(date, 'EEE dd')}
                        </div>
                        <div className="space-y-1">
                          {dayJobs.slice(0, 3).map((job) => {
                            const client = clients.find(c => c.id === job.clientId);
                            return (
                              <div
                                key={job.id}
                                className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                                onClick={() => setSelectedJob(job)}
                              >
                                <div className="font-medium truncate">{job.title}</div>
                                <div className="text-xs opacity-75">{client?.name}</div>
                              </div>
                            );
                          })}
                          {dayJobs.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayJobs.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'month' ? (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Schedule</CardTitle>
                <CardDescription>{format(selectedDate, 'MMMM yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }, (_, i) => {
                    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
                    const dayJobs = getJobsForDate(date);
                    const isToday = isSameDay(date, new Date());
                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

                    if (!isCurrentMonth) return null;

                    return (
                      <div key={i} className="min-h-24 border rounded-lg p-2">
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`}>
                          {format(date, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayJobs.slice(0, 2).map((job) => {
                            const client = clients.find(c => c.id === job.clientId);
                            return (
                              <div
                                key={job.id}
                                className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 truncate"
                                onClick={() => setSelectedJob(job)}
                              >
                                <div className="font-medium truncate">{job.title}</div>
                                <div className="text-xs opacity-75 truncate">{client?.name}</div>
                              </div>
                            );
                          })}
                          {dayJobs.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayJobs.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Daily Schedule</CardTitle>
                <CardDescription>{format(selectedDate, 'PPP')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getJobsForDate(selectedDate).map((job) => {
                    const client = clients.find(c => c.id === job.clientId);
                    const building = buildings.find(b => b.id === job.buildingId);

                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{job.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {client?.name}
                              {building && ` • ${building.name}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={priorityColors[job.priority]}>{job.priority}</Badge>
                            <Badge className={statusColors[job.status]}>{job.status}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Start:</span>
                            <span className="ml-2">
                              {job.scheduledStartDate ? format(new Date(job.scheduledStartDate), 'HH:mm') : 'Not set'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2">
                              {job.scheduledStartDate && job.scheduledEndDate
                                ? `${Math.round((new Date(job.scheduledEndDate).getTime() - new Date(job.scheduledStartDate).getTime()) / (1000 * 60 * 60))}h`
                                : 'Not set'
                              }
                            </span>
                          </div>
                        </div>

                        {job.assignedTeam && job.assignedTeam.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm text-muted-foreground mb-2">Assigned Team:</div>
                            <div className="flex gap-2">
                              {job.assignedTeam.map(memberId => {
                                const member = teamMembers.find(m => m.id === memberId);
                                return member ? (
                                  <Badge key={memberId} variant="secondary" className="text-xs">
                                    {member.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Team Availability</CardTitle>
              <CardDescription>Available team members for {format(selectedDate, 'MMM dd')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamMembers.map((member) => {
                const availability = calculateAvailability[member.id];
                const isAvailable = availability?.available ?? true;
                const utilization = availability?.utilization ?? 0;

                return (
                  <div key={member.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Utilization</div>
                        <div className="text-sm font-medium">{utilization}%</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Progress value={utilization} className="h-2" />
                      {!isAvailable && availability?.conflicts.length > 0 && (
                        <div className="text-xs text-orange-600">
                          {availability.conflicts.length} conflict{availability.conflicts.length > 1 ? 's' : ''} on {format(selectedDate, 'MMM dd')}
                        </div>
                      )}
                      {availability?.conflicts.length > 0 && (
                        <div className="space-y-1">
                          {availability.conflicts.slice(0, 2).map((conflict) => (
                            <div key={conflict.id} className="text-xs text-muted-foreground">
                              • {conflict.title}
                            </div>
                          ))}
                          {availability.conflicts.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{availability.conflicts.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Unscheduled Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Unscheduled Jobs</CardTitle>
              <CardDescription>Jobs waiting to be scheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {schedulableJobs
                .filter(job => !job.scheduledStartDate || !job.scheduledEndDate)
                .slice(0, 5)
                .map((job) => {
                  const client = clients.find(c => c.id === job.clientId);
                  return (
                    <div
                      key={job.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="font-medium text-sm">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{client?.name}</div>
                      <Badge className={`${statusColors[job.status]} mt-1`}>
                        {job.status}
                      </Badge>
                    </div>
                  );
                })}
              {schedulableJobs.filter(job => !job.scheduledStartDate || !job.scheduledEndDate).length > 5 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  +{schedulableJobs.filter(job => !job.scheduledStartDate || !job.scheduledEndDate).length - 5} more
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Jobs</div>
                  <div className="font-medium">{schedulableJobs.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Scheduled</div>
                  <div className="font-medium">
                    {schedulableJobs.filter(job => job.scheduledStartDate && job.scheduledEndDate).length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Unscheduled</div>
                  <div className="font-medium">
                    {schedulableJobs.filter(job => !job.scheduledStartDate || !job.scheduledEndDate).length}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Team Conflicts</div>
                  <div className="font-medium">
                    {Object.values(calculateAvailability).filter(a => !a.available).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Job Details - {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Review job information and assign team members
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <div className="mt-1 p-2 border rounded">
                    {clients.find(c => c.id === selectedJob.clientId)?.name}
                  </div>
                </div>
                <div>
                  <Label>Building</Label>
                  <div className="mt-1 p-2 border rounded">
                    {buildings.find(b => b.id === selectedJob.buildingId)?.name || 'Not specified'}
                  </div>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <div className="mt-1 p-2 border rounded min-h-20">
                  {selectedJob.description || 'No description provided'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">
                    <Badge className={priorityColors[selectedJob.priority]}>
                      {selectedJob.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Estimated Hours</Label>
                  <div className="mt-1 p-2 border rounded">
                    {selectedJob.laborHours || 0}h
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                <Button onClick={() => setSelectedJob(null)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Job Scheduling Dialog */}
      <Dialog open={showSchedulingDialog} onOpenChange={setShowSchedulingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Job</DialogTitle>
            <DialogDescription>
              Set scheduling dates and assign team members to jobs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Select Job</Label>
                <Select value={schedulingJob?.id || ''} onValueChange={(jobId) => {
                  const job = schedulableJobs.find(j => j.id === jobId);
                  setSchedulingJob(job || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job to schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {schedulableJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} - {clients.find(c => c.id === job.clientId)?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={schedulingJob?.status || 'Planned'} onValueChange={(status: JobStatus) => {
                  if (schedulingJob) {
                    setSchedulingJob({ ...schedulingJob, status });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {schedulingJob && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={schedulingJob.scheduledStartDate ? format(schedulingJob.scheduledStartDate, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setSchedulingJob({ ...schedulingJob, scheduledStartDate: date });
                      }}
                    />
                  </div>
                  <div>
                    <Label>End Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={schedulingJob.scheduledEndDate ? format(schedulingJob.scheduledEndDate, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setSchedulingJob({ ...schedulingJob, scheduledEndDate: date });
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Assigned Team Members</Label>
                  <div className="mt-2 space-y-2">
                    {teamMembers.map((member) => {
                      const isAssigned = schedulingJob.assignedTeam?.includes(member.id) || false;
                      return (
                        <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={(e) => {
                                const action = e.target.checked ? 'add' : 'remove';
                                handleAssignTeamMember(schedulingJob.id, member.id, action);
                                // Update local state immediately for UI feedback
                                const currentTeam = schedulingJob.assignedTeam || [];
                                const updatedTeam = action === 'add'
                                  ? [...currentTeam, member.id]
                                  : currentTeam.filter(id => id !== member.id);
                                setSchedulingJob({ ...schedulingJob, assignedTeam: updatedTeam });
                              }}
                            />
                            <span>{member.name}</span>
                            <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.hourlyRate} CHF/h
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowSchedulingDialog(false);
                    setSchedulingJob(null);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    if (schedulingJob) {
                      handleSaveScheduling({
                        scheduledStartDate: schedulingJob.scheduledStartDate,
                        scheduledEndDate: schedulingJob.scheduledEndDate,
                        status: schedulingJob.status
                      });
                    }
                  }}>
                    Save Schedule
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
