"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  CreditCard,
  Building2,
  Smartphone,
  Globe,
  Key,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { FeatureFlagManager } from "@/components/feature-flag-manager";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailQuotes: true,
    emailInvoices: true,
    emailReminders: true,
    pushJobs: true,
    pushMessages: true,
    weeklyReports: true
  });

  const [companySettings, setCompanySettings] = useState({
    name: "TradePro Solutions AG",
    address: "Bahnhofstrasse 1, 8001 Zürich",
    phone: "+41 44 123 45 67",
    email: "info@tradepro.ch",
    website: "https://www.tradepro.ch",
    taxId: "CHE-123.456.789",
    currency: "CHF",
    timezone: "Europe/Zurich",
    language: "de"
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your system preferences and integrations</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={companySettings.taxId}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, taxId: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={companySettings.currency}
                    onValueChange={(value) => setCompanySettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={companySettings.timezone}
                    onValueChange={(value) => setCompanySettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                      <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={companySettings.language}
                    onValueChange={(value) => setCompanySettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your company branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button variant="outline">Upload Logo</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    defaultValue="#3b82f6"
                    className="w-full h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    defaultValue="#64748b"
                    className="w-full h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailQuotes">Quote Updates</Label>
                      <p className="text-sm text-muted-foreground">Notify when quotes are sent or updated</p>
                    </div>
                    <Switch
                      id="emailQuotes"
                      checked={notifications.emailQuotes}
                      onCheckedChange={(checked: boolean) =>
                        setNotifications(prev => ({ ...prev, emailQuotes: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailInvoices">Invoice Updates</Label>
                      <p className="text-sm text-muted-foreground">Notify about invoice payments and reminders</p>
                    </div>
                    <Switch
                      id="emailInvoices"
                      checked={notifications.emailInvoices}
                      onCheckedChange={(checked: boolean) =>
                        setNotifications(prev => ({ ...prev, emailInvoices: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailReminders">Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send overdue payment reminders</p>
                    </div>
                    <Switch
                      id="emailReminders"
                      checked={notifications.emailReminders}
                      onCheckedChange={(checked: boolean) =>
                        setNotifications(prev => ({ ...prev, emailReminders: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyReports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly business reports</p>
                    </div>
                    <Switch
                      id="weeklyReports"
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked: boolean) =>
                        setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushJobs">Job Updates</Label>
                      <p className="text-sm text-muted-foreground">Notify about job status changes</p>
                    </div>
                    <Switch
                      id="pushJobs"
                      checked={notifications.pushJobs}
                      onCheckedChange={(checked: boolean) =>
                        setNotifications(prev => ({ ...prev, pushJobs: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushMessages">Messages</Label>
                      <p className="text-sm text-muted-foreground">Notify about new messages</p>
                    </div>
                    <Switch
                      id="pushMessages"
                      checked={notifications.pushMessages}
                      onCheckedChange={(checked: boolean) =>
                        setNotifications(prev => ({ ...prev, pushMessages: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Service
                </CardTitle>
                <CardDescription>Configure email delivery service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emailProvider">Provider</Label>
                  <Select defaultValue="resend">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend</SelectItem>
                      <SelectItem value="postmark">Postmark</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input id="apiKey" type="password" placeholder="Enter API key" />
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Processing
                </CardTitle>
                <CardDescription>Configure payment gateways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentProvider">Provider</Label>
                  <Select defaultValue="stripe">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentApiKey">API Key</Label>
                  <Input id="paymentApiKey" type="password" placeholder="Enter API key" />
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Setup Required
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Banking Integration
                </CardTitle>
                <CardDescription>Connect to your bank accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bankProvider">Bank Provider</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ubs">UBS</SelectItem>
                      <SelectItem value="credit-suisse">Credit Suisse</SelectItem>
                      <SelectItem value="zurich-canton">Zürich Cantonal</SelectItem>
                      <SelectItem value="raiffeisen">Raiffeisen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input id="iban" placeholder="CH93 0076 2011 6238 5295 7" />
                </div>
                <Badge className="bg-gray-100 text-gray-800">
                  Not Connected
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Calendar Integration
                </CardTitle>
                <CardDescription>Sync with calendar services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="calendarProvider">Provider</Label>
                  <Select defaultValue="google">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Calendar</SelectItem>
                      <SelectItem value="outlook">Outlook</SelectItem>
                      <SelectItem value="apple">Apple Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Connect Account
                </Button>
                <Badge className="bg-blue-100 text-blue-800">
                  Available
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security preferences and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password Policy</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Strong Passwords</Label>
                      <p className="text-sm text-muted-foreground">Minimum 8 characters with numbers and symbols</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Password Expiry</Label>
                      <p className="text-sm text-muted-foreground">Require password change every 90 days</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable 2FA for All Users</Label>
                      <p className="text-sm text-muted-foreground">Require TOTP for all user accounts</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Session Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 cursor-pointer bg-white">
                    <div className="w-full h-20 bg-gray-100 rounded mb-2"></div>
                    <p className="text-sm font-medium">Light</p>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer">
                    <div className="w-full h-20 bg-gray-900 rounded mb-2"></div>
                    <p className="text-sm font-medium">Dark</p>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer">
                    <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                    <p className="text-sm font-medium">System</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Layout Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Reduce padding and spacing</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>High Contrast</Label>
                      <p className="text-sm text-muted-foreground">Improve accessibility</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <FeatureFlagManager />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>View system status and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Application Version</Label>
                  <p className="text-sm text-muted-foreground mt-1">TradePro v1.0.0</p>
                </div>
                <div>
                  <Label>Database Status</Label>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Last Backup</Label>
                  <p className="text-sm text-muted-foreground mt-1">2024-08-22 02:00</p>
                </div>
                <div>
                  <Label>System Health</Label>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>System maintenance and optimization tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Generate Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
