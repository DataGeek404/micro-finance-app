
import { Client, ClientStatus } from "@/types/client";

/**
 * Converts a client from Supabase format to application format
 */
export const transformClientData = (client: any): Client => ({
  id: client.id,
  firstName: client.first_name,
  lastName: client.last_name,
  email: client.email || undefined,
  phone: client.phone,
  address: client.address,
  nationalId: client.national_id,
  dateOfBirth: new Date(client.date_of_birth),
  gender: client.gender as 'male' | 'female' | 'other',
  occupation: client.occupation,
  incomeSource: client.income_source,
  monthlyIncome: Number(client.monthly_income),
  branchId: client.branch_id,
  createdAt: new Date(client.created_at),
  updatedAt: new Date(client.updated_at),
  status: client.status as ClientStatus,
  photo: client.photo || undefined,
});

/**
 * Prepares client data for CSV export
 */
export const prepareClientsForExport = (clients: Client[]): Record<string, string>[] => {
  return clients.map(client => ({
    'ID': client.id,
    'First Name': client.firstName,
    'Last Name': client.lastName,
    'Email': client.email || '',
    'Phone': client.phone,
    'Address': client.address,
    'National ID': client.nationalId,
    'Date of Birth': client.dateOfBirth.toISOString().split('T')[0],
    'Gender': client.gender,
    'Occupation': client.occupation,
    'Income Source': client.incomeSource,
    'Monthly Income': client.monthlyIncome.toString(),
    'Status': client.status,
    'Created At': client.createdAt.toISOString().split('T')[0],
  }));
};

/**
 * Converts client data to PDF-ready format
 */
export const prepareClientsForPDF = (clients: Client[]): any[] => {
  return clients.map(client => ({
    id: client.id,
    name: `${client.firstName} ${client.lastName}`,
    contact: client.email || client.phone,
    nationalId: client.nationalId,
    income: `$${client.monthlyIncome.toLocaleString()}`,
    status: client.status,
    createdAt: client.createdAt.toISOString().split('T')[0]
  }));
};
