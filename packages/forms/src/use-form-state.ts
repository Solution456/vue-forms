import {
  computed,
  inject,
  type InjectionKey,
  provide,
  reactive,
  ref,
  type ShallowReactive,
  type ShallowRef,
  shallowRef
} from 'vue'

import { getFromPath, setInPath } from './helpers/path'
import { cleanObject, deepClone } from './utils/object'
import type { Data, FormConfig, FormContextType, FormSubmitImpl } from './types'

const formInjectKey: InjectionKey<FormContextType | null> = Symbol('formState')

export function provideFormContext(contextValue: any) {
  provide(formInjectKey, contextValue)
  return contextValue as FormContextType
}

export function injectFormContext() {
  const context = inject(formInjectKey)

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
  const dirty = reactive<Record<string, boolean>>({})
  const touched = reactive<Record<string, boolean>>({})
  const errors = reactive<Record<string, string>>({})
  const pending = ref(false)

  const submitError = computed(() => errors['@submitForm']?.[0])

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
        delete errors['@submitForm']
      } catch (error) {
        errors['@submitForm'] = [error.message]
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
      for (const value of Object.values(dirty)) {
        if (value) return true
      }

      return false
    }),

    valid: computed(() => {
      for (const value of Object.values(errors)) {
        if (value) return false
      }

      return true
    })
  }

  const setFieldValue = (path: string, value: unknown) => {
    setInPath(currentState, path, value)

    const oldValue = getFromPath(initialState.value as any, path)

    const isDirty = oldValue !== value

    if (isDirty) {
      dirty[path] = isDirty
    } else {
      delete dirty[path]
    }
  }

  const getFieldValue = <TValue = unknown>(path: string): TValue => {
    return getFromPath(currentState, path) as TValue
  }

  const resetForm = () => {
    cleanObject(currentState)
    cleanObject(errors)
    cleanObject(dirty)
    cleanObject(touched)

    Object.assign(currentState, deepClone(initialState.value))
  }

  // TODO
  const validateForm = async () => {
    return false
  }

  const setInitialState = (state: TState) => {
    initialState.value = state
    resetForm()
  }

  const destroyField = (path: string) => {
    delete errors[path]
    delete dirty[path]
    delete touched[path]

    setFieldValue(path, undefined)
  }

  return {
    initialState,
    currentState,
    meta,
    dirty,
    touched,
    errors,
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
