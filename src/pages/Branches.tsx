
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockBranches } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BranchStatus } from '@/types/branch';
import { Building2, Users, Phone, Mail, Calendar, MapPin, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Branches = () => {
  const getStatusColor = (status: BranchStatus) => {
    switch(status) {
      case BranchStatus.ACTIVE:
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case BranchStatus.INACTIVE:
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case BranchStatus.PENDING:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">Manage your organization's branches</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Add Branch</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input id="name" placeholder="Enter branch name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager Name</Label>
                <Input id="manager" placeholder="Enter manager name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingDate">Opening Date</Label>
                <Input id="openingDate" type="date" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter address" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save Branch</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBranches.map((branch) => (
          <Card key={branch.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{branch.name}</CardTitle>
                <Badge className={getStatusColor(branch.status)} variant="outline">
                  {branch.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {branch.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Manager: {branch.managerName}</span>
                </div>
                <div className="flex gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{branch.email || 'No email'}</span>
                </div>
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Opened: {branch.openingDate.toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{branch.employeeCount} employees</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="outline" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
};

export default Branches;
