"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, DollarSign, MapPin, Search, Users, Wrench, CheckCircle, AlertCircle, Play, Pause } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { Job, JobStatus } from "@/lib/types";
import { motion } from "framer-motion";

const statusColors: Record<JobStatus, string> = {
  Planned: "bg-blue-100 text-blue-800",
  Scheduled: "bg-purple-100 text-purple-800",
  InProgress: "bg-green-100 text-green-800",
  Blocked: "bg-red-100 text-red-800",
  Completed: "bg-gray-100 text-gray-800",
  Archived: "bg-gray-100 text-gray-600"
};

const statusIcons: Record<JobStatus, React.ComponentType<{ className?: string }>> = {
  Planned: Clock,
  Scheduled: Calendar,
  InProgress: Play,
  Blocked: AlertCircle,
  Completed: CheckCircle,
  Archived: Wrench
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

export default function JobsPage() {
  const { jobs, clients, buildings, isLoadingJobs, updateJobStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredJobs = jobs.filter(job => {
    const client = clients.find(c => c.id === job.clientId);
    const building = buildings.find(b => b.id === job.buildingId);

    const searchString = `${job.title} ${job.description || ''} ${client?.name || ''} ${building?.name || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await updateJobStatus(jobId, newStatus);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage your job assignments and progress</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Wrench className="h-4 w-4 mr-2" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
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
            <SelectItem value="Planned">Planned</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job, index) => {
          const client = clients.find(c => c.id === job.clientId);
          const building = buildings.find(b => b.id === job.buildingId);
          const StatusIcon = statusIcons[job.status];

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/jobs/${job.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3" />
                        {client?.name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={statusColors[job.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>

                  {/* Priority */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <Badge className={priorityColors[job.priority]}>
                      {job.priority}
                    </Badge>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Cost</span>
                    <span className="font-medium">CHF {job.estimatedCost.toLocaleString()}</span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1">
                    {job.scheduledStartDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Start: {job.scheduledStartDate.toLocaleDateString()}
                      </div>
                    )}
                    {job.scheduledEndDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        End: {job.scheduledEndDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  {building && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {building.name}
                    </div>
                  )}

                  {/* Tasks Summary */}
                  <div className="flex items-center justify-between text-sm">
                    <span>Tasks</span>
                    <div className="flex gap-1">
                      <span className="text-green-600">{job.tasks.filter(t => t.status === 'completed').length}</span>
                      <span>/</span>
                      <span>{job.tasks.length}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Add quick action here if needed
                      }}
                    >
                      Quick Action
                    </Button>
                    {job.status === 'Planned' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleStatusChange(job.id, 'InProgress');
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {job.status === 'InProgress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleStatusChange(job.id, 'Completed');
                        }}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || statusFilter !== "all" ? "No jobs found" : "No jobs yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first job from an accepted quote"
            }
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button>
              <Wrench className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
