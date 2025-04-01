
export interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email?: string;
  managerName: string;
  managerId: string;
  status: BranchStatus;
  openingDate: Date;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum BranchStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
