CREATE UNIQUE INDEX IF NOT EXISTS one_refueling_manager_per_branch
ON "User" ("branchId")
WHERE role = 'REFUELING_MANAGER';

CREATE UNIQUE INDEX IF NOT EXISTS one_fuel_admin_per_branch
ON "User" ("branchId")
WHERE role = 'FUEL_ADMIN';
