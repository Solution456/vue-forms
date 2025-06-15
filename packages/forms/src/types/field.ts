import type { Ref } from 'vue'

export type FormField<TValue = unknown> = {
  key: string
  value: Ref<TValue | undefined>
  valid: Ref<boolean>
  dirty: Ref<boolean>
  errors: Ref<string[]>
}
