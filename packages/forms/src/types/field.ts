import type { ComputedRef, Ref } from 'vue'

import type { PathContext } from './path'

export interface FieldMeta {
  touched: boolean
  dirty: boolean
  valid: boolean
}

export type FieldContextType<TValue = unknown> = {
  key: ComputedRef<string>
  path: ComputedRef<string>
  value: Ref<TValue | undefined>
  touched: Ref<boolean>
  dirty: Ref<boolean>
  valid: ComputedRef<boolean>
  errors: Ref<string[]>
  errorMessage: Ref<string | undefined>
  pathContext?: PathContext
}
