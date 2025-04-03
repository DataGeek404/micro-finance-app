import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, ClientStatus } from "@/types/client";

const clientSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  address: z.string().min(5, { message: "Address is required" }),
  nationalId: z.string().min(5, { message: "National ID is required" }),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Valid date is required" }),
  gender: z.enum(["male", "female", "other"], { message: "Gender is required" }),
  occupation: z.string().min(2, { message: "Occupation is required" }),
  incomeSource: z.string().min(2, { message: "Income source is required" }),
  monthlyIncome: z.number().positive({ message: "Monthly income must be positive" }),
  branchId: z.string().uuid({ message: "Valid branch ID is required" }),
  status: z.enum(["ACTIVE", "INACTIVE", "BLACKLISTED", "PENDING"], { message: "Status is required" }),
});

type ClientFormData = z.infer<typeof clientSchema>;
type ClientFormProps = {
  client?: Client;
  branches: { id: string; name: string }[];
  onSubmit: (data: ClientFormData) => void;
  isSubmitting: boolean;
};

export const ClientForm = ({ client, branches, onSubmit, isSubmitting }: ClientFormProps) => {
  const defaultValues = client
    ? {
        ...client,
        dateOfBirth: format(new Date(client.dateOfBirth), "yyyy-MM-dd"),
        monthlyIncome: Number(client.monthlyIncome),
      }
    : {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        nationalId: "",
        dateOfBirth: "",
        gender: "male" as const,
        occupation: "",
        incomeSource: "",
        monthlyIncome: 0,
        branchId: "",
        status: "PENDING" as ClientStatus,
      };

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  const handleSubmit = (data: ClientFormData) => {
    onSubmit({
      ...data,
      monthlyIncome: Number(data.monthlyIncome),
    });
  };

  const validBranches = branches && branches.length > 0 ? branches : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nationalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>National ID</FormLabel>
                <FormControl>
                  <Input placeholder="ID1234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Teacher" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incomeSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income Source</FormLabel>
                <FormControl>
                  <Input placeholder="Salary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Income</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="5000" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={validBranches.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || validBranches.length === 0}>
            {client ? "Update Client" : "Create Client"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
