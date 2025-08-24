"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, MapPin, Plus, Search, Check } from "lucide-react";
import { useApp } from "@/lib/context";
import { Client, Building } from "@/lib/types";
import { ClientService, BuildingService } from "@/lib/mock-services";
import { motion } from "framer-motion";

interface QuoteFormData {
  clientId: string;
  buildingId?: string;
  notes?: string;
  internalNotes?: string;
}

export default function NewQuotePage() {
  const router = useRouter();
  const { createQuote } = useApp();
  const [formData, setFormData] = useState<QuoteFormData>({
    clientId: "",
    buildingId: "",
    notes: "",
    internalNotes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client search state
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [searchedClients, setSearchedClients] = useState<Client[]>([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);

  // Building state
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);

  // New client dialog state
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    type: "individual" as "individual" | "company",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Switzerland"
  });

  // New building dialog state
  const [newBuildingDialogOpen, setNewBuildingDialogOpen] = useState(false);
  const [newBuildingData, setNewBuildingData] = useState({
    name: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Switzerland",
    accessInfo: ""
  });

  const selectedClient = formData.clientId ?
    searchedClients.find(c => c.id === formData.clientId) : null;

  const selectedBuilding = formData.buildingId ?
    availableBuildings.find(b => b.id === formData.buildingId) : null;

  // Search clients
  const handleClientSearch = async (term: string) => {
    setClientSearchTerm(term);
    if (term.length < 2) {
      setSearchedClients([]);
      return;
    }

    setIsSearchingClients(true);
    try {
      const results = await ClientService.search(term);
      setSearchedClients(results);
    } catch (error) {
      console.error('Error searching clients:', error);
    } finally {
      setIsSearchingClients(false);
    }
  };

  // Load buildings when client is selected
  const handleClientSelect = async (clientId: string) => {
    setFormData(prev => ({ ...prev, clientId, buildingId: "" }));
    setClientSearchOpen(false);

    setIsLoadingBuildings(true);
    try {
      const buildings = await BuildingService.getByClientId(clientId);
      setAvailableBuildings(buildings);
    } catch (error) {
      console.error('Error loading buildings:', error);
    } finally {
      setIsLoadingBuildings(false);
    }
  };

  // Create new client
  const handleCreateClient = async () => {
    try {
      const newClient = await ClientService.create({
        name: newClientData.name,
        type: newClientData.type,
        address: {
          street: newClientData.street,
          city: newClientData.city,
          postalCode: newClientData.postalCode,
          country: newClientData.country
        },
        contacts: newClientData.email || newClientData.phone ? [{
          id: `contact-${Date.now()}`,
          name: newClientData.name,
          email: newClientData.email,
          phone: newClientData.phone
        }] : [],
        paymentTerms: "NET 30",
        language: "EN"
      });

      setSearchedClients(prev => [...prev, newClient]);
      handleClientSelect(newClient.id);
      setNewClientDialogOpen(false);

      // Reset form
      setNewClientData({
        name: "",
        type: "individual",
        email: "",
        phone: "",
        street: "",
        city: "",
        postalCode: "",
        country: "Switzerland"
      });
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  // Create new building
  const handleCreateBuilding = async () => {
    if (!formData.clientId) return;

    try {
      const newBuilding = await BuildingService.create({
        clientId: formData.clientId,
        name: newBuildingData.name,
        address: {
          street: newBuildingData.street,
          city: newBuildingData.city,
          postalCode: newBuildingData.postalCode,
          country: newBuildingData.country
        },
        accessInfo: newBuildingData.accessInfo || undefined,
        photos: [],
        contacts: []
      });

      setAvailableBuildings(prev => [...prev, newBuilding]);
      setFormData(prev => ({ ...prev, buildingId: newBuilding.id }));
      setNewBuildingDialogOpen(false);

      // Reset form
      setNewBuildingData({
        name: "",
        street: "",
        city: "",
        postalCode: "",
        country: "Switzerland",
        accessInfo: ""
      });
    } catch (error) {
      console.error('Error creating building:', error);
    }
  };

  // Submit quote creation
  const handleSubmit = async () => {
    if (!formData.clientId) return;

    setIsSubmitting(true);
    try {
      const quote = await createQuote({
        clientId: formData.clientId,
        buildingId: formData.buildingId || undefined,
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        lines: [] // Will be filled in next steps
      });

      router.push(`/quotes/${quote.id}`);
    } catch (error) {
      console.error('Error creating quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.clientId && formData.clientId.trim() !== "";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create New Quote</h1>
        <p className="text-muted-foreground mt-2">Start by selecting a client and building</p>
      </div>

      {/* Client Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Information
            </CardTitle>
            <CardDescription>
              Select an existing client or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <div className="flex gap-2">
                <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="flex-1 justify-between"
                    >
                      {selectedClient ? selectedClient.name : "Search for a client..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search clients..."
                        value={clientSearchTerm}
                        onValueChange={handleClientSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          No clients found.
                          <Dialog open={newClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="link" className="ml-2">
                                Create new client
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create New Client</DialogTitle>
                                <DialogDescription>
                                  Add a new client to your database
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="clientName">Name</Label>
                                  <Input
                                    id="clientName"
                                    value={newClientData.name}
                                    onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="clientEmail">Email</Label>
                                  <Input
                                    id="clientEmail"
                                    type="email"
                                    value={newClientData.email}
                                    onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="clientPhone">Phone</Label>
                                  <Input
                                    id="clientPhone"
                                    value={newClientData.phone}
                                    onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor="street">Street</Label>
                                    <Input
                                      id="street"
                                      value={newClientData.street}
                                      onChange={(e) => setNewClientData(prev => ({ ...prev, street: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                      id="city"
                                      value={newClientData.city}
                                      onChange={(e) => setNewClientData(prev => ({ ...prev, city: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                      id="postalCode"
                                      value={newClientData.postalCode}
                                      onChange={(e) => setNewClientData(prev => ({ ...prev, postalCode: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                      id="country"
                                      value={newClientData.country}
                                      onChange={(e) => setNewClientData(prev => ({ ...prev, country: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={handleCreateClient}
                                  disabled={!newClientData.name}
                                  className="w-full"
                                >
                                  Create Client
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CommandEmpty>
                        <CommandGroup>
                          {searchedClients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.name}
                              onSelect={() => handleClientSelect(client.id)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.clientId === client.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {client.contacts[0]?.email}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selectedClient && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{selectedClient.name}</span>
                  <Badge variant="secondary">{selectedClient.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>{selectedClient.contacts[0]?.email}</div>
                  <div>{selectedClient.contacts[0]?.phone}</div>
                  <div>{selectedClient.address.street}, {selectedClient.address.city}</div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Building Selection */}
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Building/Site Information
              </CardTitle>
              <CardDescription>
                Select the building or site for this quote (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingBuildings ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading buildings...</p>
                </div>
              ) : availableBuildings.length > 0 ? (
                <div className="grid gap-2">
                  {availableBuildings.map((building) => (
                    <div
                      key={building.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.buildingId === building.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, buildingId: building.id }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{building.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {building.address.street}, {building.address.city}
                          </div>
                        </div>
                        {formData.buildingId === building.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No buildings found for this client</p>
                </div>
              )}

              {/* New Building Button */}
              <div className="pt-2 border-t">
                <Dialog open={newBuildingDialogOpen} onOpenChange={setNewBuildingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Building
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Building</DialogTitle>
                      <DialogDescription>
                        Create a new building for {selectedClient?.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="buildingName">Building Name</Label>
                        <Input
                          id="buildingName"
                          value={newBuildingData.name}
                          onChange={(e) => setNewBuildingData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Main Office Building"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buildingStreet">Street Address</Label>
                        <Input
                          id="buildingStreet"
                          value={newBuildingData.street}
                          onChange={(e) => setNewBuildingData(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Bahnhofstrasse 1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="buildingCity">City</Label>
                          <Input
                            id="buildingCity"
                            value={newBuildingData.city}
                            onChange={(e) => setNewBuildingData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Zürich"
                          />
                        </div>
                        <div>
                          <Label htmlFor="buildingPostalCode">Postal Code</Label>
                          <Input
                            id="buildingPostalCode"
                            value={newBuildingData.postalCode}
                            onChange={(e) => setNewBuildingData(prev => ({ ...prev, postalCode: e.target.value }))}
                            placeholder="8001"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="buildingCountry">Country</Label>
                        <Input
                          id="buildingCountry"
                          value={newBuildingData.country}
                          onChange={(e) => setNewBuildingData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Switzerland"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buildingAccessInfo">Access Information</Label>
                        <Textarea
                          id="buildingAccessInfo"
                          value={newBuildingData.accessInfo}
                          onChange={(e) => setNewBuildingData(prev => ({ ...prev, accessInfo: e.target.value }))}
                          placeholder="Main entrance, security code, access hours..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateBuilding} className="flex-1">
                          Create Building
                        </Button>
                        <Button variant="outline" onClick={() => setNewBuildingDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Optional notes and details for this quote
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Client Notes</Label>
              <Textarea
                id="notes"
                placeholder="Visible to client on the quote..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                placeholder="Only visible to your team..."
                value={formData.internalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Quote"}
        </Button>
      </div>
    </div>
  );
}
