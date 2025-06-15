import {
  computed,
  type InjectionKey,
  type MaybeRefOrGetter,
  provide,
  ref,
  toValue
} from 'vue'

import { getPathFromContext } from './helpers/get-path-from-context'
import { getRootFormContext } from './helpers/get-root-form-context'
import { setInPath } from './helpers/path'
import { injectWithSelf } from './utils/common'
import type { FieldContextType, PathContext } from './types'

const fieldInjectKey: InjectionKey<FieldContextType> = Symbol('FormField')

export function provideFieldContext(context: FieldContextType) {
  provide(fieldInjectKey, context)

  return context
}

export function injectFieldContext() {
  const context = injectWithSelf(fieldInjectKey)

  if (context !== null) return context as FieldContextType

  throw new Error('No field context found')
}

export function createFieldContext<TValue = unknown>(
  context: PathContext,
  keyValue: MaybeRefOrGetter<string>
): FieldContextType<TValue> {
  const key = computed(() => toValue(keyValue))
  const errors = ref<string[]>([])
  const touched = ref(false)
  const dirty = ref(false)

  const formContext = getRootFormContext(context)
  const path = computed(() => getPathFromContext(context, key.value))

  if (!formContext) {
    throw new Error(
      'createFieldContext: No form context found. Must be used inside Form or FormField'
    )
  }

  const value = computed<TValue>({
    get() {
      return formContext.currentState[path.value] as TValue
    },
    set(value) {
      setInPath(formContext.currentState, path.value, value)
    }
  })

  const errorMessage = computed(() => errors.value[0])

  const valid = computed(() => !!errors.value.length)

  return {
    path,
    key,
    value,
    errors,
    errorMessage,
    touched,
    dirty,
    valid
  } satisfies FieldContextType<TValue>
}
