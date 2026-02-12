import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export const createPersonSchema = z.object({
  employeeNo: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  mobileNumber: z.string().min(8),
  departmentId: z.string().uuid(),
  subDepartmentId: z.string().uuid(),
  jobTitleId: z.string().uuid().optional(),
  sizes: z
    .array(
      z.object({
        sizeType: z.string().min(1),
        sizeValue: z.string().min(1),
      }),
    )
    .default([]),
});

export const updatePersonSchema = createPersonSchema.partial().extend({
  employmentStatus: z.enum(["active", "inactive", "terminated", "suspended"]).optional(),
});

export const createIssueSchema = z.object({
  personId: z.string().uuid(),
  locationId: z.string().uuid(),
  signatureMode: z.enum(["in_person", "remote"]),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        ppeVariantId: z.string().uuid(),
        quantity: z.number().positive(),
      }),
    )
    .min(1),
});
