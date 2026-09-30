export const Role = { ADMIN: 'ADMIN', COURIER: 'COURIER' } as const
export type Role = (typeof Role)[keyof typeof Role]
