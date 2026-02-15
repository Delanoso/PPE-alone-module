-- CreateTable
CREATE TABLE "DepartmentPpeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department_id" TEXT NOT NULL,
    "ppe_item_id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DepartmentPpeItem_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DepartmentPpeItem_ppe_item_id_fkey" FOREIGN KEY ("ppe_item_id") REFERENCES "PpeItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentPpeItem_department_id_ppe_item_id_key" ON "DepartmentPpeItem"("department_id", "ppe_item_id");
