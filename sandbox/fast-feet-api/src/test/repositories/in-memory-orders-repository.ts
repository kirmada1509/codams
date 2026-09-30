import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import type { CreateOrderData, UpdateOrderData } from '@/domain/entities/order.js'
import type { Order, OrderWithRecipient } from '@/domain/entities/order.js'
import type { OrderStatus } from '@/domain/entities/order-status.js'
import type { InMemoryRecipientsRepository } from './in-memory-recipients-repository.js'
import { randomUUID } from 'node:crypto'

export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []

  constructor(
    private readonly recipientsRepository?: InMemoryRecipientsRepository
  ) {}

  async create(data: CreateOrderData): Promise<void> {
    const order: Order = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? 'WAITING',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      street: data.street,
      number: data.number,
      city: data.city,
      neighborhood: data.neighborhood,
      state: data.state,
      zip: data.zip,
      country: data.country,
      complement: data.complement ?? null,
      pickupDate: data.pickupDate ?? null,
      deliveryDate: data.deliveryDate ?? null,
      returnDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      recipientId: data.recipientId,
      courierId: data.courierId ?? null,
      deletedAt: null,
    }

    this.items.push(order)

    return Promise.resolve()
  }

  findById(
    id: string,
    params?: { showDeleted?: boolean }
  ): Promise<Order | null> {
    const order = this.items.find((item) => item.id === id)

    if (!order) {
      return Promise.resolve(null)
    }

    if (order.deletedAt !== null && !params?.showDeleted) {
      return Promise.resolve(null)
    }

    return Promise.resolve(order)
  }

  async findByIdWithRecipient(
    id: string,
    params?: { showDeleted?: boolean }
  ): Promise<OrderWithRecipient | null> {
    const order = this.items.find((item) => item.id === id)
    if (!order) return null

    if (order.deletedAt !== null && !params?.showDeleted) {
      return null
    }

    const recipient = await this.recipientsRepository?.findById(order.recipientId)
    if (!recipient) return null

    return { ...order, recipient }
  }

  findMany({
    page,
    perPage,
    status,
    search,
    showDeleted,
  }: {
    page: number
    perPage: number
    status?: OrderStatus
    search?: string
    showDeleted?: boolean
  }): Promise<{ orders: Order[]; total: number }> {
    const filtered = this.items
      .filter((order) => {
        if (order.deletedAt !== null && !showDeleted) return false
        if (status && order.status !== status) return false
        if (search && !this.matchesSearch(order, search)) return false
        return true
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const start = (page - 1) * perPage
    const orders = filtered.slice(start, start + perPage)

    return Promise.resolve({ orders, total: filtered.length })
  }

  private matchesSearch(order: Order, search: string): boolean {
    const lower = search.toLowerCase()
    return (
      order.title.toLowerCase().includes(lower) ||
      order.street.toLowerCase().includes(lower) ||
      order.neighborhood.toLowerCase().includes(lower) ||
      order.city.toLowerCase().includes(lower) ||
      order.state.toLowerCase().includes(lower) ||
      order.zip.toLowerCase().includes(lower)
    )
  }

  async findManyAvailable({
    page,
    perPage,
    search,
  }: {
    page: number
    perPage: number
    search?: string
  }): Promise<{ orders: Order[]; total: number }> {
    const filtered = this.items
      .filter((order) => {
        if (order.deletedAt !== null) return false
        if (order.status !== 'WAITING' || order.courierId !== null) return false
        if (search && !this.matchesSearch(order, search)) return false
        return true
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const start = (page - 1) * perPage
    return {
      orders: filtered.slice(start, start + perPage),
      total: filtered.length,
    }
  }

  findManyByCourierId({
    courierId,
    page,
    perPage,
    status,
    search,
  }: {
    courierId: string
    page: number
    perPage: number
    status?: OrderStatus
    search?: string
  }): Promise<{ orders: Order[]; total: number }> {
    const filtered = this.items
      .filter((order) => {
        if (order.deletedAt !== null) return false
        if (order.courierId !== courierId) return false
        if (status && order.status !== status) return false
        if (search && !this.matchesSearch(order, search)) return false
        return true
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const start = (page - 1) * perPage

    return Promise.resolve({
      orders: filtered.slice(start, start + perPage),
      total: filtered.length,
    })
  }

  save(data: UpdateOrderData): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === data.id)

    if (itemIndex >= 0) {
      const currentOrder = this.items[itemIndex]
      this.items[itemIndex] = {
        ...currentOrder,
        title: data.title ?? currentOrder.title,
        description:
          data.description !== undefined
            ? data.description
            : currentOrder.description,
        latitude: data.latitude ?? currentOrder.latitude,
        longitude: data.longitude ?? currentOrder.longitude,
        street: data.street ?? currentOrder.street,
        number: data.number ?? currentOrder.number,
        city: data.city ?? currentOrder.city,
        neighborhood: data.neighborhood ?? currentOrder.neighborhood,
        state: data.state ?? currentOrder.state,
        zip: data.zip ?? currentOrder.zip,
        country: data.country ?? currentOrder.country,
        complement:
          data.complement !== undefined
            ? data.complement
            : currentOrder.complement,
        deletedAt:
          data.deletedAt !== undefined ? data.deletedAt : currentOrder.deletedAt,
        updatedAt: new Date(),
      }
    }

    return Promise.resolve()
  }

  delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
    return Promise.resolve()
  }

  updateStatus(id: string, status: OrderStatus): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === id)

    if (itemIndex >= 0) {
      const isWaiting = status === 'WAITING'
      this.items[itemIndex] = {
        ...this.items[itemIndex],
        status,
        ...(isWaiting && {
          courierId: null,
          pickupDate: null,
          returnDate: null,
        }),
        updatedAt: new Date(),
      }
    }

    return Promise.resolve()
  }

  async withdraw(id: string, courierId: string, pickupDate: Date) {
    const itemIndex = this.items.findIndex((item) => item.id === id)

    if (itemIndex >= 0) {
      this.items[itemIndex] = {
        ...this.items[itemIndex],
        status: 'WITHDRAWN',
        courierId,
        pickupDate,
        updatedAt: new Date(),
      }
    }
  }

  async deliver(id: string, deliveryDate: Date) {
    const itemIndex = this.items.findIndex((item) => item.id === id)

    if (itemIndex >= 0) {
      this.items[itemIndex] = {
        ...this.items[itemIndex],
        status: 'DELIVERED',
        deliveryDate,
        updatedAt: new Date(),
      }
    }
  }

  async return(id: string, returnDate: Date) {
    const itemIndex = this.items.findIndex((item) => item.id === id)

    if (itemIndex >= 0) {
      this.items[itemIndex] = {
        ...this.items[itemIndex],
        status: 'RETURNED',
        returnDate,
        updatedAt: new Date(),
      }
    }
  }

  async countByCourierId(courierId: string) {
    const available = this.items.filter(
      (o) =>
        o.deletedAt === null && o.status === 'WAITING' && o.courierId === null
    ).length
    const withdrawn = this.items.filter(
      (o) =>
        o.deletedAt === null &&
        o.courierId === courierId &&
        o.status === 'WITHDRAWN'
    ).length
    const delivered = this.items.filter(
      (o) =>
        o.deletedAt === null &&
        o.courierId === courierId &&
        o.status === 'DELIVERED'
    ).length

    return { available, withdrawn, delivered }
  }
}
