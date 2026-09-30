import type { Attachment } from './attachment.js'
import type { OrderStatus } from './order-status.js'
import type { Recipient } from './recipient.js'

export interface Order {
  id: string
  title: string
  description: string | null
  status: OrderStatus
  latitude: number | null
  longitude: number | null
  street: string
  number: string
  city: string
  neighborhood: string
  state: string
  zip: string
  country: string
  complement: string | null
  pickupDate: Date | null
  deliveryDate: Date | null
  returnDate: Date | null
  createdAt: Date
  updatedAt: Date
  recipientId: string
  courierId: string | null
  deletedAt: Date | null
}

export interface OrderWithRecipient extends Order {
  recipient: Recipient
}

export interface OrderWithRecipientAndAttachments extends OrderWithRecipient {
  attachments: Attachment[]
}

export interface CreateOrderData {
  id?: string
  status?: OrderStatus
  title: string
  description?: string
  recipientId: string
  latitude?: number | null
  longitude?: number | null
  street: string
  number: string
  city: string
  neighborhood: string
  state: string
  zip: string
  country: string
  complement?: string
  courierId?: string
  pickupDate?: Date
  deliveryDate?: Date
  deletedAt?: Date
}

export interface UpdateOrderData {
  id: string
  title?: string
  description?: string
  latitude?: number | null
  longitude?: number | null
  street?: string
  number?: string
  city?: string
  neighborhood?: string
  state?: string
  zip?: string
  country?: string
  complement?: string
  deletedAt?: Date | null
}
