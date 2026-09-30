import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'
import type { CreateOrderData } from '@/domain/entities/order.js'
import type { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import type { OrderStatus } from '@/domain/entities/order-status.js'
import { Prisma } from '@/generated/prisma/client.js'

export function makeOrderData(
  overrides?: Partial<CreateOrderData>
): CreateOrderData {
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    status: 'WAITING',
    recipientId: faker.string.uuid(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    street: faker.location.street(),
    number: String(faker.number.int({ min: 1, max: 9999 })),
    city: faker.location.city(),
    neighborhood: faker.location.county(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode(),
    country: faker.location.country(),
    ...overrides,
  }
}

export interface MakeOrderInput {
  id?: string
  title?: string
  description?: string | null
  status?: OrderStatus
  latitude?: number
  longitude?: number
  street?: string
  number?: string
  city?: string
  neighborhood?: string
  state?: string
  zip?: string
  country?: string
  complement?: string | null
  pickupDate?: Date | null
  deliveryDate?: Date | null
  recipientId: string
  courierId?: string | null
}

export interface MakeOrderOutput {
  id: string
  title: string
  description: string | null
  status: OrderStatus
  latitude: number
  longitude: number
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
  recipientId: string
  courierId: string | null
}

let orderCounter = 0

export async function makeOrder(
  prisma: PrismaService,
  input: MakeOrderInput
): Promise<MakeOrderOutput> {
  orderCounter++

  const id = input.id ?? randomUUID()
  const title = input.title ?? `Entrega ${orderCounter}`
  const description = input.description !== undefined ? input.description : null
  const status = input.status ?? 'WAITING'
  const latitude = input.latitude ?? -23.55052
  const longitude = input.longitude ?? -46.633308
  const street = input.street ?? `Rua Teste ${orderCounter}`
  const number = input.number ?? `${orderCounter}`
  const city = input.city ?? 'São Paulo'
  const neighborhood = input.neighborhood ?? 'Centro'
  const state = input.state ?? 'SP'
  const zip = input.zip ?? '01310100'
  const country = input.country ?? 'Brasil'
  const complement = input.complement !== undefined ? input.complement : null
  const pickupDate = input.pickupDate !== undefined ? input.pickupDate : null
  const deliveryDate =
    input.deliveryDate !== undefined ? input.deliveryDate : null
  const courierId = input.courierId !== undefined ? input.courierId : null

  await prisma.order.create({
    data: {
      id,
      title,
      description,
      status,
      latitude: new Prisma.Decimal(latitude),
      longitude: new Prisma.Decimal(longitude),
      street,
      number,
      city,
      neighborhood,
      state,
      zip,
      country,
      complement,
      pickupDate,
      deliveryDate,
      recipientId: input.recipientId,
      courierId,
    },
  })

  return {
    id,
    title,
    description,
    status,
    latitude,
    longitude,
    street,
    number,
    city,
    neighborhood,
    state,
    zip,
    country,
    complement,
    pickupDate,
    deliveryDate,
    recipientId: input.recipientId,
    courierId,
  }
}
