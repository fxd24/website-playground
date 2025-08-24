"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Building2,
  Star,
  Target
} from "lucide-react";
import { useApp } from "@/lib/context";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const { quotes, jobs, invoices, clients, suppliers, teamMembers, timeEntries } = useApp();

  // Calculate key metrics
  const totalQuotes = quotes.length;
  const acceptedQuotes = quotes.filter(q => q.status === 'Accepted').length;
  const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  const activeJobs = jobs.filter(j => j.status === 'InProgress').length;
  const totalJobValue = jobs.reduce((sum, job) => sum + (job.actualCost || job.estimatedCost), 0);

  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  const outstandingInvoices = invoices
    .filter(inv => inv.status !== 'Paid' && inv.status !== 'WrittenOff')
    .reduce((sum, inv) => sum + inv.balance, 0);

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const billableHours = timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + (entry.duration || 0), 0);

  const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

  // Monthly trends (mock data for demonstration)
  const monthlyRevenue = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000 },
    { month: 'Jun', amount: 67000 },
  ];

  const jobCompletion = [
    { month: 'Jan', completed: 8, target: 10 },
    { month: 'Feb', completed: 9, target: 10 },
    { month: 'Mar', completed: 7, target: 10 },
    { month: 'Apr', completed: 11, target: 12 },
    { month: 'May', completed: 10, target: 12 },
    { month: 'Jun', completed: 12, target: 12 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quote Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {acceptedQuotes} of {totalQuotes} quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {outstandingInvoices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {billableHours.toFixed(0)}h of {totalHours.toFixed(0)}h
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Business Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quotes & Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Quotes</span>
                  <span className="font-medium">{totalQuotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Accepted Quotes</span>
                  <span className="font-medium">{acceptedQuotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Jobs</span>
                  <span className="font-medium">{activeJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed Jobs</span>
                  <span className="font-medium">{completedJobs}</span>
                </div>
                <Progress value={conversionRate} className="mt-2" />
                <p className="text-xs text-muted-foreground">Quote conversion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">CHF {totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Job Value</span>
                  <span className="font-medium">CHF {totalJobValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Outstanding</span>
                  <span className="font-medium">CHF {outstandingInvoices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Collection Rate</span>
                  <span className="font-medium">
                    {totalRevenue + outstandingInvoices > 0
                      ? ((totalRevenue / (totalRevenue + outstandingInvoices)) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team & Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Team Members</span>
                  <span className="font-medium">{teamMembers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Members</span>
                  <span className="font-medium">{teamMembers.filter(m => m.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Hours</span>
                  <span className="font-medium">{totalHours.toFixed(0)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Billable Hours</span>
                  <span className="font-medium">{billableHours.toFixed(0)}h</span>
                </div>
                <Progress value={utilizationRate} className="mt-2" />
                <p className="text-xs text-muted-foreground">Team utilization rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
              <CardDescription>Key observations from your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Strong Quote Conversion</p>
                    <p className="text-sm text-muted-foreground">
                      {conversionRate.toFixed(1)}% of quotes are being accepted
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Good Team Utilization</p>
                    <p className="text-sm text-muted-foreground">
                      {utilizationRate.toFixed(1)}% billable hours ratio
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Outstanding Invoices</p>
                    <p className="text-sm text-muted-foreground">
                      CHF {outstandingInvoices.toLocaleString()} to collect
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyRevenue.map((item, index) => (
                  <motion.div
                    key={item.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{item.month}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${(item.amount / 70000) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium w-20 text-right">
                        CHF {item.amount.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Completion Performance</CardTitle>
              <CardDescription>Actual vs target job completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobCompletion.map((item, index) => {
                  const achievement = (item.completed / item.target) * 100;
                  return (
                    <motion.div
                      key={item.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${achievement >= 100 ? 'bg-green-600' : 'bg-orange-600'}`}
                            style={{ width: `${achievement}%` }}
                          />
                        </div>
                        <span className="font-medium w-16 text-right">
                          {item.completed}/{item.target}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Monthly Hours</div>
                        <div className="font-medium">168h</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Billable Hours</div>
                        <div className="font-medium">140h</div>
                      </div>
                    </div>
                    <Progress value={83} className="h-2" />
                    <div className="text-xs text-muted-foreground">83% utilization rate</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
