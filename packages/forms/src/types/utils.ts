import type { Ref } from 'vue'

export type Data = Record<string, unknown>

export type Awaitable<T> = Promise<T> | T

export type AnyFunction = (...args: any[]) => any

export type MaybeRef<T> = T | Ref<T>
