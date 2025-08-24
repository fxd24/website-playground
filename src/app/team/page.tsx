"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Users,
  Plus,
  Search,
  User,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  Phone,
  Mail,
  MapPin,
  Play,
  Square,
  Eye,
  Timer,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useApp } from "@/lib/context";
import { TeamMember, TimeEntry, Job, TeamPerformance } from "@/lib/types";
import { motion } from "framer-motion";

const roleColors = {
  Owner: "bg-purple-100 text-purple-800",
  Manager: "bg-blue-100 text-blue-800",
  Technician: "bg-green-100 text-green-800",
  Accountant: "bg-orange-100 text-orange-800",
  Subcontractor: "bg-gray-100 text-gray-800",
  ReadOnly: "bg-gray-100 text-gray-600"
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  on_leave: "bg-yellow-100 text-yellow-800"
};

const certificationStatusColors = {
  valid: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  expiring_soon: "bg-orange-100 text-orange-800"
};

export default function TeamPage() {
  const {
    teamMembers,
    timeEntries,
    jobs,
    isLoadingTeamMembers,
    isLoadingTimeEntries,
    startTimeEntry,
    stopTimeEntry,
    approveTimeEntry,
    getPendingTimeApprovals,
    getTeamPerformance
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("members");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [timeEntryDescription, setTimeEntryDescription] = useState("");
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const pendingApprovals = timeEntries.filter(entry => !entry.approved);

  // Calculate team metrics
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const totalHoursThisMonth = timeEntries
    .filter(entry => {
      const entryDate = entry.date;
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear;
    })
    .reduce((sum, entry) => sum + (entry.duration || 0), 0);

  const billableHoursThisMonth = timeEntries
    .filter(entry => {
      const entryDate = entry.date;
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear && entry.billable;
    })
    .reduce((sum, entry) => sum + (entry.duration || 0), 0);

  const expiringCertifications = teamMembers
    .flatMap(member => member.certifications)
    .filter(cert => cert.status === 'expiring_soon' || cert.status === 'expired');

  const handleStartTimer = async (memberId: string) => {
    if (!selectedJobId) return;

    const newEntry = await startTimeEntry(memberId, selectedJobId, timeEntryDescription);
    if (newEntry) {
      setActiveTimer(newEntry);
      setSelectedJobId("");
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

  const handleApproveTimeEntry = async (entryId: string) => {
    await approveTimeEntry(entryId, 'user-1'); // Current user as approver
  };

  if (isLoadingTeamMembers) {
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
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members, time tracking, and performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Full Name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@company.ch" />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Add Team Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">Out of {teamMembers.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalHoursThisMonth)}</div>
            <p className="text-xs text-muted-foreground">Total tracked hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(billableHoursThisMonth)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((billableHoursThisMonth / totalHoursThisMonth) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">Time entries to approve</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {expiringCertifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Certification Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringCertifications.slice(0, 3).map((cert, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{cert.name} - Expires {cert.expiryDate.toLocaleDateString()}</span>
                  <Badge className={certificationStatusColors[cert.status]}>
                    {cert.status === 'expiring_soon' ? 'Expiring Soon' : 'Expired'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 min-h-0">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Technician">Technician</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Accountant">Accountant</SelectItem>
                <SelectItem value="Subcontractor">Subcontractor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge className={roleColors[member.role]}>{member.role}</Badge>
                            <Badge className={statusColors[member.status]}>{member.status}</Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {member.phone}
                        </div>
                      )}
                      {member.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {member.address.city}
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div>
                      <div className="text-sm font-medium mb-2">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <div className="text-sm font-medium mb-2">Certifications</div>
                      <div className="space-y-1">
                        {member.certifications.map((cert, certIndex) => (
                          <div key={certIndex} className="flex items-center justify-between text-xs">
                            <span className="truncate">{cert.name}</span>
                            <Badge className={certificationStatusColors[cert.status]}>
                              {cert.status === 'expiring_soon' ? 'Soon' : cert.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Timer className="h-3 w-3 mr-1" />
                            Start Timer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Start Time Tracking</DialogTitle>
                            <DialogDescription>
                              Track time for {member.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="job">Select Job</Label>
                              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a job" />
                                </SelectTrigger>
                                <SelectContent>
                                  {jobs
                                    .filter(job => job.status === 'InProgress' || job.status === 'Planned')
                                    .map(job => (
                                      <SelectItem key={job.id} value={job.id}>
                                        {job.title}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="description">Description (Optional)</Label>
                              <Textarea
                                id="description"
                                value={timeEntryDescription}
                                onChange={(e) => setTimeEntryDescription(e.target.value)}
                                placeholder="What are you working on?"
                              />
                            </div>
                            <Button onClick={() => handleStartTimer(member.id)} disabled={!selectedJobId}>
                              Start Timer
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all" ? "No team members found" : "No team members yet"}
              </p>
              {!searchTerm && roleFilter === "all" && statusFilter === "all" && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Team Member
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="time" className="space-y-4 min-h-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Time Tracking</span>
                {activeTimer && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    Timer Active
                  </div>
                )}
              </CardTitle>
              <CardDescription>Track time spent on jobs and approve entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pending Approvals */}
              {pendingApprovals.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Pending Approvals</h3>
                  <div className="space-y-3">
                    {pendingApprovals.map((entry) => {
                      const member = teamMembers.find(m => m.id === entry.teamMemberId);
                      const job = jobs.find(j => j.id === entry.jobId);
                      return (
                        <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{member?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {job?.title} • {entry.duration || 0}h • {entry.date.toLocaleDateString()}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleApproveTimeEntry(entry.id)}>
                            Approve
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Time Entries */}
              <div>
                <h3 className="font-medium mb-3">Recent Time Entries</h3>
                <div className="space-y-3">
                  {timeEntries.slice(0, 10).map((entry) => {
                    const member = teamMembers.find(m => m.id === entry.teamMemberId);
                    const job = jobs.find(j => j.id === entry.jobId);
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{member?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {job?.title} • {entry.duration || 0}h • {entry.date.toLocaleDateString()}
                          </div>
                          {entry.description && (
                            <div className="text-xs text-muted-foreground">{entry.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.approved ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 min-h-0">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Monthly performance metrics for all team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{member.hourlyRate} CHF/h</div>
                        <div className="text-sm text-muted-foreground">Hourly Rate</div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Hours</div>
                        <div className="font-medium">168h</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Billable Hours</div>
                        <div className="font-medium">140h</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Utilization</div>
                        <div className="font-medium">83%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Satisfaction</div>
                        <div className="font-medium flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          4.8
                        </div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="mt-3 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Billable Hours</span>
                          <span>140/168h (83%)</span>
                        </div>
                        <Progress value={83} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Quality Rating</span>
                          <span>4.9/5.0</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
