/**
 * Application Permission & Access Control Helpers
 */

export interface PermissionUser {
  role?: string | null
  email?: string | null
  fullName?: string | null
  designation?: string | null
}

/**
 * Checks if a user has permission to view and open the "Edit Profile" dialog,
 * and execute the customer profile update action.
 * 
 * Rules:
 * - SUPER_ADMIN: Allowed
 * - ADMIN: Allowed
 * - Muhammad Ajmal (m.ajmal@energygurus.online - Account Manager Sales): Allowed
 * - All other users: Denied (hidden from UI and blocked on server)
 * 
 * Future allocations (e.g. Customer Support, CPM representative) can be added here.
 */
export function canUserEditCustomerProfile(user?: PermissionUser | null): boolean {
  if (!user) return false

  const role = user.role
  const email = (user.email || '').toLowerCase().trim()

  // 1. Super Admin & Admin
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return true
  }

  // 2. Muhammad Ajmal (Account Manager Sales)
  if (email === 'm.ajmal@energygurus.online') {
    return true
  }

  // 3. Future permission allocations:
  // if (role === 'CUSTOMER_SUPPORT') return true
  // if (role === 'CPM_REPRESENTATIVE') return true

  return false
}

/**
 * Checks if a user has permission to edit Solar System specifications,
 * including inverter credentials (Inverter User Name, Inverter Password) and hardware specs.
 * 
 * Rules:
 * - SUPER_ADMIN: Allowed
 * - ADMIN: Allowed
 * - OM_MANAGER: Allowed
 * - Muhammad Ajmal (m.ajmal@energygurus.online - Account Manager Sales): Allowed
 * - All other users: Denied
 */
export function canUserEditSolarSpecs(user?: PermissionUser | null): boolean {
  if (!user) return false

  const role = user.role
  const email = (user.email || '').toLowerCase().trim()

  // 1. Super Admin, Admin & O&M Manager
  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'OM_MANAGER') {
    return true
  }

  // 2. Muhammad Ajmal (Account Manager Sales)
  if (email === 'm.ajmal@energygurus.online') {
    return true
  }

  return false
}
