import { Injectable } from '@nestjs/common'
import type {
  Order,
  OrderWithRecipient,
  CreateOrderData,
  UpdateOrderData,
} from '@/domain/entities/order.js'
import type { OrderStatus } from '@/domain/entities/order-status.js'

@Injectable()
export abstract class OrdersRepository {
  abstract create(data: CreateOrderData): Promise<void>
  abstract findById(
    id: string,
    params?: { showDeleted?: boolean }
  ): Promise<Order | null>
  abstract findByIdWithRecipient(
    id: string,
    params?: { showDeleted?: boolean }
  ): Promise<OrderWithRecipient | null>
  abstract findMany(params: {
    page: number
    perPage: number
    status?: OrderStatus
    search?: string
    showDeleted?: boolean
  }): Promise<{ orders: Order[]; total: number }>
  abstract findManyAvailable(params: {
    page: number
    perPage: number
    search?: string
  }): Promise<{ orders: Order[]; total: number }>
  abstract findManyByCourierId(params: {
    courierId: string
    page: number
    perPage: number
    status?: OrderStatus
    search?: string
  }): Promise<{ orders: Order[]; total: number }>
  abstract save(data: UpdateOrderData): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract updateStatus(id: string, status: OrderStatus): Promise<void>
  abstract withdraw(
    id: string,
    courierId: string,
    pickupDate: Date
  ): Promise<void>
  abstract deliver(id: string, deliveryDate: Date): Promise<void>
  abstract return(id: string, returnDate: Date): Promise<void>
  abstract countByCourierId(courierId: string): Promise<{
    available: number
    withdrawn: number
    delivered: number
  }>
}
