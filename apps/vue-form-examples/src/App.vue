<script setup lang="ts">
import { FieldProvider, FormProvider, useFormState } from '@repo/forms'

const form = useFormState()
form.setInitialState({
  name: 'test',
  email: 'email',
  password: 'Gig'
})

form.onSubmit((values) => {
  console.log('values', values)
})
</script>

<template>
  <main>
    <FormProvider>
      <FieldProvider
        v-slot="{ ctx }"
        name="name"
      >
        <input
          v-model="ctx.value.value"
          type="text"
        />
      </FieldProvider>
      <FieldProvider
        v-slot="{ ctx }"
        name="email"
      >
        <input
          v-model="ctx.value.value"
          type="text"
        />
      </FieldProvider>
      <FieldProvider
        v-slot="{ ctx }"
        name="password"
      >
        <input
          v-model="ctx.value.value"
          type="text"
        />
      </FieldProvider>
    </FormProvider>

    <div>
      <button @click="form.submit">Submit</button>
      <button @click="form.resetForm">resetForm</button>
    </div>
    <div>
      <pre>{{ form.currentState }}</pre>
    </div>
  </main>
</template>

<style scoped></style>
