import type { Access, FieldAccess } from "payload";

/** True only for a logged-in user whose role is "admin" (Vollzugriff). */
export const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

/**
 * Field-level variant: only admins may read/write the field. Used to lock the
 * `role` field so an editor can never promote themselves to admin.
 */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  user?.role === "admin";

/**
 * Admins may act on any user row; a non-admin (editor) is constrained to their
 * own row, so they can change their own password but cannot see, edit, or delete
 * other accounts.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return { id: { equals: user.id } };
};
