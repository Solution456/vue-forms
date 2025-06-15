import type { PathContext } from '../types'

export function getPathFromContext(context: PathContext, key?: string) {
  const result: string[] = []

  let currentContext: PathContext | undefined = context

  while (currentContext) {
    if ('key' in currentContext) {
      result.push(currentContext.key.value)
    }

    currentContext = currentContext.pathContext
  }

  if (key) {
    result.push(key)
  }

  return result.join('.')
}
