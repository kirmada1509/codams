export const OrderStatus = {
  PENDING: 'PENDING',
  WAITING: 'WAITING',
  WITHDRAWN: 'WITHDRAWN',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
