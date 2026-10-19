import type { Access, FieldAccess } from "payload";

export const authenticated: Access = ({ req: { user } }) => Boolean(user);

/** Field-level variant: hides the field from anonymous API reads. */
export const authenticatedField: FieldAccess = ({ req: { user } }) =>
  Boolean(user);
