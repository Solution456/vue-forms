import { defineComponent, onBeforeUnmount, type SlotsType, watch } from 'vue'

import type { FieldContextType, PathContext } from '../types'
import {
  createFieldContext,
  injectFieldContext,
  provideFieldContext
} from '../use-field-context'
import { injectFormContext } from '../use-form-state'

interface FieldProviderSlots {
  default: {
    ctx: FieldContextType
    props: any
  }
}

export const FieldProvider = defineComponent({
  name: 'FieldProvider',
  props: {
    name: {
      type: String,
      required: true
    },
    rules: {
      type: Array,
      default: () => []
    }
  },
  slots: Object as SlotsType<FieldProviderSlots>,
  setup(props, { slots }) {
    const parentField = injectFieldContext()
    const parentForm = injectFormContext()

    const pathContext: PathContext = parentField || parentForm

    const context = createFieldContext(pathContext, () => props.name)
    context.pathContext = pathContext

    provideFieldContext(context)

    watch(
      () => [props.rules, context.path.value],
      ([newRules, newPath], oldValues) => {
        const oldPath = oldValues?.[1]

        // if(newRules) set/unset validators
        // if(oldPath) unset validators
      },
      {
        immediate: true
      }
    )

    const onModelValueChange = (newValue: unknown) => {
      context.value.value = newValue

      // config validate
      if (parentForm.config.validateOnModelUpdate) {
        // validate field
      }
    }

    onBeforeUnmount(() => {
      const currentPath = context.path.value

      parentForm.destroyField(currentPath)
    })

    return () =>
      slots.default
        ? slots.default({
            ctx: context,
            props: {
              modelValue: context.value.value,
              'onUpdate:modelValue': onModelValueChange,
              'error-messages': context.errors.value
            }
          })
        : undefined
  }
})
