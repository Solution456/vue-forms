import type { ComputedRef, Ref, ShallowRef } from 'vue'

import type { PathContext } from './path'
import type { Awaitable, Data } from './utils'

export type FormSubmitImpl<TState extends object = Data> = (
  values: TState
) => Awaitable<void>

export type FormConfig = {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnInput?: boolean
  validateOnModelUpdate?: boolean
}

export type FormContextType<TState extends object = Data> = {
  initialState: ShallowRef<TState>
  currentState: TState
  meta: {
    dirty: Ref<boolean>
    valid: Ref<boolean>
    submitError: ComputedRef<string | undefined>
    pending: ComputedRef<boolean>
  }
  dirty: Record<string, boolean>
  touched: Record<string, boolean>
  errors: Record<string, string>
  config: FormConfig
  pathContext?: PathContext
  submit: () => Promise<boolean>
  onSubmit: (cb: FormSubmitImpl<TState>) => void
  setFieldValue: (path: string, value: unknown) => void
  getFieldValue: <TValue = unknown>(path: string) => TValue
  setInitialState: (state: TState) => void
  resetForm: () => void
  validateForm: () => Awaitable<boolean>
  destroyField: (path: string) => void
}
