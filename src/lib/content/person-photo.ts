/** A photo the team actually stored. Prototype and demo portraits are not one. */
export function uploadedPersonPhoto(url: string | null | undefined): string | null {
  const value = url?.trim() ?? '';
  if (!value || value.includes('/prototype/')) return null;
  return value;
}
