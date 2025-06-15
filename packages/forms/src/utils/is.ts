export function isNullOrUndefined(value: unknown): value is undefined | null {
  return value === null || value === undefined
}

export function isIndex(value: unknown): value is number {
  return Number(value) >= 0
}

export function isContainerValue(
  value: unknown
): value is Record<string, unknown> {
  return isObject(value) || Array.isArray(value)
}

export const isObject = (obj: unknown): obj is Record<string, unknown> =>
  obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)

/**
 * Checks if the path opted out of nested fields using `[fieldName]` syntax
 */
export function isNotNestedPath(path: string) {
  return /^\[.+\]$/.test(path)
}
