import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: "../../.env" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    { roleCode: "super_admin", roleName: "Super Admin" },
    { roleCode: "health_safety_manager", roleName: "Health and Safety Manager" },
    { roleCode: "storeman", roleName: "Storeman" },
    { roleCode: "department_supervisor", roleName: "Department Supervisor" },
    { roleCode: "hr_admin", roleName: "HR/Admin Officer" },
    { roleCode: "auditor", roleName: "Read-Only Auditor" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { roleCode: role.roleCode },
      update: role,
      create: role,
    });
  }

  const transport = await prisma.department.upsert({
    where: { departmentCode: "TRANSPORT" },
    update: { departmentName: "Transport Operations", isActive: true },
    create: {
      departmentCode: "TRANSPORT",
      departmentName: "Transport Operations",
    },
  });

  const workshop = await prisma.department.upsert({
    where: { departmentCode: "TRUCK_WS" },
    update: { departmentName: "Truck Workshop", isActive: true },
    create: {
      departmentCode: "TRUCK_WS",
      departmentName: "Truck Workshop",
    },
  });

  await prisma.subDepartment.upsert({
    where: {
      departmentId_subDepartmentCode: {
        departmentId: transport.id,
        subDepartmentCode: "REF_LONG",
      },
    },
    update: {
      subDepartmentName: "Refrigerated Trucks - Long Haul",
      isActive: true,
    },
    create: {
      departmentId: transport.id,
      subDepartmentCode: "REF_LONG",
      subDepartmentName: "Refrigerated Trucks - Long Haul",
    },
  });

  await prisma.subDepartment.upsert({
    where: {
      departmentId_subDepartmentCode: {
        departmentId: workshop.id,
        subDepartmentCode: "MECH",
      },
    },
    update: { subDepartmentName: "Mechanical Maintenance", isActive: true },
    create: {
      departmentId: workshop.id,
      subDepartmentCode: "MECH",
      subDepartmentName: "Mechanical Maintenance",
    },
  });

  const bootsCategory = await prisma.ppeCategory.upsert({
    where: { categoryCode: "FOOT" },
    update: { categoryName: "Foot Protection", isActive: true },
    create: {
      categoryCode: "FOOT",
      categoryName: "Foot Protection",
    },
  });

  const bootsItem = await prisma.ppeItem.upsert({
    where: { itemCode: "BOOT_SAFETY" },
    update: {
      itemName: "Safety Boots",
      categoryId: bootsCategory.id,
      isActive: true,
      isMandatory: true,
      replacementCycleDays: 365,
    },
    create: {
      categoryId: bootsCategory.id,
      itemCode: "BOOT_SAFETY",
      itemName: "Safety Boots",
      isMandatory: true,
      replacementCycleDays: 365,
    },
  });

  await prisma.ppeVariant.upsert({
    where: { variantCode: "BOOT_SAFETY_9" },
    update: {
      ppeItemId: bootsItem.id,
      sizeValue: "9",
      color: "Black",
      minStockLevel: 20,
      isActive: true,
    },
    create: {
      ppeItemId: bootsItem.id,
      variantCode: "BOOT_SAFETY_9",
      sizeValue: "9",
      color: "Black",
      minStockLevel: 20,
    },
  });

  await prisma.location.upsert({
    where: { locationCode: "MAIN_STORE" },
    update: { locationName: "Main PPE Store", locationType: "warehouse", isActive: true },
    create: {
      locationCode: "MAIN_STORE",
      locationName: "Main PPE Store",
      locationType: "warehouse",
    },
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { roleCode: "super_admin" },
  });
  const passwordHash = await bcrypt.hash("ChangeMe_12345", 12);

  await prisma.user.upsert({
    where: { email: "admin@hfr-schafer.co.za" },
    update: {
      fullName: "HFR Super Admin",
      roleId: superAdminRole.id,
      passwordHash,
      isActive: true,
    },
    create: {
      fullName: "HFR Super Admin",
      email: "admin@hfr-schafer.co.za",
      roleId: superAdminRole.id,
      passwordHash,
      isActive: true,
    },
  });

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
