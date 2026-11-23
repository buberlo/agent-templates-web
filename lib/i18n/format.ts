export function formatMessage(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (acc, [key, val]) => acc.replace(`{${key}}`, String(val)),
    template,
  );
}