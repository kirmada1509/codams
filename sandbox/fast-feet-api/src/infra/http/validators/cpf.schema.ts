import { z } from 'zod'

const NON_DIGIT_REGEX = /\D/g

const normalizeCpf = (value: string) => value.replace(NON_DIGIT_REGEX, '')

const isValidCpf = (cpf: string) => {
  if (!/^\d{11}$/.test(cpf)) {
    return false
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  const digits = cpf.split('').map((digit) => Number(digit))

  let sum = 0
  for (let index = 0; index < 9; index += 1) {
    sum += digits[index] * (10 - index)
  }

  let remainder = sum % 11
  const firstCheckDigit = remainder < 2 ? 0 : 11 - remainder

  if (digits[9] !== firstCheckDigit) {
    return false
  }

  sum = 0
  for (let index = 0; index < 10; index += 1) {
    sum += digits[index] * (11 - index)
  }

  remainder = sum % 11
  const secondCheckDigit = remainder < 2 ? 0 : 11 - remainder

  return digits[10] === secondCheckDigit
}

export const cpfSchema = z
  .string()
  .trim()
  .transform(normalizeCpf)
  .refine((cpf) => cpf.length === 11, {
    message: 'CPF deve ter 11 digitos',
  })
  .refine(isValidCpf, { message: 'CPF invalido' })
