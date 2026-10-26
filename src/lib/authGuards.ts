'use client';

import { UserRole, User } from './types';

/**
 * Checks whether the client is authenticated as an Admin.
 * Checks persistent localStorage markers and reactive store state.
 */
export function checkIsAdminAuthenticated(
  isHydrated: boolean,
  isLoggedIn: boolean,
  user: User | null | undefined,
  role: UserRole
): boolean {
  if (typeof window === 'undefined') return false;

  const storedLoggedIn = localStorage.getItem('torque_logged_in') === 'true';
  const storedAdminUid = localStorage.getItem('torque_admin_uid');
  const storedAdminEmail = localStorage.getItem('torque_admin_email');

  let storedUserRole: string | undefined;
  let storedUserId: string | undefined;
  try {
    const rawUser = localStorage.getItem('torque_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      storedUserRole = parsed?.role;
      storedUserId = parsed?.id || parsed?.uid;
    }
  } catch {
    // ignore
  }

  const hasAdminStorage =
    storedLoggedIn &&
    (Boolean(storedAdminUid) ||
      Boolean(storedAdminEmail) ||
      (storedUserRole === 'admin' && storedUserId !== 'usr_guest'));

  const hasAdminStore =
    isLoggedIn &&
    (role === 'admin' || user?.role === 'admin') &&
    user?.id !== 'usr_guest';

  return Boolean(hasAdminStorage || hasAdminStore);
}

/**
 * Checks whether the client is authenticated as a Washer partner.
 * Checks persistent localStorage markers and reactive store state.
 */
export function checkIsWasherAuthenticated(
  isHydrated: boolean,
  isLoggedIn: boolean,
  user: User | null | undefined,
  role: UserRole
): boolean {
  if (typeof window === 'undefined') return false;

  const storedLoggedIn = localStorage.getItem('torque_logged_in') === 'true';
  const storedWasherId = localStorage.getItem('torque_washer_id');
  const storedWasherPhone = localStorage.getItem('torque_washer_phone');

  let storedUserRole: string | undefined;
  let storedUserId: string | undefined;
  try {
    const rawUser = localStorage.getItem('torque_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      storedUserRole = parsed?.role;
      storedUserId = parsed?.id || parsed?.uid;
    }
  } catch {
    // ignore
  }

  const hasWasherStorage =
    storedLoggedIn &&
    (Boolean(storedWasherId) ||
      Boolean(storedWasherPhone) ||
      (storedUserRole === 'washer' && storedUserId !== 'usr_guest'));

  const hasWasherStore =
    isLoggedIn &&
    (role === 'washer' || user?.role === 'washer') &&
    user?.id !== 'usr_guest';

  return Boolean(hasWasherStorage || hasWasherStore);
}

/**
 * Checks whether the client is authenticated as a Car Owner.
 * Checks persistent localStorage markers and reactive store state.
 */
export function checkIsOwnerAuthenticated(
  isHydrated: boolean,
  isLoggedIn: boolean,
  user: User | null | undefined,
  role: UserRole
): boolean {
  if (typeof window === 'undefined') return true;

  const storedLoggedIn = localStorage.getItem('torque_logged_in') === 'true';
  const storedOwnerId = localStorage.getItem('torque_owner_id');
  const storedOwnerName = localStorage.getItem('torque_owner_name');

  let storedUserRole: string | undefined;
  let storedUserId: string | undefined;
  try {
    const rawUser = localStorage.getItem('torque_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      storedUserRole = parsed?.role;
      storedUserId = parsed?.id || parsed?.uid;
    }
  } catch {
    // ignore
  }

  // Active storage flags for owner
  const hasOwnerStorage =
    (storedLoggedIn && (storedUserRole === 'owner' || Boolean(storedOwnerId) || Boolean(storedOwnerName))) ||
    Boolean(storedOwnerId) ||
    Boolean(storedOwnerName) ||
    storedUserRole === 'owner';

  // Active reactive store state
  const hasOwnerStore =
    isLoggedIn ||
    role === 'owner' ||
    user?.role === 'owner';

  return Boolean(hasOwnerStorage || hasOwnerStore);
}
