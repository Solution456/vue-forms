import {
  isContainerValue,
  isIndex,
  isNotNestedPath,
  isNullOrUndefined
} from '../utils/is'

/**
 * Gets a nested property value from an object
 * https://github.com/logaretm/vee-validate/blob/main/packages/vee-validate/src/utils/common.ts#L33
 */
export function getFromPath<TValue = unknown>(
  object: NestedRecord | undefined,
  path: string
): TValue | undefined
export function getFromPath<TValue = unknown, TFallback = TValue>(
  object: NestedRecord | undefined,
  path: string,
  fallback?: TFallback
): TValue | TFallback
export function getFromPath<TValue = unknown, TFallback = TValue>(
  object: NestedRecord | undefined,
  path: string,
  fallback?: TFallback
): TValue | TFallback | undefined {
  if (!object) {
    return fallback
  }

  if (isNotNestedPath(path)) {
    return object[cleanupNonNestedPath(path)] as TValue | undefined
  }

  const resolvedValue = (path || '')
    .split(/\.|\[(\d+)\]/)
    .filter(Boolean)
    .reduce((acc, propKey) => {
      if (isContainerValue(acc) && propKey in acc) {
        return acc[propKey]
      }

      return fallback
    }, object as unknown)

  return resolvedValue as TValue | undefined
}

type NestedRecord = Record<string, unknown> | { [k: string]: NestedRecord }
/**
 * Sets a nested property value in a path, creates the path properties if it doesn't exist
 * https://github.com/logaretm/vee-validate/blob/main/packages/vee-validate/src/utils/common.ts#L69
 */

export function setInPath(
  object: NestedRecord,
  path: string,
  value: unknown
): void {
  if (isNotNestedPath(path)) {
    object[cleanupNonNestedPath(path)] = value
    return
  }

  const keys = path.split(/\.|\[(\d+)\]/).filter(Boolean)
  let acc: Record<string, unknown> = object
  for (let i = 0; i < keys.length; i++) {
    // Last key, set it
    if (i === keys.length - 1) {
      acc[keys[i]] = value
      return
    }

    // Key does not exist, create a container for it
    if (!(keys[i] in acc) || isNullOrUndefined(acc[keys[i]])) {
      // container can be either an object or an array depending on the next key if it exists
      acc[keys[i]] = isIndex(keys[i + 1]) ? [] : {}
    }

    acc = acc[keys[i]] as Record<string, unknown>
  }
}

export function cleanupNonNestedPath(path: string) {
  if (isNotNestedPath(path)) {
    return path.replaceAll(/\[|\]/g, '')
  }

  return path
}
