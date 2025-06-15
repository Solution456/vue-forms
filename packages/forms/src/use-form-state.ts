import {
  computed,
  type InjectionKey,
  provide,
  reactive,
  ref,
  type ShallowReactive,
  type ShallowRef,
  shallowRef
} from 'vue'

import { getFromPath, setInPath } from './helpers/path'
import { injectWithSelf } from './utils/common'
import { cleanObject, deepClone } from './utils/object'
import type { Data, FormConfig, FormContextType, FormSubmitImpl } from './types'

const formInjectKey: InjectionKey<FormContextType | null> = Symbol('formState')

export function provideFormContext(contextValue: any) {
  provide(formInjectKey, contextValue)
  return contextValue as FormContextType
}

export function injectFormContext() {
  const context = injectWithSelf(formInjectKey)

  if (context !== null) return context as FormContextType

  throw new Error('No form context found')
}

export function useFormState<
  TState extends object = Data
>(): FormContextType<TState> {
  let context = injectFormContext()

  if (!context) {
    context = createFormContext()
    provideFormContext(context)
  }

  return context as FormContextType<TState>
}

export function createFormContext<
  TState extends object = Data
>(): FormContextType<TState> {
  const initialState = shallowRef({}) as ShallowRef<TState>
  const currentState = reactive({}) as ShallowReactive<TState>
  // const dirty = reactive<Record<string, boolean>>({})
  // const touched = reactive<Record<string, boolean>>({})
  // const errors = reactive<Record<string, string>>({})
  const pending = ref(false)

  const submitError = ref<string | undefined>(undefined)

  let submitImpl: FormSubmitImpl<TState> | undefined = undefined
  const onSubmit = (cb: FormSubmitImpl<TState>) => {
    submitImpl = cb
  }

  const submit = async () => {
    if (pending.value) return false
    const isValid = await validateForm()

    pending.value = true

    if (!isValid) {
      pending.value = false
      return false
    }
    let hasErrors = false

    if (submitImpl) {
      try {
        await submitImpl(currentState)
        submitError.value = undefined
      } catch (error) {
        submitError.value = String(error)
        hasErrors = true
      }
    }

    pending.value = false

    return !hasErrors
  }

  const config: FormConfig = {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnInput: true,
    validateOnModelUpdate: true
  }

  const meta: FormContextType<TState>['meta'] = {
    pending: computed(() => pending.value),
    submitError,
    dirty: computed(() => {
      for (const field of Object.values(fieldRegister)) {
        if (field.dirty) return true
      }

      return false
    }),

    valid: computed(() => {
      for (const field of Object.values(fieldRegister)) {
        if (field.errors.length) return false
      }

      return true
    })
  }

  const setFieldValue = (path: string, newValue: unknown) => {
    setInPath(currentState, path, newValue)

    const oldValue = getFromPath(initialState.value as any, path)

    const field = fieldRegister[path]

    if (field) {
      field.dirty = newValue !== oldValue
    }
  }

  const fieldRegister: FormContextType<TState>['fieldRegister'] = reactive({})

  const getFieldValue = <TValue = unknown>(path: string): TValue => {
    return getFromPath(currentState, path) as TValue
  }

  const resetForm = () => {
    cleanObject(currentState)

    for (const field of Object.values(fieldRegister)) {
      field.errors = []
      field.dirty = false
      field.touched = false
    }

    Object.assign(currentState, deepClone(initialState.value))
  }

  // TODO
  const validateForm = async () => {
    return true
  }

  const setInitialState = (state: TState) => {
    initialState.value = state
    resetForm()
  }

  const destroyField = (path: string) => {
    delete fieldRegister[path]

    setFieldValue(path, undefined)
  }

  return {
    initialState,
    currentState,
    fieldRegister,
    meta,
    pathContext: undefined,
    config,
    submit,
    onSubmit,
    setFieldValue,
    getFieldValue,
    setInitialState,
    resetForm,
    validateForm,
    destroyField
  }
}
