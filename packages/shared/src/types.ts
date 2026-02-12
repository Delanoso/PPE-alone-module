export type EmploymentStatus = "active" | "inactive" | "terminated" | "suspended";

export type IssueStatus = "draft" | "pending_signature" | "signed" | "cancelled";

export type SignatureMode = "in_person" | "remote";

export type SizeProfile = {
  sizeType: string;
  sizeValue: string;
};

export type Department = {
  id: string;
  name: string;
  code: string;
};

export type SubDepartment = {
  id: string;
  departmentId: string;
  name: string;
  code: string;
};

export type Person = {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  departmentId: string;
  subDepartmentId: string;
  employmentStatus: EmploymentStatus;
  sizes: SizeProfile[];
};

export type PPEVariant = {
  id: string;
  variantCode: string;
  itemName: string;
  sizeValue: string;
  minStockLevel: number;
};

export type DashboardSummary = {
  activeWorkers: number;
  openIssues: number;
  pendingSignatures: number;
  lowStockItems: number;
};
