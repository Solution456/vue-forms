import {
  inject,
  type InjectionKey,
  provide,
  reactive,
  type Ref,
  ref,
  type ShallowReactive,
  type ShallowRef,
  shallowRef
} from 'vue'

import type { FormField } from './types/field'
import type { Data } from './types'

export type FormContext<TState extends object = Data> = {
  initialState: ShallowRef<TState>
  currentState: TState
  dirty: Ref<boolean>
  valid: Ref<boolean>
  fieldsMap: Map<string, FormField>
  errorsMap: Map<string, string[]>
}

const formInjectKey: InjectionKey<FormContext | null> = Symbol('formState')

function provideFormContext(contextValue: any) {
  provide(formInjectKey, contextValue)
  return contextValue as FormContext
}

function injectFormContext() {
  const context = inject(formInjectKey)

  if (context !== null) return context

  throw new Error('No form context found')
}

export function useFormState<
  TState extends object = Data
>(): FormContext<TState> {
  let context = injectFormContext()

  if (!context) {
    context = createFormContext()
    provideFormContext(context)
  }

  return context as FormContext<TState>
}

export function createFormContext<
  TState extends object
>(): FormContext<TState> {
  const context: FormContext<TState> = {
    initialState: shallowRef({}) as ShallowRef<TState>,
    currentState: reactive({}) as ShallowReactive<TState>,
    dirty: ref(false),
    valid: ref(false),
    fieldsMap: reactive(new Map()),
    errorsMap: reactive(new Map())
  }

  return context
}

export function createFormField<TValue = unknown>(
  key: string
): FormField<TValue> {
  return {
    key,
    value: ref(undefined),
    valid: ref(false),
    dirty: ref(false),
    errors: ref([])
  }
}
