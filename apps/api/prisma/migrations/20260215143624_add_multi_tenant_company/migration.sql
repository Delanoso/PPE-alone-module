-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TEXT,
    "company_id" TEXT,
    CONSTRAINT "Department_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Department" ("code", "created_at", "id", "is_active", "name") SELECT "code", "created_at", "id", "is_active", "name" FROM "Department";
DROP TABLE "Department";
ALTER TABLE "new_Department" RENAME TO "Department";
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT,
    "department_id" TEXT NOT NULL,
    "sub_department_id" TEXT NOT NULL,
    "job_title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "employment_type" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "company_id" TEXT,
    CONSTRAINT "Person_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Person_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Person_sub_department_id_fkey" FOREIGN KEY ("sub_department_id") REFERENCES "SubDepartment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Person" ("department_id", "email", "employee_number", "employment_type", "first_name", "full_name", "id", "job_title", "last_name", "mobile_number", "status", "sub_department_id") SELECT "department_id", "email", "employee_number", "employment_type", "first_name", "full_name", "id", "job_title", "last_name", "mobile_number", "status", "sub_department_id" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
CREATE TABLE "new_PpeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_id" TEXT,
    CONSTRAINT "PpeCategory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PpeCategory" ("description", "id", "name") SELECT "description", "id", "name" FROM "PpeCategory";
DROP TABLE "PpeCategory";
ALTER TABLE "new_PpeCategory" RENAME TO "PpeCategory";
CREATE TABLE "new_PpeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_name" TEXT,
    "size_required" BOOLEAN NOT NULL DEFAULT false,
    "size_key" TEXT,
    "min_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "reorder_level" INTEGER NOT NULL DEFAULT 20,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "company_id" TEXT,
    CONSTRAINT "PpeItem_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PpeItem_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "PpeCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PpeItem" ("category_id", "category_name", "id", "is_active", "min_stock_threshold", "name", "reorder_level", "size_key", "size_required", "sku") SELECT "category_id", "category_name", "id", "is_active", "min_stock_threshold", "name", "reorder_level", "size_key", "size_required", "sku" FROM "PpeItem";
DROP TABLE "PpeItem";
ALTER TABLE "new_PpeItem" RENAME TO "PpeItem";
CREATE TABLE "new_StockLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "company_id" TEXT,
    CONSTRAINT "StockLocation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StockLocation" ("code", "id", "is_active", "name") SELECT "code", "id", "is_active", "name" FROM "StockLocation";
DROP TABLE "StockLocation";
ALTER TABLE "new_StockLocation" RENAME TO "StockLocation";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "roleIds" TEXT,
    "company_id" TEXT,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "User_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "full_name", "id", "password_hash", "roleIds", "status", "username") SELECT "email", "full_name", "id", "password_hash", "roleIds", "status", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
