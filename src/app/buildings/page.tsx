"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  FileText,
  Eye,
  Edit,
  Camera
} from "lucide-react";
import { useApp } from "@/lib/context";
import { Building, Client, Job } from "@/lib/types";
import { motion } from "framer-motion";

export default function BuildingsPage() {
  const { buildings, clients, jobs, isLoadingBuildings } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBuildings = buildings.filter(building => {
    const client = clients.find(c => c.id === building.clientId);
    const searchString = `${building.name} ${client?.name || ''} ${building.address.city} ${building.address.street}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Get building statistics
  const getBuildingStats = (buildingId: string) => {
    const buildingJobs = jobs.filter(job => job.buildingId === buildingId);
    const completedJobs = buildingJobs.filter(job => job.status === 'Completed').length;
    const activeJobs = buildingJobs.filter(job => job.status === 'InProgress').length;
    const totalValue = buildingJobs.reduce((sum, job) => sum + (job.actualCost || job.estimatedCost), 0);

    return {
      totalJobs: buildingJobs.length,
      completedJobs,
      activeJobs,
      totalValue
    };
  };

  // Calculate overall statistics
  const totalBuildings = buildings.length;
  const totalJobs = jobs.length;
  const totalValue = jobs.reduce((sum, job) => sum + (job.actualCost || job.estimatedCost), 0);
  const activeJobs = jobs.filter(job => job.status === 'InProgress').length;

  if (isLoadingBuildings) {
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
          <h1 className="text-3xl font-bold">Buildings & Sites</h1>
          <p className="text-muted-foreground">Manage your building locations and site information</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Building
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Building</DialogTitle>
              <DialogDescription>
                Add a new building or site to your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Building Name</Label>
                <Input id="name" placeholder="Main Office Building" />
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <select className="w-full p-2 border rounded-md" id="client">
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" placeholder="Bahnhofstrasse 1" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Zürich" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" placeholder="8001" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Switzerland" />
                </div>
              </div>
              <div>
                <Label htmlFor="access">Access Information</Label>
                <Textarea
                  id="access"
                  placeholder="Main entrance, security code, access hours..."
                />
              </div>
              <Button className="w-full">Add Building</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBuildings}</div>
            <p className="text-xs text-muted-foreground">Active sites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">Across all buildings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All projects combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search buildings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Buildings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBuildings.map((building, index) => {
          const client = clients.find(c => c.id === building.clientId);
          const stats = getBuildingStats(building.id);

          return (
            <motion.div
              key={building.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{building.name}</CardTitle>
                      <CardDescription>{client?.name}</CardDescription>
                    </div>
                    {building.photos.length > 0 && (
                      <div className="ml-2">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{building.address.street}</div>
                      <div>{building.address.postalCode} {building.address.city}</div>
                      <div>{building.address.country}</div>
                    </div>
                  </div>

                  {/* Access Information */}
                  {building.accessInfo && (
                    <div className="text-sm">
                      <div className="font-medium mb-1">Access Info:</div>
                      <div className="text-muted-foreground">{building.accessInfo}</div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {building.contacts.length > 0 && (
                    <div className="text-sm">
                      <div className="font-medium mb-1">Site Contacts:</div>
                      <div className="space-y-1">
                        {building.contacts.map((contact, contactIndex) => (
                          <div key={contactIndex} className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{contact.name}</span>
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Building Statistics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Jobs</div>
                      <div className="font-medium">{stats.totalJobs}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Active</div>
                      <div className="font-medium">{stats.activeJobs}</div>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Value:</span>
                    <span className="font-medium">CHF {stats.totalValue.toLocaleString()}</span>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredBuildings.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No buildings found" : "No buildings yet"}
          </p>
          {!searchTerm && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Building
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
