// Central source of truth for roles + what each role can reach.
// Adding a new role or module means editing exactly this file.

export const ROLES = ["Super Admin", "Store Owner", "Manager", "Cashier/Biller"];

export const MODULES = {
  dashboard: "Hub",
  supplier: "Suppliers",
  product: "Stock In",
  bill: "Billing",
  sales: "Report",
  customer: "Customers",
  users: "Users",
};

// which module keys each role is allowed to open
export const ROLE_ACCESS = {
  "Super Admin": ["dashboard", "supplier", "product", "bill", "sales", "customer", "users"],
  "Store Owner": ["dashboard", "supplier", "product", "bill", "sales", "customer", "users"],
  "Manager": ["dashboard", "supplier", "product", "bill", "sales", "customer"],
  "Cashier/Biller": ["dashboard", "bill", "customer"],
};

export const ROLE_DESCRIPTION = {
  "Super Admin": "Full system access - manages users, roles, and every module.",
  "Store Owner": "Full operational access across every store module and staff.",
  "Manager": "Runs day-to-day inventory, billing, and customer operations.",
  "Cashier/Biller": "Front-counter access - billing and customer look-up only.",
};

export const ROLE_CLASS = {
  "Super Admin": "role-superadmin",
  "Store Owner": "role-storeowner",
  "Manager": "role-manager",
  "Cashier/Biller": "role-cashier",
};

export function canAccess(role, moduleKey) {
  if (!role) return false;
  return (ROLE_ACCESS[role] || []).includes(moduleKey);
}
