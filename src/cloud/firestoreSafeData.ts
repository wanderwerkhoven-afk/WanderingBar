/**
 * Firestore rejects arrays nested directly inside arrays.
 * Keep the exact original JSON in legacyValue; encode nested arrays only in
 * the separately queryable structured fields using a reversible marker.
 */
export function firestoreSafeData(value: unknown, insideArray = false): unknown {
  if (Array.isArray(value)) {
    if (insideArray) return { __wanderingBarNestedArrayJson: JSON.stringify(value) };
    return value.map(item => firestoreSafeData(item, true));
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, item]) => [key, firestoreSafeData(item, false)]),
    );
  }
  return value;
}
