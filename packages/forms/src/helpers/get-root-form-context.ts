import type { FormContextType, PathContext } from '../types'

export function getRootFormContext(
  context: PathContext
): FormContextType | undefined {
  let result: FormContextType | undefined
  let currentContext: PathContext | undefined = context

  while (currentContext) {
    if ('initialState' in currentContext) {
      result = currentContext
    }

    currentContext = currentContext.pathContext
  }

  return result
}
