/**
 * Extracts a display-friendly first name from an email address.
 * Used across all role overview pages for personalised greetings.
 */
export function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
