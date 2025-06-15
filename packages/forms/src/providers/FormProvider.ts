import { defineComponent } from 'vue'

import type { PathContext } from '../types'
import { injectFieldContext } from '../use-field-context'
import {
  createFormContext,
  injectFormContext,
  provideFormContext
} from '../use-form-state'

export const FormProvider = defineComponent({
  name: 'FormProvider',
  setup(_, { slots }) {
    const parentField = injectFieldContext()
    const parentForm = injectFormContext()

    const pathContext: PathContext | undefined = parentField || parentForm

    const context = createFormContext()
    context.pathContext = pathContext

    provideFormContext(context)

    return () => (slots.default ? slots.default() : undefined)
  }
})
