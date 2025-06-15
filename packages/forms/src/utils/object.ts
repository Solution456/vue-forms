import { cloneDeep } from 'es-toolkit'

export const cleanObject = (input: Record<string, any>) => {
  ;[...Object.keys(input), ...Object.getOwnPropertySymbols(input)].forEach(
    (key: any) => {
      delete input[key]
    }
  )
}

export const deepClone = <T>(input: T): T => cloneDeep(input)
