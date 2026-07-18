// Team descriptions are editable in the Payload admin. A reseed must not
// silently overwrite a description a club editor already set there.
export function shouldPreserveExistingDescription(
  existingDescription: unknown,
): boolean {
  return Boolean(existingDescription);
}
