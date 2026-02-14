-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "roleIds" TEXT
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TEXT
);

-- CreateTable
CREATE TABLE "SubDepartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SubDepartment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Person" (
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
    CONSTRAINT "Person_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Person_sub_department_id_fkey" FOREIGN KEY ("sub_department_id") REFERENCES "SubDepartment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonSizes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "person_id" TEXT NOT NULL,
    "coverall_size" TEXT,
    "shoe_size" TEXT,
    "reflective_vest_size" TEXT,
    "clothing_size" TEXT,
    "jacket_size" TEXT,
    "trouser_size" TEXT,
    "glove_size" TEXT,
    "helmet_size" TEXT,
    "rain_suit_size" TEXT,
    CONSTRAINT "PersonSizes_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PpeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "PpeItem" (
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
    CONSTRAINT "PpeItem_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "PpeCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "StockBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location_id" TEXT NOT NULL,
    "ppe_item_id" TEXT NOT NULL,
    "size_label" TEXT,
    "on_hand_qty" INTEGER NOT NULL DEFAULT 0,
    "ppe_item_name" TEXT,
    CONSTRAINT "StockBalance_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "StockLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockBalance_ppe_item_id_fkey" FOREIGN KEY ("ppe_item_id") REFERENCES "PpeItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location_id" TEXT NOT NULL,
    "ppe_item_id" TEXT NOT NULL,
    "size_label" TEXT,
    "quantity" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "reference_id" TEXT,
    "created_at" TEXT
);

-- CreateTable
CREATE TABLE "PpeIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issue_number" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "issued_from_location_id" TEXT,
    "issue_date" TEXT NOT NULL,
    "issue_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_SIGNATURE',
    "notes" TEXT,
    "created_by" TEXT,
    "person_name" TEXT,
    CONSTRAINT "PpeIssue_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PpeIssueItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issue_id" TEXT NOT NULL,
    "ppe_item_id" TEXT NOT NULL,
    "size_label" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'EA',
    CONSTRAINT "PpeIssueItem_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "PpeIssue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PpeIssueItem_ppe_item_id_fkey" FOREIGN KEY ("ppe_item_id") REFERENCES "PpeItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SignatureRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issue_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "signed_at" TEXT,
    "signed_name" TEXT,
    "created_by" TEXT,
    CONSTRAINT "SignatureRequest_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "PpeIssue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IssueItemSignature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issue_item_id" TEXT NOT NULL,
    "signed_name" TEXT NOT NULL,
    "signed_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SizeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" TEXT,
    "created_by" TEXT,
    "person_names" TEXT,
    "job_title_filter" TEXT,
    "department_id" TEXT
);

-- CreateTable
CREATE TABLE "SizeRequestRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "size_request_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sent_at" TEXT,
    "responded_at" TEXT,
    "reminder_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SizeRequestRecipient_size_request_id_fkey" FOREIGN KEY ("size_request_id") REFERENCES "SizeRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entity_id" TEXT,
    "user_id" TEXT,
    "details" TEXT,
    "created_at" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonSizes_person_id_key" ON "PersonSizes"("person_id");
